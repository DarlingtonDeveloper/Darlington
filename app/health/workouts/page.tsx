import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkoutsClient } from './workouts-client'
import type { WorkoutLog } from '../page'
import { subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  description: string | null
  scheduled_days: number[]
  exercises: Exercise[]
  display_order: number
  is_active: boolean
}

export interface Exercise {
  name: string
  type: 'reps' | 'duration'
  target: number
  unit?: string
  notes?: string
}

async function loadWorkoutData(userId: string): Promise<{
  templates: WorkoutTemplate[]
  todayLogs: WorkoutLog[]
  recentLogs: WorkoutLog[]
}> {
  const supabase = await createClient()
  const today = new Date().toLocaleDateString('en-CA')
  const weekAgo = subDays(new Date(), 7).toLocaleDateString('en-CA')

  const [templatesResult, todayResult, recentResult] = await Promise.all([
    supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${today}T00:00:00`)
      .lt('logged_at', `${today}T23:59:59`),
    supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${weekAgo}T00:00:00`)
      .order('logged_at', { ascending: false })
      .limit(10),
  ])

  return {
    templates: templatesResult.data || [],
    todayLogs: todayResult.data || [],
    recentLogs: recentResult.data || [],
  }
}

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/health/workouts')
  }

  const today = new Date().toLocaleDateString('en-CA')
  const { templates, todayLogs, recentLogs } = await loadWorkoutData(user.id)

  return (
    <WorkoutsClient
      initialDate={today}
      templates={templates}
      todayLogs={todayLogs}
      recentLogs={recentLogs}
      userId={user.id}
    />
  )
}
