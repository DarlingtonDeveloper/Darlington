import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from './analytics-client'
import type { HabitStreak, WeeklyStat, CompletionTimePattern, DailyCompletionRate, PersonalRecords, Habit, EnergyCorrelation } from '@/types/database'
import { subDays, format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface HabitCompletion {
    habit_id: string
    completion_date: string
    completion_percentage: number
    notes: string | null
}

interface HabitWithGoals {
    id: string
    name: string
    category: string | null
    goal_habits: Array<{
        goals: {
            id: string
            title: string
        }
    }>
}

interface AnalyticsData {
    streaks: HabitStreak[]
    weeklyStats: WeeklyStat[]
    timePatterns: CompletionTimePattern[]
    totalCompletions: number
    // Data for enhanced Overview
    dailyRates: DailyCompletionRate[]
    personalRecords: PersonalRecords | null
    todayCompletedHabitIds: string[]
    totalActiveHabits: number
    // Data for Habits tab
    habits: Habit[]
    recentCompletions: HabitCompletion[]
    habitGoals: HabitWithGoals[]
    // Data for Insights tab
    energyCorrelation: EnergyCorrelation[]
}

async function loadAnalytics(userId: string): Promise<AnalyticsData> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')

    try {
        // Fetch all analytics data in parallel
        const [
            streaksRes,
            weeklyRes,
            patternsRes,
            completionsRes,
            dailyRatesRes,
            personalRecordsRes,
            todayCompletionsRes,
            activeHabitsRes,
            habitsRes,
            recentCompletionsRes,
            habitGoalsRes,
            energyCorrelationRes,
        ] = await Promise.all([
            // Existing queries
            supabase
                .from('habit_streaks')
                .select('*'),
            supabase
                .from('weekly_stats')
                .select('*')
                .order('week_start', { ascending: false })
                .limit(56),
            supabase
                .from('completion_time_patterns')
                .select('*'),
            supabase
                .from('habit_completions')
                .select('id', { count: 'exact' })
                .eq('user_id', userId),
            // Queries for enhanced Overview
            supabase
                .from('daily_completion_rates')
                .select('*')
                .order('completion_date', { ascending: false })
                .limit(30),
            supabase
                .from('personal_records')
                .select('*')
                .single(),
            supabase
                .from('habit_completions')
                .select('habit_id')
                .eq('user_id', userId)
                .eq('completion_date', today),
            supabase
                .from('habits')
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('is_active', true),
            // Queries for Habits tab
            supabase
                .from('habits')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('display_order'),
            supabase
                .from('habit_completions')
                .select('habit_id, completion_date, completion_percentage, notes')
                .eq('user_id', userId)
                .gte('completion_date', sevenDaysAgo)
                .lte('completion_date', today)
                .order('completion_date', { ascending: false }),
            supabase
                .from('habits')
                .select(`
                    id,
                    name,
                    category,
                    goal_habits (
                        goals (
                            id,
                            title
                        )
                    )
                `)
                .eq('user_id', userId)
                .eq('is_active', true),
            // Query for Insights tab
            supabase
                .from('energy_correlation')
                .select('*'),
        ])

        if (streaksRes.error) console.error('Streaks error:', streaksRes.error)
        if (weeklyRes.error) console.error('Weekly error:', weeklyRes.error)
        if (patternsRes.error) console.error('Patterns error:', patternsRes.error)
        // Don't log errors for new views that may not exist yet
        if (dailyRatesRes.error && !dailyRatesRes.error.message.includes('does not exist')) {
            console.error('Daily rates error:', dailyRatesRes.error)
        }
        if (personalRecordsRes.error && !personalRecordsRes.error.message.includes('does not exist')) {
            console.error('Personal records error:', personalRecordsRes.error)
        }

        const todayCompletedIds = (todayCompletionsRes.data || []).map(c => c.habit_id)

        return {
            streaks: (streaksRes.data || []) as HabitStreak[],
            weeklyStats: (weeklyRes.data || []) as WeeklyStat[],
            timePatterns: (patternsRes.data || []) as CompletionTimePattern[],
            totalCompletions: completionsRes.count || 0,
            dailyRates: (dailyRatesRes.data || []) as DailyCompletionRate[],
            personalRecords: personalRecordsRes.data as PersonalRecords | null,
            todayCompletedHabitIds: todayCompletedIds,
            totalActiveHabits: activeHabitsRes.count || 0,
            habits: (habitsRes.data || []) as Habit[],
            recentCompletions: (recentCompletionsRes.data || []) as HabitCompletion[],
            habitGoals: (habitGoalsRes.data || []) as unknown as HabitWithGoals[],
            energyCorrelation: (energyCorrelationRes.data || []) as EnergyCorrelation[],
        }
    } catch (error) {
        console.error('Error loading analytics:', error)
        return {
            streaks: [],
            weeklyStats: [],
            timePatterns: [],
            totalCompletions: 0,
            dailyRates: [],
            personalRecords: null,
            todayCompletedHabitIds: [],
            totalActiveHabits: 0,
            habits: [],
            recentCompletions: [],
            habitGoals: [],
            energyCorrelation: [],
        }
    }
}

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const data = await loadAnalytics(user.id)

    return <AnalyticsClient {...data} />
}
