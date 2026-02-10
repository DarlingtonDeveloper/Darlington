"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMCWebSocket } from "@/lib/mc/use-mc-websocket";
import type { GraphData } from "@/lib/mc/types";
import { adaptGraphResponse } from "@/lib/mc/adapters";
import { DashboardHeader } from "@/components/mc/dashboard-header";
import { MissionView } from "@/components/mc/mission-view";
import { TraceView } from "@/components/mc/trace-view";
import { ActivityView } from "@/components/mc/activity-view";
import { SpecsView } from "@/components/mc/specs-view";
import { FindingsView } from "@/components/mc/findings-view";
import BridgeStatusIndicator from "@/components/mc/bridge-status-indicator";
import { MC_API_URL } from "@/lib/mc/constants";

type View = "mission" | "trace" | "activity" | "specs";

export function MCClient() {
  const [view, setView] = useState<View>("mission");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const mcState = useMCWebSocket();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch(`${MC_API_URL}/api/graph`);
      if (!res.ok) return;
      const raw = await res.json();
      const adapted = adaptGraphResponse(raw);
      if (adapted) setGraphData(adapted);
    } catch {
      // keep existing graphData
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Use graph from WS sync if available
  useEffect(() => {
    if (mcState.graph) setGraphData(mcState.graph);
  }, [mcState.graph]);

  // Re-fetch when tasks change (debounced)
  const prevTasksRef = useRef(mcState.tasks);
  useEffect(() => {
    if (prevTasksRef.current !== mcState.tasks) {
      prevTasksRef.current = mcState.tasks;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(fetchGraph, 500);
    }
  }, [mcState.tasks, fetchGraph]);

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

        {view === "trace" && (
          <>
            <TraceView
              graph={graphData}
              tasks={mcState.tasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
            />
            <FindingsView taskId={selectedTaskId} baseUrl={MC_API_URL} />
          </>
        )}

        {view === "specs" && <SpecsView baseUrl={MC_API_URL} />}

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
