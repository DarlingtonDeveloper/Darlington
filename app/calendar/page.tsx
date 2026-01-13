import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarClient } from './calendar-client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/calendar')
  }

  // Get today's date in local format
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format

  return <CalendarClient initialDate={today} />
}
