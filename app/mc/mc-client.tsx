"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMCWebSocket } from "@/lib/mc/use-mc-websocket";
import type { GraphData } from "@/lib/mc/types";
import { adaptGraphResponse } from "@/lib/mc/adapters";
import { DashboardHeader } from "@/components/mc/dashboard-header";
import { StageOverrideDialog } from "@/components/mc/stage-override-dialog";
import { MissionView } from "@/components/mc/mission-view";
import { TraceView } from "@/components/mc/trace-view";
import { ActivityView } from "@/components/mc/activity-view";
import { SpecsView } from "@/components/mc/specs-view";
import { FindingsView } from "@/components/mc/findings-view";
import BridgeStatusIndicator from "@/components/mc/bridge-status-indicator";
import { ChatPanel } from "@/components/mc/chat-panel";
import { useChatConnection } from "@/lib/mc/use-chat-connection";
import { MC_API_URL } from "@/lib/mc/constants";

type View = "mission" | "trace" | "activity" | "specs";

export function MCClient() {
  const [view, setView] = useState<View>("mission");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const mcState = useMCWebSocket();
  const chat = useChatConnection();
  const [autoMode, setAutoMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mc-auto-mode") === "true";
    }
    return false;
  });

  const handleToggleAutoMode = useCallback(() => {
    const next = !autoMode;
    setAutoMode(next);
    localStorage.setItem("mc-auto-mode", String(next));
    if (next) {
      chat.send(
        "Enable auto mode — proceed through stages autonomously, only pause for gate approvals that need human judgment.",
      );
    } else {
      chat.send(
        "Disable auto mode — pause and ask before proceeding to each new stage.",
      );
    }
  }, [autoMode, chat]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [showStageOverride, setShowStageOverride] = useState(false);
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

  const handleStageOverride = async (stage: string, reason: string) => {
    const res = await fetch(`${MC_API_URL}/api/stages/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, reason }),
    });
    const result = await res.json();
    if (result.success) setShowStageOverride(false);
    return result;
  };

  const handleProjectSwitch = () => {
    window.location.reload();
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
        onProjectSwitch={handleProjectSwitch}
        onStageOverride={() => setShowStageOverride(true)}
      />

      {showStageOverride && (
        <StageOverrideDialog
          currentStage={mcState.stage.current}
          onConfirm={handleStageOverride}
          onCancel={() => setShowStageOverride(false)}
        />
      )}

      <main className="grid h-[calc(100vh-120px)] grid-cols-[3fr_2fr] grid-rows-[1fr] gap-3.5 px-6 pb-6">
        <div className="overflow-auto">
          {view === "mission" && (
            <MissionView
              workers={mcState.workers}
              tasks={mcState.tasks}
              checkpoints={mcState.checkpoints ?? []}
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
        </div>

        <ChatPanel
          messages={chat.messages}
          isStreaming={chat.isStreaming}
          connState={chat.connState}
          onSend={chat.send}
          autoMode={autoMode}
          onToggleAutoMode={handleToggleAutoMode}
        />
      </main>
    </div>
  );
}
