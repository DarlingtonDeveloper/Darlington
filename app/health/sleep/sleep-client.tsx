'use client'

import { format } from 'date-fns'
import type { SleepEntry } from '../page'

interface SleepClientProps {
  initialDate: string
  todayData: SleepEntry | null
  historyData: SleepEntry[]
}

function formatTime(timestamp: string | null): string {
  if (!timestamp) return '--:--'
  return format(new Date(timestamp), 'h:mm a')
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '--'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function ScoreRing({ score, label }: { score: number | null; label: string }) {
  const displayScore = score ?? 0
  const circumference = 2 * Math.PI * 36

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-neutral-800"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className="text-emerald-500"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (displayScore / 100) * circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold font-mono text-neutral-50">
            {score !== null ? score : '--'}
          </span>
        </div>
      </div>
      <span className="text-xs text-neutral-500 mt-1">{label}</span>
    </div>
  )
}

export function SleepClient({ initialDate, todayData, historyData }: SleepClientProps) {
  const todayLabel = format(new Date(initialDate), 'EEEE, MMMM d')

  // Calculate consistency (standard deviation of wake times)
  const wakeTimesInMinutes = historyData
    .filter((h) => h.wake_time)
    .map((h) => {
      const d = new Date(h.wake_time!)
      return d.getHours() * 60 + d.getMinutes()
    })

  let consistencyMessage = 'Not enough data'
  if (wakeTimesInMinutes.length >= 3) {
    const avg = wakeTimesInMinutes.reduce((a, b) => a + b, 0) / wakeTimesInMinutes.length
    const variance =
      wakeTimesInMinutes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) /
      wakeTimesInMinutes.length
    const stdDev = Math.sqrt(variance)

    if (stdDev < 15) consistencyMessage = 'Excellent consistency'
    else if (stdDev < 30) consistencyMessage = 'Good consistency'
    else if (stdDev < 60) consistencyMessage = 'Fair consistency'
    else consistencyMessage = 'Inconsistent'
  }

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto pb-safe">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-lg font-semibold text-neutral-50">Sleep</h1>
        <p className="text-sm text-neutral-500">{todayLabel}</p>
      </div>

      {/* Today's Sleep Summary */}
      <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-6 mb-4">
        {todayData ? (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold font-mono tabular-nums text-neutral-50">
                {formatDuration(todayData.duration_minutes)}
              </div>
              <div className="text-sm text-neutral-500 mt-1">total sleep</div>
            </div>

            <div className="flex justify-center gap-8 mb-6">
              <ScoreRing score={todayData.wake_score} label="Wake (60%)" />
              <ScoreRing score={todayData.duration_score} label="Duration (40%)" />
              <ScoreRing score={todayData.total_score} label="Total" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-neutral-800/30 rounded-lg p-3">
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  Bedtime
                </div>
                <div className="font-mono text-neutral-50">
                  {formatTime(todayData.bedtime)}
                </div>
              </div>
              <div className="bg-neutral-800/30 rounded-lg p-3">
                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                  Wake Time
                </div>
                <div className="font-mono text-neutral-50">
                  {formatTime(todayData.wake_time)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-neutral-500 mb-2">No sleep data for today</div>
            <div className="text-xs text-neutral-600">
              Data is logged automatically via iOS Shortcuts
            </div>
          </div>
        )}
      </div>

      {/* Consistency Card */}
      <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg p-4 mb-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-2">
          Wake Time Consistency (7 days)
        </div>
        <div className="text-neutral-50">{consistencyMessage}</div>
      </div>

      {/* History */}
      {historyData.length > 0 && (
        <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800/40">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Recent Nights
            </h3>
          </div>
          <div className="divide-y divide-neutral-800/40">
            {historyData.map((entry) => (
              <div key={entry.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-400">
                      {format(new Date(entry.sleep_date), 'EEE, MMM d')}
                    </div>
                    <div className="text-xs text-neutral-600 mt-0.5">
                      {formatTime(entry.bedtime)} → {formatTime(entry.wake_time)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono tabular-nums text-neutral-50">
                      {formatDuration(entry.duration_minutes)}
                    </div>
                    {entry.total_score !== null && (
                      <div className="text-xs text-emerald-500 mt-0.5">
                        Score: {entry.total_score}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-600">
          Sleep is tracked via iOS Shortcuts.
          <br />
          Morning shortcut logs wake time, evening shortcut logs bedtime.
        </p>
      </div>
    </div>
  )
}
