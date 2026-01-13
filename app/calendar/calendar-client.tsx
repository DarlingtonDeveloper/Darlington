'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format, addDays, subDays, formatDistanceToNow } from 'date-fns'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  location?: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  calendarName?: string
}

interface TimeBlock {
  type: 'free' | 'event'
  start: string
  end: string
  durationMinutes: number
  event?: CalendarEvent
}

interface DailySummary {
  date: string
  totalEvents: number
  allDayEvents: number
  meetingHours: number
  freeHours: number
  firstEventTime: string | null
  lastEventTime: string | null
  longestFreeBlockHours: number
}

interface CalendarData {
  events: CalendarEvent[]
  timeBlocks: TimeBlock[]
  summary: DailySummary
  allDayEvents: CalendarEvent[]
  dateRange: { start: string; end: string }
}

interface CalendarClientProps {
  initialDate: string
}

export function CalendarClient({ initialDate }: CalendarClientProps) {
  const [date, setDate] = useState(new Date(initialDate))
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresReauth, setRequiresReauth] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const syncChecked = useRef(false)

  // Check sync status and auto-sync if stale
  useEffect(() => {
    if (syncChecked.current) return
    syncChecked.current = true

    async function checkAndSync() {
      try {
        const res = await fetch('/api/calendar/sync')
        const { lastSyncedAt: syncTime, isStale } = await res.json()
        setLastSyncedAt(syncTime)

        if (isStale) {
          // Auto-sync in background
          setSyncing(true)
          const syncRes = await fetch('/api/calendar/sync', { method: 'POST' })
          if (syncRes.ok) {
            const { synced } = await syncRes.json()
            setLastSyncedAt(new Date().toISOString())
            console.log(`Synced ${synced} days to Supabase`)
          }
          setSyncing(false)
        }
      } catch (err) {
        console.error('Sync check failed:', err)
      }
    }

    checkAndSync()
  }, [])

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/calendar/sync', { method: 'POST' })
      if (res.ok) {
        setLastSyncedAt(new Date().toISOString())
      }
    } catch (err) {
      console.error('Manual sync failed:', err)
    } finally {
      setSyncing(false)
    }
  }

  const fetchCalendarData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/calendar/events?date=${dateStr}`)
      const result = await response.json()

      if (!response.ok) {
        if (result.requiresReauth) {
          setRequiresReauth(true)
          setError(result.message)
        } else {
          setError(result.error || 'Failed to load calendar')
        }
        return
      }

      setData(result)
      setRequiresReauth(false)
    } catch (err) {
      setError('Failed to connect to calendar')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  const goToToday = () => setDate(new Date())
  const goToPrevDay = () => setDate((d) => subDays(d, 1))
  const goToNextDay = () => setDate((d) => addDays(d, 1))

  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return format(date, 'HH:mm')
  }

  if (requiresReauth) {
    return (
      <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto py-8">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 text-center">
          <div className="size-12 rounded-full bg-amber-950/50 border border-amber-900/50 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="size-6 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-neutral-100 mb-2">
            Calendar Access Required
          </h2>
          <p className="text-sm text-neutral-400 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-medium text-white transition-colors"
          >
            Sign in with Google
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto py-4 pb-safe">
      {/* Date header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevDay}
          className="p-2 -ml-2 text-neutral-400 hover:text-neutral-200 active:text-neutral-300 transition-colors"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            {isToday ? 'Today' : format(date, 'EEEE')}
          </p>
          <p className="text-lg font-semibold text-neutral-100">
            {format(date, 'MMMM d')}
          </p>
        </div>

        <button
          onClick={goToNextDay}
          className="p-2 -mr-2 text-neutral-400 hover:text-neutral-200 active:text-neutral-300 transition-colors"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Today button */}
      {!isToday && (
        <div className="flex justify-center mb-4">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-full hover:bg-emerald-950/50 transition-colors"
          >
            Back to Today
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="size-6 border-2 border-neutral-700 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !requiresReauth && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchCalendarData}
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}

      {/* Calendar data */}
      {!loading && data && (
        <>
          {/* Summary card */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-neutral-100 font-mono tabular-nums">
                  {formatDuration(data.summary.freeHours * 60)}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">Free time</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-neutral-300 font-mono tabular-nums">
                  {data.summary.totalEvents}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {data.summary.totalEvents === 1 ? 'event' : 'events'}
                </p>
              </div>
            </div>

            {/* Sync status */}
            <div className="mt-3 pt-3 border-t border-neutral-800/50 flex items-center justify-between">
              <p className="text-[10px] text-neutral-600">
                {syncing ? (
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 border border-neutral-500 border-t-emerald-500 rounded-full animate-spin" />
                    Syncing...
                  </span>
                ) : lastSyncedAt ? (
                  `Synced ${formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}`
                ) : (
                  'Not synced'
                )}
              </p>
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 disabled:opacity-50 transition-colors"
              >
                Sync now
              </button>
            </div>
          </div>

          {/* All-day events */}
          {data.allDayEvents.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                All Day
              </p>
              <div className="space-y-2">
                {data.allDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-neutral-900/50 border border-neutral-800 rounded-lg px-3 py-2"
                  >
                    <p className="text-sm font-medium text-neutral-200">
                      {event.summary}
                    </p>
                    {event.calendarName && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {event.calendarName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-1">
            {data.timeBlocks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-neutral-500">No scheduled events</p>
                <p className="text-xs text-neutral-600 mt-1">Your day is clear</p>
              </div>
            ) : (
              data.timeBlocks.map((block, index) => (
                <div key={index} className="flex gap-3">
                  {/* Time column */}
                  <div className="w-12 shrink-0 text-right">
                    <p className="text-xs font-mono tabular-nums text-neutral-500">
                      {formatTime(block.start)}
                    </p>
                  </div>

                  {/* Block */}
                  {block.type === 'free' ? (
                    <div className="flex-1 border-l-2 border-dashed border-neutral-800 pl-3 py-2 min-h-[40px]">
                      <p className="text-xs text-neutral-600">
                        {formatDuration(block.durationMinutes)} free
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-neutral-200">
                        {block.event?.summary || 'Untitled'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {block.event?.location && (
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {block.event.location}
                          </p>
                        )}
                        <p className="text-xs text-neutral-600 font-mono tabular-nums">
                          {formatDuration(block.durationMinutes)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
