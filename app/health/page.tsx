import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HealthDashboard } from './health-client'

export const dynamic = 'force-dynamic'

export interface SleepEntry {
  id: string
  user_id: string
  sleep_date: string
  bedtime: string | null
  wake_time: string | null
  duration_minutes: number | null
  wake_score: number | null
  duration_score: number | null
  total_score: number | null
  notes: string | null
}

export interface StepsEntry {
  id: string
  user_id: string
  entry_date: string
  step_count: number
  target: number
  score: number
  source: string
}

export interface DietEntry {
  id: string
  user_id: string
  entry_date: string
  no_alcohol: number
  no_snacking: number
  no_sugar: number
  no_junk: number
  protein_focus: number
  hydration: number
  no_late_eating: number
  ate_vegetables: number
  caffeine_cutoff: number
  mindful_portions: number
  daily_score: number
  notes: string | null
}

export interface WeightEntry {
  id: string
  user_id: string
  weight_kg: number
  recorded_at: string
  notes: string | null
}

export interface ScreenTimeEvent {
  id: string
  user_id: string
  event_date: string
  event_time: string
  app_name: string
  duration_minutes: number
}

export interface WorkoutLog {
  id: string
  user_id: string
  template_id: string | null
  template_name: string | null
  logged_at: string
  duration_minutes: number | null
  exercises_completed: unknown[]
  notes: string | null
}

export interface HealthData {
  sleep: SleepEntry | null
  steps: StepsEntry | null
  diet: DietEntry | null
  weightHistory: WeightEntry[]
  screenTime: ScreenTimeEvent[]
  workouts: WorkoutLog[]
}

async function loadHealthData(userId: string, date: string): Promise<HealthData> {
  const supabase = await createClient()

  const [sleepResult, stepsResult, dietResult, weightResult, screenTimeResult, workoutsResult] =
    await Promise.all([
      supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('sleep_date', date)
        .maybeSingle(),
      supabase
        .from('steps_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', date)
        .maybeSingle(),
      supabase
        .from('diet_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', date)
        .maybeSingle(),
      supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(7),
      supabase
        .from('screen_time_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_date', date),
      supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', `${date}T00:00:00`)
        .lt('logged_at', `${date}T23:59:59`),
    ])

  return {
    sleep: sleepResult.data,
    steps: stepsResult.data,
    diet: dietResult.data,
    weightHistory: weightResult.data || [],
    screenTime: screenTimeResult.data || [],
    workouts: workoutsResult.data || [],
  }
}

export default async function HealthPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/health')
  }

  const today = new Date().toLocaleDateString('en-CA')
  const healthData = await loadHealthData(user.id, today)

  return <HealthDashboard initialDate={today} initialData={healthData} userId={user.id} />
}
