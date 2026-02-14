"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, ConnState } from "@/lib/mc/use-chat-connection";

/* ── Starter prompts ─────────────────────────────────────── */

const STARTERS = [
  {
    icon: "📊",
    label: "Project status",
    message: "What's the current project status?",
  },
  { icon: "🚀", label: "Run next stage", message: "Run the next stage" },
  {
    icon: "📋",
    label: "Show blockers",
    message: "What tasks are blocked and why?",
  },
  {
    icon: "🧪",
    label: "Run verify",
    message: "Run verification on completed tasks",
  },
] as const;

function ChatStarters({
  onSelect,
  disabled,
}: {
  onSelect: (m: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
      <span className="text-xs text-[#4a4540]">Ask Kai anything, or try:</span>
      <div className="grid grid-cols-2 gap-2">
        {STARTERS.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(s.message)}
            disabled={disabled}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-left text-[11px] text-[#a89880] transition-colors hover:border-[#c4b5a0]/20 hover:bg-[#c4b5a0]/10 disabled:opacity-40"
          >
            <span className="mr-1.5">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────── */

export interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  connState: ConnState;
  onSend: (text: string) => void;
  autoMode: boolean;
  onToggleAutoMode: () => void;
}

/* ── Component ────────────────────────────────────────────── */

export function ChatPanel({
  messages,
  isStreaming,
  connState,
  onSend,
  autoMode,
  onToggleAutoMode,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const autoModeRef = useRef(autoMode);
  const onToggleAutoModeRef = useRef(onToggleAutoMode);

  useEffect(() => {
    autoModeRef.current = autoMode;
  }, [autoMode]);

  useEffect(() => {
    onToggleAutoModeRef.current = onToggleAutoMode;
  }, [onToggleAutoMode]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const isOnline = connState === "connected";

  const handleSend = () => {
    if (!input.trim() || isStreaming || !isOnline) return;
    onSend(input.trim());
    setInput("");
  };

  const handleToggleAutoMode = useCallback(() => {
    onToggleAutoModeRef.current();
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="text-sm">🤖</span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#a89880]">
          Kai
        </span>

        {/* Auto mode toggle */}
        <button
          onClick={handleToggleAutoMode}
          disabled={!isOnline || isStreaming}
          className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
            autoMode
              ? "border border-emerald-400/30 bg-emerald-400/15 text-emerald-400"
              : "border border-white/[0.08] bg-white/[0.04] text-[#4a4540] hover:text-[#a89880]"
          } disabled:opacity-40`}
        >
          {autoMode ? "⚡ Auto" : "Auto"}
        </button>

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
      <div
        ref={messagesRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <ChatStarters onSelect={onSend} disabled={!isOnline} />
        ) : (
          <>
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
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-xs max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_pre]:bg-white/[0.05] [&_pre]:p-2 [&_pre]:rounded [&_code]:text-[#c4b5a0] [&_a]:text-[#c4b5a0] [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:mt-1 [&_h3]:mb-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isStreaming &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-[#a89880]">
                    <span className="animate-pulse">…</span>
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-white/[0.06] p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isOnline ? "Message Kai..." : "Connecting..."}
          disabled={!isOnline}
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#e8e4df] placeholder-[#4a4540] outline-none transition-colors focus:border-[#c4b5a0]/30"
        />
        <button
          onClick={handleSend}
          disabled={!isOnline || !input.trim() || isStreaming}
          className="rounded-lg border border-[#c4b5a0]/20 bg-[#c4b5a0]/15 px-3 py-2 text-xs font-medium text-[#c4b5a0] transition-colors hover:bg-[#c4b5a0]/25 disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
