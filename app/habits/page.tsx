import { supabase } from '@/lib/supabase'
import { HabitsClient } from './habits-client'

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

async function loadHabits(): Promise<HabitWithStatus[]> {
  try {
    const today = new Date().toISOString().split('T')[0]

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

    // Get today's completions
    const { data: completionsData, error: completionsError } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('completion_date', today)

    if (completionsError) {
      console.error('Completions error:', completionsError)
      throw completionsError
    }

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

    return habitsWithStatus
  } catch (error) {
    console.error('Error loading habits:', error)
    return []
  }
}

export default async function HabitsPage() {
  const initialHabits = await loadHabits()

  return <HabitsClient initialHabits={initialHabits} />
}