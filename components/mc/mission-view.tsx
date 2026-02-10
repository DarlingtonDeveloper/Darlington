"use client";

import type { Worker, GateCriteria, TokenSummary } from "@/lib/mc/types";
import { ZoneGroup } from "./zone-group";
import { ChatPanel } from "./chat-panel";
import { SectionLabel } from "./section-label";
import { Badge } from "./badge";
import WorkerPanel from "./worker-panel";
import GateConditionsPanel from "./gate-conditions-panel";
import TokenUsagePanel from "./token-usage-panel";

const ZONES = ["frontend", "backend", "database", "infra", "shared"];

interface MissionViewProps {
  workers: Worker[];
  gates: Record<string, GateCriteria>;
  tokens: TokenSummary;
  currentStage: string;
  onKillWorker: (id: string) => void;
}

export function MissionView({
  workers,
  gates,
  tokens,
  currentStage,
  onKillWorker,
}: MissionViewProps) {
  const activeWorkers = workers.filter((w) => w.status !== "offline");
  const busyCount = workers.filter((w) => w.status === "busy").length;
  const idleCount = workers.filter((w) => w.status === "idle").length;

  const groups = ZONES.map((z) => ({
    zone: z,
    workers: activeWorkers.filter((w) => w.zone === z),
  })).filter((g) => g.workers.length > 0);

  return (
    <div className="grid min-h-[500px] gap-3.5 pt-3 grid-cols-[3fr_2fr] h-[calc(100vh-240px)]">
      {/* Left column */}
      <div className="flex flex-col gap-3 overflow-auto">
        {/* Workers by Zone */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5">
            <SectionLabel>Workers by Zone</SectionLabel>
            <button className="rounded-md bg-[#c4b5a0]/15 border border-[#c4b5a0]/20 px-2.5 py-1 text-[10px] font-medium text-[#c4b5a0] hover:bg-[#c4b5a0]/25 transition-colors">
              + Spawn
            </button>
          </div>

          {groups.map((g) => (
            <ZoneGroup
              key={g.zone}
              zone={g.zone}
              workers={g.workers}
              defaultOpen={g.workers.some((w) => w.status === "busy")}
              onKillWorker={onKillWorker}
            />
          ))}

          <div className="mt-1 flex flex-wrap gap-1.5 border-t border-white/[0.04] px-0.5 pt-2">
            <Badge variant="accent">{busyCount} busy</Badge>
            <Badge variant="success">{idleCount} idle</Badge>
            <Badge>{activeWorkers.length} total</Badge>
          </div>
        </div>

        {/* Worker Panel */}
        <WorkerPanel workers={workers} />

        {/* Gate Conditions */}
        <GateConditionsPanel gates={gates} currentStage={currentStage} />

        {/* Token Usage */}
        <TokenUsagePanel tokens={tokens} />
      </div>

      {/* Right: Kai Chat — connects directly to OpenClaw gateway */}
      <ChatPanel />
    </div>
  );
}
