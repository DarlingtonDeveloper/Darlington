"use client";

import { useState } from "react";
import { useMCWebSocket } from "@/lib/mc/use-mc-websocket";
import { DashboardHeader } from "@/components/mc/dashboard-header";
import { MissionView } from "@/components/mc/mission-view";
import { TraceView } from "@/components/mc/trace-view";
import { ActivityView } from "@/components/mc/activity-view";
import type { ChatMessage } from "@/lib/mc/types";
import { MC_API_URL } from "@/lib/mc/constants";

type View = "mission" | "trace" | "activity";

export function MCClient() {
  const [view, setView] = useState<View>("mission");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const mcState = useMCWebSocket();

  const handleSendChat = async (content: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`${MC_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Chat unavailable
    }
  };

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
      <DashboardHeader
        state={mcState}
        view={view}
        setView={(v: string) => setView(v as View)}
      />

      <main className="px-6 pb-6">
        {view === "mission" && (
          <MissionView
            workers={mcState.workers}
            messages={messages}
            onSendChat={handleSendChat}
            onKillWorker={handleKillWorker}
            connected={mcState.connected}
          />
        )}

        {view === "trace" && <TraceView graph={null} tasks={mcState.tasks} />}

        {view === "activity" && (
          <ActivityView
            gates={mcState.gates}
            currentStage={mcState.stage.current}
            audit={[]}
            workers={mcState.workers}
            tasks={mcState.tasks}
            checkpoints={[]}
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
