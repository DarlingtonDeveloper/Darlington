import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeightClient } from './weight-client'
import type { WeightEntry } from '../page'

export const dynamic = 'force-dynamic'

async function loadWeightData(userId: string): Promise<WeightEntry[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(30)

  return data || []
}

export default async function WeightPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/health/weight')
  }

  const weightHistory = await loadWeightData(user.id)

  return <WeightClient initialData={weightHistory} userId={user.id} />
}
