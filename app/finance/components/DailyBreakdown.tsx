'use client'

import type { DailyTotal } from '../types'

interface DailyBreakdownProps {
  dailyTotals: DailyTotal[]
}

export function DailyBreakdown({ dailyTotals }: DailyBreakdownProps) {
  const maxTotal = Math.max(...dailyTotals.map(d => d.total), 1)

  return (
    <div className="space-y-2">
      {dailyTotals.map((day) => {
        const barWidth = (day.total / maxTotal) * 100

        return (
          <div key={day.date} className="flex items-center gap-3">
            <span className="font-mono text-[11px] tabular-nums text-neutral-600 w-6">
              {day.dayOfWeek}
            </span>
            <div className="flex-1 h-4 bg-neutral-800/40 rounded-sm overflow-hidden relative">
              {day.total > 0 && (
                <div
                  className="absolute inset-y-0 left-0 bg-neutral-600/60 rounded-sm transition-all duration-200"
                  style={{ width: `${barWidth}%` }}
                />
              )}
            </div>
            <span className="font-mono text-[11px] tabular-nums text-neutral-500 w-14 text-right">
              {day.total > 0 ? `£${day.total.toFixed(0)}` : '–'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
