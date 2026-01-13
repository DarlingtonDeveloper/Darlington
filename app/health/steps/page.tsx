import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StepsClient } from './steps-client'
import type { StepsEntry } from '../page'
import { subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

async function loadStepsData(userId: string): Promise<{
  today: StepsEntry | null
  history: StepsEntry[]
  streak: number
}> {
  const supabase = await createClient()
  const today = new Date().toLocaleDateString('en-CA')
  const monthAgo = subDays(new Date(), 30).toLocaleDateString('en-CA')

  const [todayResult, historyResult] = await Promise.all([
    supabase
      .from('steps_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .maybeSingle(),
    supabase
      .from('steps_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', monthAgo)
      .order('entry_date', { ascending: false }),
  ])

  // Calculate streak (consecutive days at or above target)
  let streak = 0
  const history = historyResult.data || []

  for (const entry of history) {
    if (entry.step_count >= entry.target) {
      streak++
    } else {
      break
    }
  }

  return {
    today: todayResult.data,
    history,
    streak,
  }
}

export default async function StepsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/health/steps')
  }

  const today = new Date().toLocaleDateString('en-CA')
  const { today: stepsEntry, history, streak } = await loadStepsData(user.id)

  return (
    <StepsClient
      initialDate={today}
      todayData={stepsEntry}
      historyData={history}
      currentStreak={streak}
      userId={user.id}
    />
  )
}
