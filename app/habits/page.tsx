import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HabitsClient } from './habits-client'
import { subDays } from 'date-fns'

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic'

interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string | null
  target_frequency: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface HabitStep {
  id: string
  habit_id: string
  name: string
  display_order: number
  duration_seconds: number | null
  description: string | null
}

interface HabitWithStatus extends Habit {
  completed_today: boolean
  completion_id?: string
  completed_at?: string
  completion_percentage?: number
  notes?: string | null
  steps?: HabitStep[]
  completedStepIds?: string[]
}

async function loadHabits(userId: string): Promise<{ habits: HabitWithStatus[], date: string }> {
  const supabase = await createClient()

  try {
    // Use local date string to match user's expectation
    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format
    const yesterday = subDays(new Date(), 1).toLocaleDateString('en-CA')

    // Get all habits
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('display_order')

    if (habitsError) {
      console.error('Habits error:', habitsError)
      throw habitsError
    }

    // Get today's completions, yesterday's completions (for ordering), steps, and step completions
    const [todayResult, yesterdayResult, stepsResult, stepCompletionsResult] = await Promise.all([
      supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('completion_date', today),
      supabase
        .from('habit_completions')
        .select('habit_id, completed_at')
        .eq('user_id', userId)
        .eq('completion_date', yesterday)
        .order('completed_at'),
      supabase
        .from('habit_steps')
        .select('*')
        .order('display_order'),
      supabase
        .from('habit_step_completions')
        .select('step_id')
        .eq('user_id', userId)
        .eq('completion_date', today)
    ])

    if (todayResult.error) throw todayResult.error

    const completionsData = todayResult.data
    const yesterdayCompletions = yesterdayResult.data || []
    const stepsData = stepsResult.data || []
    const stepCompletionsData = stepCompletionsResult.data || []
    const completedStepIds = stepCompletionsData.map(sc => sc.step_id)

    // Create a map of habit_id -> completion order from yesterday
    const yesterdayOrder = new Map<string, number>()
    yesterdayCompletions.forEach((c, index) => {
      yesterdayOrder.set(c.habit_id, index)
    })

    // Merge habits with completion status and steps
    const habitsWithStatus: HabitWithStatus[] = (habitsData || []).map(habit => {
      const completion = completionsData?.find(c => c.habit_id === habit.id)
      const habitSteps = stepsData.filter(s => s.habit_id === habit.id)
      const habitCompletedStepIds = habitSteps
        .filter(s => completedStepIds.includes(s.id))
        .map(s => s.id)

      return {
        ...habit,
        completed_today: !!completion,
        completion_id: completion?.id,
        completed_at: completion?.completed_at,
        completion_percentage: completion?.completion_percentage ?? (completion ? 100 : 0),
        notes: completion?.notes ?? null,
        steps: habitSteps.length > 0 ? habitSteps : undefined,
        completedStepIds: habitCompletedStepIds.length > 0 ? habitCompletedStepIds : undefined,
      }
    })

    // Sort habits: those completed yesterday come first (in order), then the rest by display_order
    habitsWithStatus.sort((a, b) => {
      const aYesterdayOrder = yesterdayOrder.get(a.id)
      const bYesterdayOrder = yesterdayOrder.get(b.id)

      // Both completed yesterday - sort by yesterday's completion time
      if (aYesterdayOrder !== undefined && bYesterdayOrder !== undefined) {
        return aYesterdayOrder - bYesterdayOrder
      }
      // Only a was completed yesterday - a comes first
      if (aYesterdayOrder !== undefined) return -1
      // Only b was completed yesterday - b comes first
      if (bYesterdayOrder !== undefined) return 1
      // Neither completed yesterday - sort by display_order
      return a.display_order - b.display_order
    })

    return { habits: habitsWithStatus, date: today }
  } catch (error) {
    console.error('Error loading habits:', error)
    const today = new Date().toLocaleDateString('en-CA')
    return { habits: [], date: today }
  }
}

async function getTodayCheckin(userId: string): Promise<{ hasCheckedIn: boolean; focusHabitIds: string[] }> {
  const supabase = await createClient()

  try {
    const today = new Date().toLocaleDateString('en-CA')
    const { data } = await supabase
      .from('daily_checkins')
      .select('id, focus_habit_ids')
      .eq('user_id', userId)
      .eq('checkin_date', today)
      .single()
    return {
      hasCheckedIn: !!data,
      focusHabitIds: data?.focus_habit_ids || []
    }
  } catch {
    return { hasCheckedIn: false, focusHabitIds: [] }
  }
}

export default async function HabitsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ habits, date }, checkinData] = await Promise.all([
    loadHabits(user.id),
    getTodayCheckin(user.id),
  ])

  return (
    <HabitsClient
      initialHabits={habits}
      initialDate={date}
      hasCheckedInToday={checkinData.hasCheckedIn}
      focusHabitIds={checkinData.focusHabitIds}
      userId={user.id}
    />
  )
}