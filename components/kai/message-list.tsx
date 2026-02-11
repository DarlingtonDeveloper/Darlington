"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { StarterPrompts, type StarterPrompt } from "./starter-prompts";
import type { Message } from "@/app/kai/kai-client";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  starters?: StarterPrompt[];
  onStarterSelect?: (message: string) => void;
}

export function MessageList({
  messages,
  isStreaming,
  starters,
  onStarterSelect,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  useEffect(() => {
    if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  const lastMsg = messages[messages.length - 1];
  const showTyping = isStreaming && lastMsg?.role === "user";

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4"
      role="list"
      aria-label="Chat messages"
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center px-8">
          <div className="flex flex-col items-center">
            <p
              className="font-display text-2xl mb-2"
              style={{ color: "var(--accent, #c4b5a0)" }}
            >
              Kai
            </p>
            {starters && starters.length > 0 && onStarterSelect ? (
              <div className="mt-4">
                <StarterPrompts
                  starters={starters}
                  onSelect={onStarterSelect}
                />
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--fg2, #6b6560)" }}>
                Ask me anything
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}
          {showTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
