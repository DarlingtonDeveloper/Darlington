import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'
import type { WorkoutTemplate } from '../workouts/page'

export const dynamic = 'force-dynamic'

export interface HealthSettings {
  id: string
  user_id: string
  steps_target: number
  wake_target_time: string
  sleep_duration_target_hours: number
}

async function loadSettings(userId: string): Promise<{
  settings: HealthSettings | null
  templates: WorkoutTemplate[]
}> {
  const supabase = await createClient()

  const [settingsResult, templatesResult] = await Promise.all([
    supabase.from('health_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('display_order'),
  ])

  return {
    settings: settingsResult.data,
    templates: templatesResult.data || [],
  }
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/health/settings')
  }

  const { settings, templates } = await loadSettings(user.id)

  return <SettingsClient initialSettings={settings} templates={templates} userId={user.id} />
}
