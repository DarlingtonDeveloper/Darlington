"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  getDeviceIdentity,
  buildSignaturePayload,
  signMessage,
} from "@/lib/kai/gateway-identity";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type ConnState = "connecting" | "connected" | "disconnected" | "error";

function uuid(): string {
  return crypto.randomUUID();
}

function extractText(msg: Record<string, unknown>): string | null {
  const content = msg.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const texts = content
      .filter(
        (c: unknown) =>
          (c as Record<string, unknown>).type === "text" &&
          typeof (c as Record<string, unknown>).text === "string",
      )
      .map((c: unknown) => (c as { text: string }).text);
    return texts.length > 0 ? texts.join("\n") : null;
  }
  if (typeof msg.text === "string") return msg.text;
  return null;
}

export interface ChatConnection {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isStreaming: boolean;
  connState: ConnState;
  send: (text: string) => void;
}

export function useChatConnection(): ChatConnection {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connState, setConnState] = useState<ConnState>("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<
    Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>
  >(new Map());
  const streamContentRef = useRef("");
  const assistantMsgIdRef = useRef<string | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(1000);
  const connectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configRef = useRef<{
    wsUrl: string;
    token: string;
    sessionKey: string;
  } | null>(null);

  const request = useCallback(
    (method: string, params: Record<string, unknown>): Promise<unknown> => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        return Promise.reject(new Error("Not connected"));
      }
      const id = uuid();
      const frame = { type: "req", id, method, params };
      return new Promise((resolve, reject) => {
        pendingRef.current.set(id, { resolve, reject });
        ws.send(JSON.stringify(frame));
      });
    },
    [],
  );

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/kai/chat");
      if (!res.ok) return null;
      return (await res.json()) as {
        wsUrl: string;
        token: string;
        sessionKey: string;
      };
    } catch {
      return null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const config = configRef.current || (await fetchConfig());
    if (!config) {
      setConnState("error");
      return;
    }
    configRef.current = config;
    setConnState("connecting");

    const ws = new WebSocket(config.wsUrl);
    wsRef.current = ws;

    // 30s timeout for connect + auth handshake
    connectTimeout.current = setTimeout(() => {
      if (connState !== "connected" && ws.readyState !== WebSocket.CLOSED) {
        ws.close();
        setConnState("error");
      }
    }, 30000);

    ws.onmessage = async (event) => {
      let frame: Record<string, unknown>;
      try {
        frame = JSON.parse(event.data);
      } catch {
        return;
      }

      if (frame.type === "event") {
        const eventName = frame.event as string;
        const payload = frame.payload as Record<string, unknown> | undefined;

        if (eventName === "connect.challenge") {
          const nonce = (payload?.nonce as string) || null;
          try {
            const device = await getDeviceIdentity();
            const signedAt = Date.now();
            const scopes = ["operator.read", "operator.write"];
            const sigPayload = buildSignaturePayload({
              deviceId: device.deviceId,
              clientId: "webchat",
              clientMode: "webchat",
              role: "operator",
              scopes,
              signedAtMs: signedAt,
              token: config.token || null,
              nonce,
            });
            const signature = await signMessage(device.privateKey, sigPayload);
            await request("connect", {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: "webchat",
                version: "1.0.0",
                platform: "web",
                mode: "webchat",
              },
              role: "operator",
              scopes,
              caps: [],
              auth: { token: config.token },
              device: {
                id: device.deviceId,
                publicKey: device.publicKey,
                signature,
                signedAt,
                nonce,
              },
              userAgent: navigator.userAgent,
              locale: navigator.language,
            });
            setConnState("connected");
            reconnectDelay.current = 1000; // reset backoff on success
            if (connectTimeout.current) {
              clearTimeout(connectTimeout.current);
              connectTimeout.current = null;
            }

            try {
              const result = (await request("chat.history", {
                sessionKey: config.sessionKey || "webchat",
                limit: 50,
              })) as { messages?: Array<Record<string, unknown>> };
              if (result.messages && Array.isArray(result.messages)) {
                setMessages(
                  result.messages
                    .filter((m) => m.role === "user" || m.role === "assistant")
                    .map((m) => ({
                      id: uuid(),
                      role: m.role as "user" | "assistant",
                      content: extractText(m) || "",
                      timestamp: (m.timestamp as number) || Date.now(),
                    }))
                    .filter((m) => m.content),
                );
              }
            } catch {
              // Non-fatal
            }
          } catch {
            setConnState("error");
            ws.close();
          }
          return;
        }

        if (eventName === "chat") {
          const eventSessionKey = payload?.sessionKey as string | undefined;
          if (eventSessionKey && eventSessionKey !== config.sessionKey) return;

          const state = payload?.state as string | undefined;
          const message = payload?.message as
            | Record<string, unknown>
            | undefined;

          if (state === "delta" && message) {
            const text = extractText(message);
            if (typeof text === "string") {
              if (text.length >= streamContentRef.current.length) {
                streamContentRef.current = text;
              }
              if (!assistantMsgIdRef.current) {
                const id = uuid();
                assistantMsgIdRef.current = id;
                setMessages((prev) => [
                  ...prev,
                  {
                    id,
                    role: "assistant",
                    content: streamContentRef.current,
                    timestamp: Date.now(),
                  },
                ]);
              } else {
                const id = assistantMsgIdRef.current;
                const content = streamContentRef.current;
                setMessages((prev) =>
                  prev.map((m) => (m.id === id ? { ...m, content } : m)),
                );
              }
            }
          }

          if (state === "final" || state === "aborted" || state === "error") {
            streamContentRef.current = "";
            assistantMsgIdRef.current = null;
            setIsStreaming(false);
          }
        }
        return;
      }

      if (frame.type === "res") {
        const id = frame.id as string;
        const pending = pendingRef.current.get(id);
        if (!pending) return;
        pendingRef.current.delete(id);
        if (frame.ok) {
          pending.resolve(frame.payload);
        } else {
          const err = frame.error as { message?: string } | undefined;
          pending.reject(new Error(err?.message || "Request failed"));
        }
      }
    };

    ws.onclose = (event) => {
      setConnState("disconnected");
      wsRef.current = null;
      pendingRef.current.forEach((p) =>
        p.reject(new Error("Connection closed")),
      );
      pendingRef.current.clear();
      if (connectTimeout.current) {
        clearTimeout(connectTimeout.current);
        connectTimeout.current = null;
      }
      if (event.code === 1008 || event.code === 4001 || event.code === 4008)
        return;
      const delay = reconnectDelay.current;
      reconnectDelay.current = Math.min(delay * 2, 30000);
      reconnectTimer.current = setTimeout(() => connect(), delay);
    };

    ws.onerror = () => setConnState("error");
  }, [fetchConfig, request]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (connectTimeout.current) clearTimeout(connectTimeout.current);
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isStreaming || connState !== "connected") return;
      const config = configRef.current;
      if (!config) return;

      const userMsg: ChatMessage = {
        id: uuid(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      streamContentRef.current = "";
      assistantMsgIdRef.current = null;

      request("chat.send", {
        sessionKey: config.sessionKey || "webchat",
        message: text.trim(),
        deliver: false,
        idempotencyKey: uuid(),
      }).catch(() => {
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            id: uuid(),
            role: "assistant",
            content:
              "⚠️ Failed to send message. Please check your connection and try again.",
            timestamp: Date.now(),
          },
        ]);
      });
    },
    [isStreaming, connState, request],
  );

  return { messages, setMessages, isStreaming, connState, send };
}
