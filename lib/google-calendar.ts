import { createClient } from '@/lib/supabase/server'

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  location?: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  calendarName?: string
  colorId?: string
}

export interface GoogleCalendar {
  id: string
  summary: string
  primary?: boolean
  selected?: boolean
  backgroundColor?: string
}

interface OAuthTokens {
  user_id: string
  provider: string
  access_token: string
  refresh_token: string | null
  expires_at: string | null
  scopes: string[]
  updated_at: string
}

/**
 * Get a valid Google access token for the user, refreshing if necessary
 */
export async function getGoogleAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: tokens, error } = await supabase
    .from('user_oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single()

  if (error || !tokens) {
    console.error('No Google tokens found for user:', userId)
    return null
  }

  const typedTokens = tokens as OAuthTokens

  // Check if token is expired (with 5 min buffer)
  const expiresAt = typedTokens.expires_at ? new Date(typedTokens.expires_at) : null
  const now = new Date()
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  if (expiresAt && expiresAt < fiveMinutesFromNow && typedTokens.refresh_token) {
    // Token expired or expiring soon - refresh it
    const refreshed = await refreshGoogleToken(userId, typedTokens.refresh_token)
    if (refreshed) {
      return refreshed
    }
    // If refresh fails, try the existing token anyway
  }

  return typedTokens.access_token
}

/**
 * Refresh the Google access token using the refresh token
 */
async function refreshGoogleToken(userId: string, refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env vars')
    return null
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      console.error('Failed to refresh token:', await response.text())
      return null
    }

    const data = await response.json()
    const newAccessToken = data.access_token
    const expiresIn = data.expires_in // seconds

    // Update stored token
    const supabase = await createClient()
    await supabase.from('user_oauth_tokens').update({
      access_token: newAccessToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    return newAccessToken
  } catch (error) {
    console.error('Error refreshing Google token:', error)
    return null
  }
}

/**
 * Fetch events from Google Calendar API
 */
export async function fetchCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
  calendarId: string = 'primary'
): Promise<CalendarEvent[]> {
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
  )
  url.searchParams.set('timeMin', timeMin.toISOString())
  url.searchParams.set('timeMax', timeMax.toISOString())
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '250')

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to fetch calendar events:', errorText)
    throw new Error(`Failed to fetch calendar events: ${response.status}`)
  }

  const data = await response.json()
  return data.items || []
}

/**
 * Get list of user's calendars
 */
export async function fetchCalendarList(accessToken: string): Promise<GoogleCalendar[]> {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) {
    console.error('Failed to fetch calendar list:', await response.text())
    return []
  }

  const data = await response.json()
  return data.items || []
}

/**
 * Fetch events from all selected calendars
 */
export async function fetchAllCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  // Get all calendars
  const calendars = await fetchCalendarList(accessToken)

  // Filter to selected calendars
  const selectedCalendars = calendars.filter((cal) => cal.selected)

  // Fetch events from each calendar in parallel
  const eventPromises = selectedCalendars.map(async (cal) => {
    try {
      const events = await fetchCalendarEvents(accessToken, timeMin, timeMax, cal.id)
      return events.map((event) => ({
        ...event,
        calendarName: cal.summary,
      }))
    } catch (error) {
      console.error(`Error fetching events from calendar ${cal.summary}:`, error)
      return []
    }
  })

  const allEvents = await Promise.all(eventPromises)

  // Flatten and sort by start time
  return allEvents.flat().sort((a, b) => {
    const aTime = a.start.dateTime || a.start.date || ''
    const bTime = b.start.dateTime || b.start.date || ''
    return aTime.localeCompare(bTime)
  })
}

/**
 * Calculate free time blocks between events
 */
export interface TimeBlock {
  type: 'free' | 'event'
  start: Date
  end: Date
  durationMinutes: number
  event?: CalendarEvent
}

export function calculateTimeBlocks(
  events: CalendarEvent[],
  dayStart: Date,
  dayEnd: Date
): TimeBlock[] {
  const blocks: TimeBlock[] = []

  // Filter to timed events only (not all-day)
  const timedEvents = events
    .filter((e) => e.start.dateTime)
    .map((e) => ({
      event: e,
      start: new Date(e.start.dateTime!),
      end: new Date(e.end.dateTime!),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  let currentTime = dayStart

  for (const { event, start, end } of timedEvents) {
    // Add free block if there's a gap
    if (start > currentTime) {
      blocks.push({
        type: 'free',
        start: currentTime,
        end: start,
        durationMinutes: Math.round((start.getTime() - currentTime.getTime()) / 60000),
      })
    }

    // Add event block
    blocks.push({
      type: 'event',
      start,
      end,
      durationMinutes: Math.round((end.getTime() - start.getTime()) / 60000),
      event,
    })

    currentTime = new Date(Math.max(currentTime.getTime(), end.getTime()))
  }

  // Add final free block if there's time remaining
  if (currentTime < dayEnd) {
    blocks.push({
      type: 'free',
      start: currentTime,
      end: dayEnd,
      durationMinutes: Math.round((dayEnd.getTime() - currentTime.getTime()) / 60000),
    })
  }

  return blocks
}

/**
 * Calculate daily summary stats
 */
export interface DailySummary {
  date: string
  totalEvents: number
  allDayEvents: number
  meetingHours: number
  freeHours: number
  firstEventTime: string | null
  lastEventTime: string | null
  longestFreeBlockHours: number
}

export function calculateDailySummary(
  date: string,
  events: CalendarEvent[],
  workdayStartHour: number = 9,
  workdayEndHour: number = 18
): DailySummary {
  const dayEvents = events.filter((e) => {
    const eventDate = e.start.dateTime?.split('T')[0] || e.start.date
    return eventDate === date
  })

  const timedEvents = dayEvents.filter((e) => e.start.dateTime)
  const allDayEvents = dayEvents.filter((e) => e.start.date && !e.start.dateTime)

  // Calculate meeting time
  let meetingMinutes = 0
  const busySlots: { start: number; end: number }[] = []

  for (const event of timedEvents) {
    const start = new Date(event.start.dateTime!)
    const end = new Date(event.end.dateTime!)
    const durationMinutes = (end.getTime() - start.getTime()) / 60000
    meetingMinutes += durationMinutes

    busySlots.push({
      start: start.getHours() * 60 + start.getMinutes(),
      end: end.getHours() * 60 + end.getMinutes(),
    })
  }

  // Calculate free hours (within workday)
  const workdayMinutes = (workdayEndHour - workdayStartHour) * 60
  const freeMinutes = Math.max(0, workdayMinutes - meetingMinutes)

  // Find longest free block
  busySlots.sort((a, b) => a.start - b.start)
  let longestGap = 0
  let prevEnd = workdayStartHour * 60

  for (const slot of busySlots) {
    const gap = slot.start - prevEnd
    if (gap > longestGap) longestGap = gap
    prevEnd = Math.max(prevEnd, slot.end)
  }
  // Check gap after last meeting
  const finalGap = workdayEndHour * 60 - prevEnd
  if (finalGap > longestGap) longestGap = finalGap

  // Get first and last event times
  const sortedTimed = timedEvents.sort(
    (a, b) =>
      new Date(a.start.dateTime!).getTime() - new Date(b.start.dateTime!).getTime()
  )

  return {
    date,
    totalEvents: dayEvents.length,
    allDayEvents: allDayEvents.length,
    meetingHours: Math.round((meetingMinutes / 60) * 100) / 100,
    freeHours: Math.round((freeMinutes / 60) * 100) / 100,
    firstEventTime: sortedTimed[0]?.start.dateTime?.split('T')[1]?.slice(0, 5) || null,
    lastEventTime:
      sortedTimed[sortedTimed.length - 1]?.end.dateTime?.split('T')[1]?.slice(0, 5) ||
      null,
    longestFreeBlockHours: Math.round((longestGap / 60) * 100) / 100,
  }
}
