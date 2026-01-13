import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ScreenTimeClient } from './screentime-client'
import type { ScreenTimeEvent } from '../page'
import { subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

async function loadScreenTimeData(userId: string): Promise<{
  today: ScreenTimeEvent[]
  weekData: { date: string; count: number; minutes: number }[]
}> {
  const supabase = await createClient()
  const today = new Date().toLocaleDateString('en-CA')
  const weekAgo = subDays(new Date(), 7).toLocaleDateString('en-CA')

  const [todayResult, weekResult] = await Promise.all([
    supabase
      .from('screen_time_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_date', today)
      .order('event_time', { ascending: false }),
    supabase
      .from('screen_time_events')
      .select('event_date, duration_minutes')
      .eq('user_id', userId)
      .gte('event_date', weekAgo)
      .order('event_date', { ascending: false }),
  ])

  // Aggregate week data by date
  const weekMap = new Map<string, { count: number; minutes: number }>()
  for (const event of weekResult.data || []) {
    const existing = weekMap.get(event.event_date) || { count: 0, minutes: 0 }
    weekMap.set(event.event_date, {
      count: existing.count + 1,
      minutes: existing.minutes + event.duration_minutes,
    })
  }

  const weekData = Array.from(weekMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date))

  return {
    today: todayResult.data || [],
    weekData,
  }
}

export default async function ScreenTimePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/health/screentime')
  }

  const today = new Date().toLocaleDateString('en-CA')
  const { today: todayEvents, weekData } = await loadScreenTimeData(user.id)

  return (
    <ScreenTimeClient
      initialDate={today}
      todayEvents={todayEvents}
      weekData={weekData}
    />
  )
}
