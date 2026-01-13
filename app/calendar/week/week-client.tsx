'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import Link from 'next/link'

interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
}

interface DaySummary {
  date: string
  dayName: string
  dayNumber: number
  events: CalendarEvent[]
  eventCount: number
  meetingMinutes: number
  freeHours: number
}

interface WeekClientProps {
  initialDate: string
}

export function WeekClient({ initialDate }: WeekClientProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(initialDate), { weekStartsOn: 1 })
  )
  const [days, setDays] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeekData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const dateStr = format(weekStart, 'yyyy-MM-dd')
      const response = await fetch(`/api/calendar/events?date=${dateStr}&range=week`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to load calendar')
        return
      }

      // Group events by day
      const weekDays: DaySummary[] = []
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i)
        const dateStr = format(date, 'yyyy-MM-dd')

        const dayEvents = result.events.filter((e: CalendarEvent) => {
          const eventDate = e.start.dateTime?.split('T')[0] || e.start.date
          return eventDate === dateStr
        })

        // Calculate meeting time
        let meetingMinutes = 0
        const timedEvents = dayEvents.filter((e: CalendarEvent) => e.start.dateTime)
        for (const event of timedEvents) {
          const start = new Date(event.start.dateTime!)
          const end = new Date(event.end.dateTime!)
          meetingMinutes += (end.getTime() - start.getTime()) / 60000
        }

        const workdayMinutes = 9 * 60 // 9 hour workday
        const freeMinutes = Math.max(0, workdayMinutes - meetingMinutes)

        weekDays.push({
          date: dateStr,
          dayName: format(date, 'EEE'),
          dayNumber: date.getDate(),
          events: dayEvents,
          eventCount: dayEvents.length,
          meetingMinutes,
          freeHours: Math.round(freeMinutes / 60 * 10) / 10,
        })
      }

      setDays(weekDays)
    } catch (err) {
      setError('Failed to connect to calendar')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    fetchWeekData()
  }, [fetchWeekData])

  const goToPrevWeek = () => setWeekStart((d) => subWeeks(d, 1))
  const goToNextWeek = () => setWeekStart((d) => addWeeks(d, 1))
  const goToThisWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const isThisWeek = format(weekStart, 'yyyy-MM-dd') ===
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Find busiest day
  const busiestDay = days.reduce((max, day) =>
    day.meetingMinutes > (max?.meetingMinutes || 0) ? day : max
  , null as DaySummary | null)

  const formatHours = (hours: number) => {
    if (hours === 0) return 'Clear'
    return `${hours}h free`
  }

  // Generate simple busy bar (9am-6pm = 9 hours)
  const generateBusyBar = (events: CalendarEvent[]) => {
    const slots = new Array(18).fill(false) // 30-min slots from 9am-6pm

    events.forEach((e) => {
      if (!e.start.dateTime) return
      const start = new Date(e.start.dateTime)
      const end = new Date(e.end.dateTime!)

      const startHour = start.getHours() + start.getMinutes() / 60
      const endHour = end.getHours() + end.getMinutes() / 60

      for (let h = Math.max(9, startHour); h < Math.min(18, endHour); h += 0.5) {
        const slotIndex = Math.floor((h - 9) * 2)
        if (slotIndex >= 0 && slotIndex < 18) {
          slots[slotIndex] = true
        }
      }
    })

    return slots
  }

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto py-4 pb-safe">
      {/* Week header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevWeek}
          className="p-2 -ml-2 text-neutral-400 hover:text-neutral-200 active:text-neutral-300 transition-colors"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            {isThisWeek ? 'This Week' : 'Week of'}
          </p>
          <p className="text-lg font-semibold text-neutral-100">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
          </p>
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 -mr-2 text-neutral-400 hover:text-neutral-200 active:text-neutral-300 transition-colors"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* This week button */}
      {!isThisWeek && (
        <div className="flex justify-center mb-4">
          <button
            onClick={goToThisWeek}
            className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-full hover:bg-emerald-950/50 transition-colors"
          >
            Back to This Week
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
      {error && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchWeekData}
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}

      {/* Week days */}
      {!loading && days.length > 0 && (
        <div className="space-y-2">
          {days.map((day) => {
            const isToday = day.date === todayStr
            const isBusiest = busiestDay && day.date === busiestDay.date && day.meetingMinutes > 120
            const busySlots = generateBusyBar(day.events)

            return (
              <Link
                key={day.date}
                href={`/calendar?date=${day.date}`}
                className={`block bg-neutral-900/50 border rounded-lg p-3 transition-colors hover:bg-neutral-900/80 ${
                  isToday ? 'border-emerald-800/50' : 'border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isToday ? 'text-emerald-400' : 'text-neutral-400'}`}>
                      {day.dayName}
                    </span>
                    <span className={`text-sm font-semibold ${isToday ? 'text-neutral-100' : 'text-neutral-300'}`}>
                      {day.dayNumber}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-500 bg-emerald-950/50 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="font-mono tabular-nums">
                      {day.eventCount} {day.eventCount === 1 ? 'event' : 'events'}
                    </span>
                    <span className="font-mono tabular-nums">
                      {formatHours(day.freeHours)}
                    </span>
                  </div>
                </div>

                {/* Busy bar */}
                <div className="flex gap-0.5">
                  {busySlots.map((busy, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-sm ${
                        busy ? 'bg-neutral-600' : 'bg-neutral-800/50'
                      }`}
                    />
                  ))}
                </div>

                {isBusiest && (
                  <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1">
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                    Busiest day
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
