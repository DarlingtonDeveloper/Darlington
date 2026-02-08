"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { MCState, Task, Worker, Stage, GateCriteria } from "./types";
import { MC_API_URL, MC_WS_URL, MC_TOKEN } from "./constants";

interface MCEvent {
  topic: string;
  type: string;
  data: Record<string, unknown>;
}

const initialState: MCState = {
  stage: { current: "discovery" },
  tasks: [],
  workers: [],
  gates: {},
  tokens: {
    total_tokens: 0,
    total_cost: 0,
    budget_limit: 0,
    budget_used: 0,
    sessions: [],
  },
  connected: false,
};

function handleTaskEvent(prev: MCState, event: MCEvent): MCState {
  const task = event.data as unknown as Task;
  switch (event.type) {
    case "created":
      return { ...prev, tasks: [...prev.tasks, task] };
    case "updated":
    case "status_changed":
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === task.id ? { ...t, ...task } : t,
        ),
      };
    case "deleted":
      return { ...prev, tasks: prev.tasks.filter((t) => t.id !== task.id) };
    default:
      return prev;
  }
}

function handleWorkerEvent(prev: MCState, event: MCEvent): MCState {
  const worker = event.data as unknown as Worker;
  switch (event.type) {
    case "spawned":
      return { ...prev, workers: [...prev.workers, worker] };
    case "updated":
    case "status_changed":
      return {
        ...prev,
        workers: prev.workers.map((w) =>
          w.id === worker.id ? { ...w, ...worker } : w,
        ),
      };
    case "terminated":
      return {
        ...prev,
        workers: prev.workers.filter((w) => w.id !== worker.id),
      };
    default:
      return prev;
  }
}

export function useMCWebSocket() {
  const [state, setState] = useState<MCState>(initialState);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const url = MC_TOKEN ? `${MC_WS_URL}?token=${MC_TOKEN}` : MC_WS_URL;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(
        JSON.stringify({
          type: "subscribe",
          topics: [
            "stage",
            "task",
            "worker",
            "gate",
            "token",
            "chat",
            "zone",
            "checkpoint",
            "audit",
          ],
        }),
      );
    };

    ws.onmessage = (ev) => {
      const event: MCEvent = JSON.parse(ev.data);

      // Handle initial state sync
      if (event.topic === "sync" && event.type === "initial_state") {
        const d = event.data as Record<string, unknown>;
        setState((prev) => ({
          ...prev,
          stage: (d?.stage as MCState["stage"]) ?? prev.stage,
          tasks: (Array.isArray(d?.tasks) ? d.tasks : prev.tasks) as Task[],
          workers: (Array.isArray(d?.workers)
            ? d.workers
            : prev.workers) as Worker[],
          gates: (d?.gates as MCState["gates"]) ?? prev.gates,
          tokens: (d?.tokens as MCState["tokens"]) ?? prev.tokens,
          connected: true,
        }));
        return;
      }

      // Handle topic events
      setState((prev) => {
        switch (event.topic) {
          case "stage":
            return { ...prev, stage: { current: event.data.current as Stage } };
          case "task":
            return handleTaskEvent(prev, event);
          case "worker":
            return handleWorkerEvent(prev, event);
          case "gate":
            return {
              ...prev,
              gates: {
                ...prev.gates,
                [event.data.stage as string]:
                  event.data as unknown as GateCriteria,
              },
            };
          case "token":
            return { ...prev, tokens: { ...prev.tokens, ...event.data } };
          default:
            return prev;
        }
      });
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  const sendChat = useCallback(async (message: string) => {
    const res = await fetch(`${MC_API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return res.json();
  }, []);

  const approveGate = useCallback(async (stage: string) => {
    const res = await fetch(`${MC_API_URL}/api/gates/${stage}/approve`, {
      method: "POST",
    });
    return res.json();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  return { ...state, connected, sendChat, approveGate };
}
