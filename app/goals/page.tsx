import { supabase } from '@/lib/supabase'
import { GoalsClient } from './goals-client'
import { subDays } from 'date-fns'

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

interface Goal {
    id: string
    title: string
    description: string | null
    status: string
    display_order: number
}

export interface GoalHabit {
    habit_id: string
    habit_name: string
    contribution_weight: number
    completions_7d: number
    completion_rate: number
}

export interface GoalWithProgress extends Goal {
    habits: GoalHabit[]
    progress: number
}

async function loadGoals(): Promise<GoalWithProgress[]> {
    try {
        // Get all active goals for user
        const { data: goalsData, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', USER_ID)
            .eq('status', 'active')
            .order('display_order')

        if (goalsError) {
            console.error('Goals error:', goalsError)
            throw goalsError
        }

        if (!goalsData || goalsData.length === 0) {
            return []
        }

        // Get all goal_habits with habit details
        const { data: goalHabitsData, error: goalHabitsError } = await supabase
            .from('goal_habits')
            .select(`
                goal_id,
                habit_id,
                contribution_weight,
                habits (
                    id,
                    name
                )
            `)
            .in('goal_id', goalsData.map(g => g.id))

        if (goalHabitsError) {
            console.error('Goal habits error:', goalHabitsError)
            throw goalHabitsError
        }

        // Get last 7 days of completions for linked habits
        const today = new Date()
        const sevenDaysAgo = subDays(today, 6) // Include today = 7 days total
        const habitIds = [...new Set((goalHabitsData || []).map(gh => gh.habit_id))]

        const { data: completionsData, error: completionsError } = await supabase
            .from('habit_completions')
            .select('habit_id, completion_date')
            .eq('user_id', USER_ID)
            .in('habit_id', habitIds)
            .gte('completion_date', sevenDaysAgo.toISOString().split('T')[0])
            .lte('completion_date', today.toISOString().split('T')[0])

        if (completionsError) {
            console.error('Completions error:', completionsError)
            throw completionsError
        }

        // Count completions per habit
        const completionCounts = new Map<string, number>()
        for (const c of completionsData || []) {
            const count = completionCounts.get(c.habit_id) || 0
            completionCounts.set(c.habit_id, count + 1)
        }

        // Build goals with progress
        const goalsWithProgress: GoalWithProgress[] = goalsData.map(goal => {
            // Get habits for this goal
            const goalHabits = (goalHabitsData || [])
                .filter(gh => gh.goal_id === goal.id)
                .map(gh => {
                    const completions = completionCounts.get(gh.habit_id) || 0
                    const rate = Math.round((completions / 7) * 100)
                    // Handle Supabase nested data - can be object or array depending on relationship
                    const habitsData = gh.habits as unknown
                    const habitName = Array.isArray(habitsData)
                        ? (habitsData[0] as { name: string } | undefined)?.name
                        : (habitsData as { name: string } | null)?.name
                    return {
                        habit_id: gh.habit_id,
                        habit_name: habitName || 'Unknown',
                        contribution_weight: gh.contribution_weight,
                        completions_7d: completions,
                        completion_rate: rate,
                    }
                })

            // Calculate weighted progress
            let totalWeight = 0
            let weightedSum = 0
            for (const h of goalHabits) {
                totalWeight += h.contribution_weight
                weightedSum += h.completion_rate * h.contribution_weight
            }
            const progress = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0

            return {
                ...goal,
                habits: goalHabits,
                progress,
            }
        })

        return goalsWithProgress
    } catch (error) {
        console.error('Error loading goals:', error)
        return []
    }
}

export default async function GoalsPage() {
    const goals = await loadGoals()

    return <GoalsClient goals={goals} />
}
