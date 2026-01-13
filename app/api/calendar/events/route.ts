import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getGoogleAccessToken,
  fetchAllCalendarEvents,
  calculateTimeBlocks,
  calculateDailySummary,
} from '@/lib/google-calendar'
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse query params
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date') // YYYY-MM-DD
  const rangeParam = searchParams.get('range') // 'day', 'week', or number of days

  // Default to today
  const baseDate = dateParam ? new Date(dateParam) : new Date()
  let timeMin: Date
  let timeMax: Date

  if (rangeParam === 'week') {
    // Get current week (Monday to Sunday)
    const dayOfWeek = baseDate.getDay()
    const monday = subDays(baseDate, dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    timeMin = startOfDay(monday)
    timeMax = endOfDay(addDays(monday, 6))
  } else if (rangeParam && !isNaN(parseInt(rangeParam))) {
    // Custom range in days
    const days = parseInt(rangeParam)
    timeMin = startOfDay(baseDate)
    timeMax = endOfDay(addDays(baseDate, days - 1))
  } else {
    // Default: single day
    timeMin = startOfDay(baseDate)
    timeMax = endOfDay(baseDate)
  }

  // Get Google access token
  const accessToken = await getGoogleAccessToken(user.id)

  if (!accessToken) {
    return NextResponse.json(
      {
        error: 'No Google Calendar access',
        message: 'Please sign out and sign back in to grant calendar access.',
        requiresReauth: true,
      },
      { status: 403 }
    )
  }

  try {
    // Fetch events from Google Calendar
    const events = await fetchAllCalendarEvents(accessToken, timeMin, timeMax)

    // Calculate time blocks for today view
    const todayStr = baseDate.toISOString().split('T')[0]
    const dayStart = new Date(baseDate)
    dayStart.setHours(9, 0, 0, 0) // 9 AM workday start
    const dayEnd = new Date(baseDate)
    dayEnd.setHours(19, 0, 0, 0) // 7 PM workday end (extended for display)

    const todayEvents = events.filter((e) => {
      const eventDate = e.start.dateTime?.split('T')[0] || e.start.date
      return eventDate === todayStr
    })

    const timeBlocks = calculateTimeBlocks(todayEvents, dayStart, dayEnd)
    const summary = calculateDailySummary(todayStr, todayEvents)

    // For all-day events
    const allDayEvents = events.filter(
      (e) => e.start.date && !e.start.dateTime
    )

    return NextResponse.json({
      events,
      timeBlocks,
      summary,
      allDayEvents,
      dateRange: {
        start: timeMin.toISOString(),
        end: timeMax.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching calendar events:', error)

    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        {
          error: 'Google Calendar access expired',
          message: 'Please sign out and sign back in to refresh access.',
          requiresReauth: true,
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}
