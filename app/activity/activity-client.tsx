'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import {
  GitCommit,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Rocket,
  MessageSquare,
  Bot,
  GitPullRequest,
} from 'lucide-react'

interface ActivityEvent {
  id: string
  timestamp: string
  type: 'commit' | 'cron' | 'deploy' | 'agent' | 'message' | 'pr'
  description: string
  repo?: string
  link?: string
  author?: string
  hash?: string
}

const typeConfig: Record<
  string,
  { icon: typeof GitCommit; color: string; label: string }
> = {
  commit: { icon: GitCommit, color: 'text-emerald-400', label: 'Commit' },
  cron: { icon: Clock, color: 'text-blue-400', label: 'Cron' },
  deploy: { icon: Rocket, color: 'text-purple-400', label: 'Deploy' },
  agent: { icon: Bot, color: 'text-amber-400', label: 'Agent' },
  message: { icon: MessageSquare, color: 'text-cyan-400', label: 'Message' },
  pr: { icon: GitPullRequest, color: 'text-pink-400', label: 'PR' },
}

export function ActivityClient() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const refreshTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchEvents = useCallback(
    async (cursor?: string | null) => {
      try {
        const params = new URLSearchParams({ limit: '30' })
        if (cursor) params.set('cursor', cursor)
        const res = await fetch(`/api/activity?${params}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load activity')
        }
        const data = await res.json()
        return data
      } catch (err) {
        throw err
      }
    },
    []
  )

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchEvents()
      setEvents(data.events)
      setNextCursor(data.nextCursor)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await fetchEvents(nextCursor)
      setEvents((prev) => [...prev, ...data.events])
      setNextCursor(data.nextCursor)
    } catch {
      // Silently fail on load more
    } finally {
      setLoadingMore(false)
    }
  }, [nextCursor, loadingMore, fetchEvents])

  // Initial load
  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshTimer.current = setInterval(() => {
      loadInitial()
    }, 30_000)
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current)
    }
  }, [loadInitial])

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-50">
            Activity Feed
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Last updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
          </p>
        </div>
        <button
          onClick={loadInitial}
          disabled={loading}
          className="p-2 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Loading state */}
      {loading && events.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm py-8 justify-center">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-20 text-neutral-500 text-sm">
          No activity yet
        </div>
      )}

      {/* Event list */}
      {events.length > 0 && (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-neutral-800" />

          <div className="space-y-1">
            {events.map((event) => {
              const config = typeConfig[event.type] || typeConfig.commit
              const Icon = config.icon
              const time = new Date(event.timestamp)

              return (
                <div
                  key={event.id}
                  className="relative flex items-start gap-3 py-2 pl-0 group"
                >
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-[31px] h-[31px] rounded-full bg-neutral-900 border border-neutral-800 flex-shrink-0 ${config.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.repo && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
                          {event.repo}
                        </span>
                      )}
                      {event.hash && (
                        <span className="text-[10px] font-mono text-neutral-600">
                          {event.hash}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-200 mt-0.5 break-words">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-600">
                      {event.author && <span>{event.author}</span>}
                      <span title={format(time, 'PPpp')}>
                        {formatDistanceToNow(time, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {nextCursor && (
            <div className="flex justify-center pt-6 pb-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
