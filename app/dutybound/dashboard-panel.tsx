"use client";

import { useMCWebSocket } from "@/lib/mc/use-mc-websocket";
import { PipelineBar } from "@/components/mc/pipeline-bar";
import { MissionView } from "@/components/mc/mission-view";
import { MC_API_URL } from "@/lib/mc/constants";

export function DashboardPanel() {
  const mcState = useMCWebSocket();

  const handleKillWorker = async (id: string) => {
    await fetch(`${MC_API_URL}/api/workers/${id}/kill`, { method: "POST" });
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      <PipelineBar currentStage={mcState.stage.current} gates={mcState.gates} />
      <MissionView
        workers={mcState.workers}
        tasks={mcState.tasks}
        checkpoints={mcState.checkpoints ?? []}
        gates={mcState.gates}
        tokens={mcState.tokens}
        currentStage={mcState.stage.current}
        onKillWorker={handleKillWorker}
      />
    </div>
  );
}
