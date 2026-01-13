import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SleepClient } from './sleep-client'
import type { SleepEntry } from '../page'
import { subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

async function loadSleepData(userId: string): Promise<{
  today: SleepEntry | null
  history: SleepEntry[]
}> {
  const supabase = await createClient()
  const today = new Date().toLocaleDateString('en-CA')
  const weekAgo = subDays(new Date(), 7).toLocaleDateString('en-CA')

  const [todayResult, historyResult] = await Promise.all([
    supabase
      .from('sleep_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('sleep_date', today)
      .maybeSingle(),
    supabase
      .from('sleep_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('sleep_date', weekAgo)
      .order('sleep_date', { ascending: false }),
  ])

  return {
    today: todayResult.data,
    history: historyResult.data || [],
  }
}

export default async function SleepPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/health/sleep')
  }

  const today = new Date().toLocaleDateString('en-CA')
  const { today: sleepEntry, history } = await loadSleepData(user.id)

  return <SleepClient initialDate={today} todayData={sleepEntry} historyData={history} />
}
