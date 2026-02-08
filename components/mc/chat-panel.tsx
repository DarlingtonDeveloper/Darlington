"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/lib/mc/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  connected: boolean;
}

export function ChatPanel({ messages, onSend, connected }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="text-sm">🤖</span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#a89880]">
          Kai
        </span>
        <span className="ml-auto rounded-full bg-[#c4b5a0]/15 border border-[#c4b5a0]/20 px-2 py-0.5 text-[10px] font-medium text-[#c4b5a0]">
          coordinator
        </span>
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
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-white/[0.06] p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message Kai..."
          disabled={!connected}
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#e8e4df] placeholder-[#4a4540] outline-none focus:border-[#c4b5a0]/30 transition-colors"
        />
        <button
          onClick={send}
          disabled={!connected || !input.trim()}
          className="rounded-lg bg-[#c4b5a0]/15 border border-[#c4b5a0]/20 px-3 py-2 text-xs font-medium text-[#c4b5a0] hover:bg-[#c4b5a0]/25 disabled:opacity-40 transition-colors"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
