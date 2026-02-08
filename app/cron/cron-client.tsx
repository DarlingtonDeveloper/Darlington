'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, Zap, AlertCircle, Loader2 } from 'lucide-react'

interface CronJob {
  id: string
  name: string
  description?: string
  enabled: boolean
  schedule: {
    kind: string
    expr: string
    tz?: string
  }
  delivery?: {
    mode: string
    channel?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
  }
}

interface ScheduledRun {
  job: CronJob
  time: Date
}

/**
 * Parse a cron expression into occurrences for a given day.
 * Supports standard 5-field cron: min hour dom month dow
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCronRunsForDay(expr: string, day: Date, _tz?: string): Date[] {
  const parts = expr.trim().split(/\s+/)
  if (parts.length < 5) return []

  const [minField, hourField, domField, monField, dowField] = parts

  // Check month (1-12)
  const month = day.getMonth() + 1
  if (!fieldMatches(monField, month)) return []

  // Check day-of-week (0=Sun, 6=Sat)
  const dow = day.getDay()
  if (!fieldMatches(dowField, dow)) return []

  // Check day-of-month
  const dom = day.getDate()
  if (!fieldMatches(domField, dom)) return []

  // Expand hours and minutes
  const hours = expandField(hourField, 0, 23)
  const minutes = expandField(minField, 0, 59)

  const runs: Date[] = []
  for (const h of hours) {
    for (const m of minutes) {
      const d = new Date(day)
      d.setHours(h, m, 0, 0)
      runs.push(d)
    }
  }

  return runs.sort((a, b) => a.getTime() - b.getTime())
}

function fieldMatches(field: string, value: number): boolean {
  if (field === '*') return true
  return expandField(field, 0, 59).includes(value)
}

function expandField(field: string, min: number, max: number): number[] {
  if (field === '*') {
    const result: number[] = []
    for (let i = min; i <= max; i++) result.push(i)
    return result
  }

  const values = new Set<number>()

  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/')
      const step = parseInt(stepStr, 10)
      let start = min
      let end = max
      if (range !== '*') {
        if (range.includes('-')) {
          const [a, b] = range.split('-')
          start = parseInt(a, 10)
          end = parseInt(b, 10)
        } else {
          start = parseInt(range, 10)
        }
      }
      for (let i = start; i <= end; i += step) values.add(i)
    } else if (part.includes('-')) {
      const [a, b] = part.split('-')
      for (let i = parseInt(a, 10); i <= parseInt(b, 10); i++) values.add(i)
    } else {
      values.add(parseInt(part, 10))
    }
  }

  return Array.from(values).sort((a, b) => a - b)
}

export function CronClient() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cron')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to load cron jobs')
        return
      }
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch {
      setError('Failed to connect')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Build scheduled runs for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  const scheduledRuns: Map<string, ScheduledRun[]> = new Map()
  for (const day of weekDays) {
    const key = format(day, 'yyyy-MM-dd')
    const runs: ScheduledRun[] = []
    for (const job of jobs) {
      if (!job.enabled) continue
      if (job.schedule.kind === 'cron') {
        const times = getCronRunsForDay(job.schedule.expr, day, job.schedule.tz)
        for (const time of times) {
          runs.push({ job, time })
        }
      }
    }
    runs.sort((a, b) => a.time.getTime() - b.time.getTime())
    scheduledRuns.set(key, runs)
  }

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-neutral-50">Cron Jobs</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-3 py-1 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors"
          >
            This week
          </button>
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week range label */}
      <p className="text-xs text-neutral-500 mb-4">
        {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d, yyyy')}
      </p>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm py-8 justify-center">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-20 text-neutral-500 text-sm">
          No cron jobs configured
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <>
          {/* Job summary cards */}
          <div className="grid gap-3 mb-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`rounded-lg border p-3 ${
                  job.enabled
                    ? 'border-neutral-800 bg-neutral-900/50'
                    : 'border-neutral-800/50 bg-neutral-900/20 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-3.5 h-3.5 flex-shrink-0 ${job.enabled ? 'text-emerald-400' : 'text-neutral-600'}`} />
                      <span className="text-sm font-medium text-neutral-100 truncate">
                        {job.name}
                      </span>
                    </div>
                    {job.description && (
                      <p className="text-xs text-neutral-500 mt-1 ml-5.5 line-clamp-1">
                        {job.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {job.delivery?.channel && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
                        {job.delivery.channel}
                      </span>
                    )}
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      job.enabled ? 'text-emerald-400 bg-emerald-400/10' : 'text-neutral-600 bg-neutral-800'
                    }`}>
                      {job.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 ml-5.5 text-xs text-neutral-500">
                  <span className="font-mono">{job.schedule.expr}</span>
                  {job.schedule.tz && <span>{job.schedule.tz}</span>}
                  {job.state?.nextRunAtMs && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Next: {format(new Date(job.state.nextRunAtMs), 'EEE HH:mm')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Week timeline */}
          <h2 className="text-sm font-medium text-neutral-300 mb-3">Week Timeline</h2>
          <div className="space-y-1">
            {weekDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const runs = scheduledRuns.get(key) || []
              const isToday = isSameDay(day, today)

              return (
                <div
                  key={key}
                  className={`rounded-lg border p-3 ${
                    isToday
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-neutral-800/50 bg-neutral-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-medium w-8 ${
                      isToday ? 'text-emerald-400' : 'text-neutral-500'
                    }`}>
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-sm font-medium ${
                      isToday ? 'text-neutral-100' : 'text-neutral-300'
                    }`}>
                      {format(day, 'MMM d')}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        TODAY
                      </span>
                    )}
                    <span className="text-xs text-neutral-600 ml-auto">
                      {runs.length} run{runs.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {runs.length > 0 ? (
                    <div className="ml-11 space-y-1">
                      {runs.map((run, i) => {
                        const isPast = run.time < today
                        return (
                          <div
                            key={`${run.job.id}-${i}`}
                            className={`flex items-center gap-2 text-xs ${
                              isPast ? 'text-neutral-600' : 'text-neutral-400'
                            }`}
                          >
                            <span className="font-mono w-11 text-right flex-shrink-0">
                              {format(run.time, 'HH:mm')}
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isPast
                                ? 'bg-neutral-700'
                                : isToday
                                  ? 'bg-emerald-400'
                                  : 'bg-neutral-500'
                            }`} />
                            <span className="truncate">{run.job.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="ml-11 text-xs text-neutral-700">No scheduled runs</p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
