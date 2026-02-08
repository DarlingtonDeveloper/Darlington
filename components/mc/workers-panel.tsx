'use client'

import { cn } from '@/lib/utils'
import type { Worker } from '@/lib/mc/types'

const statusColor: Record<Worker['status'], string> = {
  idle: 'bg-[var(--status-green)]',
  busy: 'bg-amber-400',
  error: 'bg-red-500',
  offline: 'bg-[var(--fg2)]',
}

const statusLabel: Record<Worker['status'], string> = {
  idle: 'Idle',
  busy: 'Busy',
  error: 'Error',
  offline: 'Offline',
}

interface WorkersPanelProps {
  workers: Worker[]
  className?: string
}

/**
 * C2.5 — Workers Panel
 * Displays active OpenClaw sub-agents/workers with status.
 */
export function WorkersPanel({ workers, className }: WorkersPanelProps) {
  if (workers.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border bg-card p-6', className)}>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Workers
        </h2>
        <p className="text-sm text-muted-foreground">No active workers</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border border-border bg-card p-6', className)}>
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Workers
      </h2>
      <div className="space-y-3">
        {workers.map((w) => (
          <div
            key={w.id}
            className="flex items-start gap-3 rounded-md border border-border/50 bg-background/50 p-3"
          >
            {/* Status dot */}
            <span
              className={cn(
                'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                statusColor[w.status]
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {w.persona}
                </span>
                <span className="text-xs text-muted-foreground">
                  {statusLabel[w.status]}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {w.task ?? 'No task assigned'}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">
                {w.id}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
