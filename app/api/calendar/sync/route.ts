import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getGoogleAccessToken,
  fetchAllCalendarEvents,
  calculateDailySummary,
} from '@/lib/google-calendar'
import { format, subDays, addDays } from 'date-fns'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get Google access token
  const accessToken = await getGoogleAccessToken(user.id)

  if (!accessToken) {
    return NextResponse.json(
      { error: 'No Google Calendar access', requiresReauth: true },
      { status: 403 }
    )
  }

  try {
    // Fetch last 30 days + next 7 days
    const today = new Date()
    const timeMin = subDays(today, 30)
    const timeMax = addDays(today, 7)

    const events = await fetchAllCalendarEvents(accessToken, timeMin, timeMax)

    // Group events by date and calculate summaries
    const dateMap = new Map<string, typeof events>()

    // Initialize all dates in range
    for (let d = new Date(timeMin); d <= timeMax; d = addDays(d, 1)) {
      dateMap.set(format(d, 'yyyy-MM-dd'), [])
    }

    // Group events by date
    for (const event of events) {
      const eventDate = event.start.dateTime?.split('T')[0] || event.start.date
      if (eventDate && dateMap.has(eventDate)) {
        dateMap.get(eventDate)!.push(event)
      }
    }

    // Calculate summaries for each date
    const summaries = Array.from(dateMap.entries()).map(([date, dayEvents]) => {
      const summary = calculateDailySummary(date, dayEvents)
      return {
        user_id: user.id,
        date,
        total_events: summary.totalEvents,
        all_day_events: summary.allDayEvents,
        meeting_hours: summary.meetingHours,
        free_hours: summary.freeHours,
        first_event_time: summary.firstEventTime,
        last_event_time: summary.lastEventTime,
        longest_free_block_hours: summary.longestFreeBlockHours,
        calendars_included: [...new Set(dayEvents.map((e) => e.calendarName).filter(Boolean))],
        synced_at: new Date().toISOString(),
      }
    })

    // Upsert to Supabase
    const { error } = await supabase
      .from('calendar_daily_summaries')
      .upsert(summaries, { onConflict: 'user_id,date' })

    if (error) {
      console.error('Error upserting summaries:', error)
      return NextResponse.json(
        { error: 'Failed to save summaries' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      synced: summaries.length,
      dateRange: {
        start: format(timeMin, 'yyyy-MM-dd'),
        end: format(timeMax, 'yyyy-MM-dd'),
      },
    })
  } catch (error) {
    console.error('Error syncing calendar:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}

// GET endpoint to check last sync time
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get most recent sync time
  const { data } = await supabase
    .from('calendar_daily_summaries')
    .select('synced_at')
    .eq('user_id', user.id)
    .order('synced_at', { ascending: false })
    .limit(1)
    .single()

  const lastSyncedAt = data?.synced_at || null
  const isStale = !lastSyncedAt ||
    new Date().getTime() - new Date(lastSyncedAt).getTime() > 60 * 60 * 1000 // 1 hour

  return NextResponse.json({
    lastSyncedAt,
    isStale,
  })
}
