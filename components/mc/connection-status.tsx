'use client'

import { cn } from '@/lib/utils'
import type { OcConnectionState } from '@/lib/mc/types'

const stateConfig: Record<OcConnectionState, { label: string; color: string; pulse: boolean }> = {
  connecting: { label: 'Connecting…', color: 'bg-amber-400', pulse: true },
  connected: { label: 'Connected', color: 'bg-[var(--status-green)]', pulse: false },
  disconnected: { label: 'Disconnected', color: 'bg-red-500', pulse: false },
  error: { label: 'Error', color: 'bg-red-500', pulse: true },
}

interface ConnectionStatusProps {
  state: OcConnectionState
  className?: string
}

/**
 * C3.2 — Connection status indicator for the OpenClaw bridge.
 */
export function ConnectionStatus({ state, className }: ConnectionStatusProps) {
  const cfg = stateConfig[state]
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-2.5 w-2.5">
        {cfg.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              cfg.color
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', cfg.color)} />
      </span>
      <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
    </div>
  )
}
