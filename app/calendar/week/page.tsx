import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeekClient } from './week-client'

export const dynamic = 'force-dynamic'

export default async function CalendarWeekPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/calendar/week')
  }

  const today = new Date().toLocaleDateString('en-CA')

  return <WeekClient initialDate={today} />
}
