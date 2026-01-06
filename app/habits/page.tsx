import { supabase } from '@/lib/supabase'
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

interface HabitWithStatus extends Habit {
  completed_today: boolean
  completion_id?: string
  completed_at?: string
}

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281' // Your user ID

async function loadHabits(): Promise<{ habits: HabitWithStatus[], date: string }> {
  try {
    // Use local date string to match user's expectation
    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format
    const yesterday = subDays(new Date(), 1).toLocaleDateString('en-CA')

    // Get all habits
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('is_active', true)
      .order('display_order')

    if (habitsError) {
      console.error('Habits error:', habitsError)
      throw habitsError
    }

    // Get today's completions and yesterday's completions (for ordering)
    const [todayResult, yesterdayResult] = await Promise.all([
      supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', USER_ID)
        .eq('completion_date', today),
      supabase
        .from('habit_completions')
        .select('habit_id, completed_at')
        .eq('user_id', USER_ID)
        .eq('completion_date', yesterday)
        .order('completed_at')
    ])

    if (todayResult.error) throw todayResult.error

    const completionsData = todayResult.data
    const yesterdayCompletions = yesterdayResult.data || []

    // Create a map of habit_id -> completion order from yesterday
    const yesterdayOrder = new Map<string, number>()
    yesterdayCompletions.forEach((c, index) => {
      yesterdayOrder.set(c.habit_id, index)
    })

    // Merge habits with completion status
    const habitsWithStatus: HabitWithStatus[] = (habitsData || []).map(habit => {
      const completion = completionsData?.find(c => c.habit_id === habit.id)
      return {
        ...habit,
        completed_today: !!completion,
        completion_id: completion?.id,
        completed_at: completion?.completed_at,
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

async function getTodayCheckin(): Promise<{ hasCheckedIn: boolean; focusHabitIds: string[] }> {
  try {
    const today = new Date().toLocaleDateString('en-CA')
    const { data } = await supabase
      .from('daily_checkins')
      .select('id, focus_habit_ids')
      .eq('user_id', USER_ID)
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
  const [{ habits, date }, checkinData] = await Promise.all([
    loadHabits(),
    getTodayCheckin(),
  ])

  return (
    <HabitsClient
      initialHabits={habits}
      initialDate={date}
      hasCheckedInToday={checkinData.hasCheckedIn}
      focusHabitIds={checkinData.focusHabitIds}
    />
  )
}