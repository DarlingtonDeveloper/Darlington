"use client";

import { useState } from "react";
import { useMCWebSocket } from "@/lib/mc/use-mc-websocket";
import { DashboardHeader } from "@/components/mc/dashboard-header";
import { MissionView } from "@/components/mc/mission-view";
import { TraceView } from "@/components/mc/trace-view";
import { ActivityView } from "@/components/mc/activity-view";
import BridgeStatusIndicator from "@/components/mc/bridge-status-indicator";
import { MC_API_URL } from "@/lib/mc/constants";

type View = "mission" | "trace" | "activity";

export function MCClient() {
  const [view, setView] = useState<View>("mission");
  const mcState = useMCWebSocket();

  const handleKillWorker = async (id: string) => {
    await fetch(`${MC_API_URL}/api/workers/${id}/kill`, { method: "POST" });
  };

  const handleApproveGate = async (stage: string) => {
    await fetch(`${MC_API_URL}/api/gates/${stage}/approve`, { method: "POST" });
  };

  const handleRejectGate = async (stage: string) => {
    await fetch(`${MC_API_URL}/api/gates/${stage}/reject`, { method: "POST" });
  };

  const handleCreateCheckpoint = async () => {
    await fetch(`${MC_API_URL}/api/checkpoints`, { method: "POST" });
  };

  const handleRestoreCheckpoint = async (id: string) => {
    await fetch(`${MC_API_URL}/api/checkpoints/${id}/restart`, {
      method: "POST",
    });
  };

  return (
    <div className="min-h-screen bg-[#07070e] text-[#e8e4df]">
      <div className="flex items-center justify-between px-6 pt-2">
        <div />
        <BridgeStatusIndicator baseUrl={MC_API_URL} />
      </div>
      <DashboardHeader
        state={mcState}
        view={view}
        setView={(v: string) => setView(v as View)}
      />

      <main className="px-6 pb-6">
        {view === "mission" && (
          <MissionView
            workers={mcState.workers}
            gates={mcState.gates}
            tokens={mcState.tokens}
            currentStage={mcState.stage.current}
            onKillWorker={handleKillWorker}
          />
        )}

        {view === "trace" && <TraceView graph={null} tasks={mcState.tasks} />}

        {view === "activity" && (
          <ActivityView
            gates={mcState.gates}
            currentStage={mcState.stage.current}
            audit={mcState.audit ?? []}
            workers={mcState.workers}
            tasks={mcState.tasks}
            checkpoints={mcState.checkpoints ?? []}
            tokens={mcState.tokens}
            onApproveGate={handleApproveGate}
            onRejectGate={handleRejectGate}
            onCreateCheckpoint={handleCreateCheckpoint}
            onRestoreCheckpoint={handleRestoreCheckpoint}
          />
        )}
      </main>
    </div>
  );
}
