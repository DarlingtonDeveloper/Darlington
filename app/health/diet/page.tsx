import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DietClient } from './diet-client'
import type { DietEntry } from '../page'

export const dynamic = 'force-dynamic'

async function loadDietData(
  userId: string,
  date: string
): Promise<{ today: DietEntry | null; yesterday: DietEntry | null }> {
  const supabase = await createClient()

  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const [todayResult, yesterdayResult] = await Promise.all([
    supabase
      .from('diet_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .maybeSingle(),
    supabase
      .from('diet_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', yesterdayStr)
      .maybeSingle(),
  ])

  return {
    today: todayResult.data,
    yesterday: yesterdayResult.data,
  }
}

export default async function DietPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/health/diet')
  }

  const today = new Date().toLocaleDateString('en-CA')
  const { today: dietEntry, yesterday } = await loadDietData(user.id, today)

  return (
    <DietClient
      initialDate={today}
      initialData={dietEntry}
      yesterdayData={yesterday}
      userId={user.id}
    />
  )
}
