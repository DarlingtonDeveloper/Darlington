"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  getDeviceIdentity,
  buildSignaturePayload,
  signMessage,
} from "@/lib/kai/gateway-identity";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

type ConnState = "connecting" | "connected" | "disconnected" | "error";

function uuid(): string {
  return crypto.randomUUID();
}

/**
 * Extract text from a gateway message object (handles string, array of content blocks, or .text).
 */
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

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [connState, setConnState] = useState<ConnState>("connecting");
  const endRef = useRef<HTMLDivElement>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<
    Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>
  >(new Map());
  const streamContentRef = useRef("");
  const assistantMsgIdRef = useRef<string | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configRef = useRef<{
    wsUrl: string;
    token: string;
    sessionKey: string;
  } | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send typed request over WS
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

  // Fetch WS config from the Kai chat API route (same auth)
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

  // Connect to OpenClaw gateway directly
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

        // Challenge → authenticate with device identity
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

            // Load history
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

        // Chat streaming events
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

      // Response frames
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
      if (event.code === 1008 || event.code === 4001 || event.code === 4008)
        return;
      reconnectTimer.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => setConnState("error");
  }, [fetchConfig, request]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(() => {
    if (!input.trim() || isStreaming || connState !== "connected") return;
    const text = input.trim();
    const config = configRef.current;
    if (!config) return;

    const userMsg: Message = {
      id: uuid(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    streamContentRef.current = "";
    assistantMsgIdRef.current = null;

    request("chat.send", {
      sessionKey: config.sessionKey || "webchat",
      message: text,
      deliver: false,
      idempotencyKey: uuid(),
    }).catch(() => {
      setIsStreaming(false);
    });
  }, [input, isStreaming, connState, request]);

  const isOnline = connState === "connected";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="text-sm">🤖</span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#a89880]">
          Kai
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-amber-400"}`}
          />
          <span className="rounded-full border border-[#c4b5a0]/20 bg-[#c4b5a0]/15 px-2 py-0.5 text-[10px] font-medium text-[#c4b5a0]">
            {isOnline ? "live" : connState}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-[10px] px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "border border-[#c4b5a0]/20 bg-[#c4b5a0]/15 text-[#e8e4df]"
                  : "border border-white/[0.06] bg-white/[0.03] text-[#a89880]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isStreaming && !assistantMsgIdRef.current && (
          <div className="flex justify-start">
            <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-[#a89880]">
              <span className="animate-pulse">…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-white/[0.06] p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={isOnline ? "Message Kai..." : "Connecting..."}
          disabled={!isOnline}
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#e8e4df] placeholder-[#4a4540] outline-none transition-colors focus:border-[#c4b5a0]/30"
        />
        <button
          onClick={send}
          disabled={!isOnline || !input.trim() || isStreaming}
          className="rounded-lg border border-[#c4b5a0]/20 bg-[#c4b5a0]/15 px-3 py-2 text-xs font-medium text-[#c4b5a0] transition-colors hover:bg-[#c4b5a0]/25 disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
