"use client";

import type {
  Worker,
  Task,
  CheckpointInfo,
  GateCriteria,
  TokenSummary,
} from "@/lib/mc/types";
import { ZoneGroup } from "./zone-group";
import { ChatPanel } from "./chat-panel";
import { SectionLabel } from "./section-label";
import { Badge } from "./badge";
import WorkerPanel from "./worker-panel";
import GateConditionsPanel from "./gate-conditions-panel";
import TokenUsagePanel from "./token-usage-panel";

interface MissionViewProps {
  workers: Worker[];
  tasks: Task[];
  checkpoints: CheckpointInfo[];
  gates: Record<string, GateCriteria>;
  tokens: TokenSummary;
  currentStage: string;
  onKillWorker: (id: string) => void;
}

export function MissionView({
  workers,
  tasks,
  checkpoints,
  gates,
  tokens,
  currentStage,
  onKillWorker,
}: MissionViewProps) {
  const activeWorkers = workers.filter((w) => w.status !== "offline");
  const busyCount = workers.filter((w) => w.status === "busy").length;
  const idleCount = workers.filter((w) => w.status === "idle").length;

  // Derive zones dynamically from tasks and workers
  const allZones = new Set<string>();
  tasks.forEach((t) => {
    if (t.zone) allZones.add(t.zone);
  });
  workers.forEach((w) => {
    if (w.zone) allZones.add(w.zone);
  });

  const groups = Array.from(allZones)
    .sort()
    .map((z) => ({
      zone: z,
      workers: activeWorkers.filter((w) => w.zone === z),
      tasks: tasks.filter((t) => t.zone === z),
    }))
    .filter((g) => g.workers.length > 0 || g.tasks.length > 0);

  // Task status counts per zone for display
  const taskStatusCounts = (zoneTasks: Task[]) => {
    const counts = { pending: 0, in_progress: 0, complete: 0, blocked: 0 };
    zoneTasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  };

  // Sort checkpoints newest first
  const sortedCheckpoints = [...checkpoints].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );

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

          {groups.map((g) => {
            const counts = taskStatusCounts(g.tasks);
            return (
              <div key={g.zone} className="flex flex-col gap-0">
                <ZoneGroup
                  zone={g.zone}
                  workers={g.workers}
                  defaultOpen={
                    g.workers.some((w) => w.status === "busy") ||
                    g.tasks.some((t) => t.status === "in_progress")
                  }
                  onKillWorker={onKillWorker}
                />
                {g.tasks.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 border-x border-b border-white/[0.04] rounded-b-lg -mt-px bg-white/[0.01]">
                    <span className="text-[9px] font-mono text-[#6b6560] uppercase tracking-wider mr-1">
                      Tasks
                    </span>
                    {counts.complete > 0 && (
                      <Badge variant="success">{counts.complete} ✓</Badge>
                    )}
                    {counts.in_progress > 0 && (
                      <Badge variant="accent">{counts.in_progress} ⚙</Badge>
                    )}
                    {counts.pending > 0 && <Badge>{counts.pending} ○</Badge>}
                    {counts.blocked > 0 && (
                      <Badge variant="danger">{counts.blocked} ✕</Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-1 flex flex-wrap gap-1.5 border-t border-white/[0.04] px-0.5 pt-2">
            <Badge variant="accent">{busyCount} busy</Badge>
            <Badge variant="success">{idleCount} idle</Badge>
            <Badge>{activeWorkers.length} total</Badge>
            {tasks.length > 0 && (
              <Badge>
                {tasks.filter((t) => t.status === "complete").length}/
                {tasks.length} tasks
              </Badge>
            )}
          </div>
        </div>

        {/* Checkpoints */}
        {sortedCheckpoints.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Checkpoints</SectionLabel>
            <div className="flex flex-col gap-1 rounded-lg border border-white/[0.04] bg-white/[0.01] p-2">
              {sortedCheckpoints.slice(0, 5).map((cp) => (
                <div
                  key={cp.id}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-[11px] font-mono hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[#c4b5a0]">
                    {STAGE_ICONS[cp.stage] || "📌"}
                  </span>
                  <span className="text-[#e8e4df] font-medium">{cp.stage}</span>
                  {cp.task_count !== undefined && (
                    <Badge>{cp.task_count} tasks</Badge>
                  )}
                  {cp.auto && (
                    <span className="text-[9px] text-[#6b6560] uppercase">
                      auto
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-[#4a4540]">
                    {new Date(cp.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              {sortedCheckpoints.length > 5 && (
                <span className="text-[10px] text-[#4a4540] px-2">
                  +{sortedCheckpoints.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

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
