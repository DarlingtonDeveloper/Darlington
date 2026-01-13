'use client'

import { format } from 'date-fns'
import type { ScreenTimeEvent } from '../page'

interface ScreenTimeClientProps {
  initialDate: string
  todayEvents: ScreenTimeEvent[]
  weekData: { date: string; count: number; minutes: number }[]
}

const APP_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500',
  twitter: 'bg-sky-500',
  x: 'bg-neutral-400',
  reddit: 'bg-orange-500',
  tiktok: 'bg-neutral-50',
  youtube: 'bg-red-500',
  default: 'bg-neutral-500',
}

export function ScreenTimeClient({
  initialDate,
  todayEvents,
  weekData,
}: ScreenTimeClientProps) {
  const todayLabel = format(new Date(initialDate), 'EEEE, MMMM d')

  // Calculate today's totals
  const todayLockCount = todayEvents.length
  const todayTotalMinutes = todayEvents.reduce((sum, e) => sum + e.duration_minutes, 0)

  // Calculate app breakdown for today
  const appBreakdown = new Map<string, { count: number; minutes: number }>()
  for (const event of todayEvents) {
    const appName = event.app_name.toLowerCase()
    const existing = appBreakdown.get(appName) || { count: 0, minutes: 0 }
    appBreakdown.set(appName, {
      count: existing.count + 1,
      minutes: existing.minutes + event.duration_minutes,
    })
  }

  const sortedApps = Array.from(appBreakdown.entries())
    .sort((a, b) => b[1].count - a[1].count)

  // Calculate 7-day trend
  const weekTotal = weekData.reduce((sum, d) => sum + d.count, 0)
  const weekAvg = weekData.length > 0 ? Math.round(weekTotal / weekData.length) : 0

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto pb-safe">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-lg font-semibold text-neutral-50">Screen Time</h1>
        <p className="text-sm text-neutral-500">{todayLabel}</p>
      </div>

      {/* Today's Summary */}
      <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-6 mb-4">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-4xl font-bold font-mono tabular-nums text-neutral-50">
              {todayLockCount}
            </div>
            <div className="text-sm text-neutral-500">lock events</div>
          </div>
          <div>
            <div className="text-4xl font-bold font-mono tabular-nums text-neutral-50">
              {todayTotalMinutes}
            </div>
            <div className="text-sm text-neutral-500">minutes</div>
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-4 text-center text-sm">
          {todayLockCount > weekAvg ? (
            <span className="text-red-400">
              {todayLockCount - weekAvg} more than 7-day avg ({weekAvg})
            </span>
          ) : todayLockCount < weekAvg ? (
            <span className="text-emerald-500">
              {weekAvg - todayLockCount} fewer than 7-day avg ({weekAvg})
            </span>
          ) : (
            <span className="text-neutral-500">Same as 7-day average</span>
          )}
        </div>
      </div>

      {/* App Breakdown */}
      {sortedApps.length > 0 && (
        <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-neutral-800/40">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Today by App
            </h3>
          </div>
          <div className="divide-y divide-neutral-800/40">
            {sortedApps.map(([app, data]) => {
              const colorClass = APP_COLORS[app] || APP_COLORS.default

              return (
                <div key={app} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <span className="text-neutral-50 capitalize">{app}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono tabular-nums text-neutral-400">
                      {data.count} locks · {data.minutes}m
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 7-Day History */}
      {weekData.length > 0 && (
        <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800/40">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Last 7 Days
            </h3>
          </div>
          <div className="divide-y divide-neutral-800/40">
            {weekData.map((day) => (
              <div key={day.date} className="px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-neutral-400">
                  {format(new Date(day.date), 'EEE, MMM d')}
                </div>
                <div className="font-mono tabular-nums text-neutral-50">
                  {day.count} locks · {day.minutes}m
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-600">
          Screen time is tracked via iOS Shortcut.
          <br />
          Events are logged when the phone locks after doomscroll threshold.
        </p>
      </div>

      {/* Empty State */}
      {todayEvents.length === 0 && (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-neutral-400">No doomscroll events today!</div>
          <div className="text-sm text-neutral-600 mt-1">Keep it up</div>
        </div>
      )}
    </div>
  )
}
