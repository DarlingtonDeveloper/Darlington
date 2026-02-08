'use client'

import { useOcWebSocket } from '@/lib/mc/use-oc-websocket'
import { WorkersPanel } from '@/components/mc/workers-panel'
import { ChannelBadges } from '@/components/mc/channel-badges'
import { ConnectionStatus } from '@/components/mc/connection-status'

export function McClient() {
  const { connectionState, workers, channels } = useOcWebSocket()

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            MissionControl
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            OpenClaw orchestrator dashboard
          </p>
        </div>
        <ConnectionStatus state={connectionState} />
      </div>

      {/* Channel badges */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Channels
        </h2>
        <ChannelBadges channels={channels} />
      </div>

      {/* Workers */}
      <WorkersPanel workers={workers} />
    </div>
  )
}
