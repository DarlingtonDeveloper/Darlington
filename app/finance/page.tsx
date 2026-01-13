import { startOfWeek } from 'date-fns'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WeeklySummary } from './components/WeeklySummary'
import { getWeeklySummary } from './lib/queries'

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 })
  const initialData = await getWeeklySummary(thisWeek, user.id)

  return <WeeklySummary initialData={initialData} />
}
