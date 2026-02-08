"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { OcConnectionState, Worker, Channel } from "./types";

const WS_URL =
  process.env.NEXT_PUBLIC_MC_WS_URL || "wss://mc.darlington.dev/ws";
const RECONNECT_DELAY = 5000;
const MAX_RETRIES = 3;

interface OcWebSocketState {
  connectionState: OcConnectionState;
  workers: Worker[];
  channels: Channel[];
}

/**
 * C3.2 — WebSocket handler for OpenClaw connection status.
 * Connects to the MC orchestrator WS endpoint for real-time updates.
 */
export function useOcWebSocket(): OcWebSocketState {
  const [connectionState, setConnectionState] =
    useState<OcConnectionState>("connecting");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retriesRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (retriesRef.current >= MAX_RETRIES) {
      setConnectionState("disconnected");
      return;
    }

    setConnectionState("connecting");

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState("connected");
        retriesRef.current = 0;
        // Request initial state
        ws.send(JSON.stringify({ type: "req", method: "mc.status" }));
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          switch (msg.type) {
            case "workers.update":
              setWorkers(msg.workers ?? []);
              break;
            case "channels.update":
              setChannels(msg.channels ?? []);
              break;
            case "mc.status":
              if (msg.workers) setWorkers(msg.workers);
              if (msg.channels) setChannels(msg.channels);
              break;
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => setConnectionState("error");

      ws.onclose = () => {
        setConnectionState("disconnected");
        wsRef.current = null;
        retriesRef.current++;
        if (retriesRef.current < MAX_RETRIES) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };
    } catch {
      setConnectionState("disconnected");
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connectionState, workers, channels };
}
