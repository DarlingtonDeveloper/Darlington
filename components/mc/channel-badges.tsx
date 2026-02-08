'use client'

import { cn } from '@/lib/utils'
import type { Channel } from '@/lib/mc/types'

const channelIcons: Record<Channel['type'], string> = {
  whatsapp: '💬',
  web: '🌐',
  discord: '🎮',
  telegram: '✈️',
  signal: '🔒',
}

interface ChannelBadgesProps {
  channels: Channel[]
  className?: string
}

/**
 * C2.6 — Channel Indicator Badges
 * Small badges showing which channels are connected.
 */
export function ChannelBadges({ channels, className }: ChannelBadgesProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {channels.map((ch) => (
        <div
          key={ch.id}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            ch.connected
              ? 'border-[var(--status-green)]/30 bg-[var(--status-green)]/10 text-[var(--status-green)]'
              : 'border-border bg-muted text-muted-foreground'
          )}
        >
          <span>{channelIcons[ch.type] ?? '📡'}</span>
          <span className="capitalize">{ch.name}</span>
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              ch.connected ? 'bg-[var(--status-green)]' : 'bg-muted-foreground/50'
            )}
          />
        </div>
      ))}
      {channels.length === 0 && (
        <span className="text-xs text-muted-foreground">No channels</span>
      )}
    </div>
  )
}
