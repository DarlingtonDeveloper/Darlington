"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "@/components/kai/message-bubble";
import { TypingIndicator } from "@/components/kai/typing-indicator";
import { PipelineBar } from "@/components/mc/pipeline-bar";
import { MissionView } from "@/components/mc/mission-view";
import { DEMO_SCRIPT, INITIAL_STATE, type DemoState } from "./demo-script";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function DemoClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [demoState, setDemoState] = useState<DemoState>(INITIAL_STATE);
  const [isTyping, setIsTyping] = useState(false);
  const [hasDashboard, setHasDashboard] = useState(false);
  const [done, setDone] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "dashboard">("chat");
  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const runStep = useCallback(() => {
    const idx = stepRef.current;
    if (idx >= DEMO_SCRIPT.length) {
      setDone(true);
      return;
    }

    const step = DEMO_SCRIPT[idx];

    timerRef.current = setTimeout(() => {
      if (step.type === "message") {
        if (step.role === "assistant") {
          // Show typing indicator briefly, then reveal message
          setIsTyping(true);
          timerRef.current = setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
              ...prev,
              { role: step.role!, content: step.content! },
            ]);
            stepRef.current++;
            runStep();
          }, 1200);
        } else {
          // User messages appear immediately
          setMessages((prev) => [
            ...prev,
            { role: step.role!, content: step.content! },
          ]);
          stepRef.current++;
          runStep();
        }
      } else if (step.type === "state" && step.patch) {
        setDemoState((prev) => ({ ...prev, ...step.patch! }));
        if (!hasDashboard) {
          setHasDashboard(true);
        }
        stepRef.current++;
        runStep();
      }
    }, step.delay);
  }, [hasDashboard]);

  const startDemo = useCallback(() => {
    setMessages([]);
    setDemoState(INITIAL_STATE);
    setIsTyping(false);
    setHasDashboard(false);
    setDone(false);
    setMobileTab("chat");
    stepRef.current = 0;
    runStep();
  }, [runStep]);

  // Auto-start on mount
  useEffect(() => {
    startDemo();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  return (
    <div className="flex h-full relative">
      {/* Chat panel */}
      <div
        className={[
          "flex flex-col transition-all duration-500 ease-out",
          hasDashboard ? "w-[400px] shrink-0 max-md:w-full" : "w-full",
          hasDashboard && mobileTab === "dashboard" ? "max-md:hidden" : "",
        ].join(" ")}
      >
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div
            className={[
              "flex flex-col gap-3 py-4",
              hasDashboard ? "" : "max-w-2xl mx-auto",
            ].join(" ")}
            role="list"
          >
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 sm:px-6 py-3 text-center"
          style={{ borderTop: "1px solid oklch(1 0 0 / 8%)" }}
        >
          {done ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={startDemo}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  background: "oklch(1 0 0 / 6%)",
                  color: "var(--fg, #e8e4df)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                }}
              >
                Replay demo
              </button>
              <Link
                href="/signup"
                className="text-xs transition-opacity hover:opacity-80"
                style={{ color: "var(--accent, #c4b5a0)" }}
              >
                Sign up to try DutyBound
              </Link>
            </div>
          ) : (
            <p className="text-xs" style={{ color: "var(--fg2, #6b6560)" }}>
              This is a demo — sign up to try DutyBound
            </p>
          )}
        </div>
      </div>

      {/* Dashboard panel */}
      {hasDashboard && (
        <div
          className={[
            "flex-1 min-w-0 overflow-y-auto px-4 py-3 transition-all duration-500 ease-out animate-in fade-in slide-in-from-right-4",
            "border-l",
            mobileTab === "chat" ? "max-md:hidden" : "max-md:w-full",
          ].join(" ")}
          style={{ borderColor: "oklch(1 0 0 / 8%)" }}
        >
          <PipelineBar currentStage={demoState.stage} gates={demoState.gates} />
          <MissionView
            workers={demoState.workers}
            tasks={demoState.tasks}
            checkpoints={demoState.checkpoints}
            gates={demoState.gates}
            tokens={demoState.tokens}
            currentStage={demoState.stage}
            onKillWorker={() => {}}
          />
        </div>
      )}

      {/* Mobile tab bar */}
      {hasDashboard && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-50">
          <div
            className="flex border-t"
            style={{
              background: "var(--bg, #07070e)",
              borderColor: "oklch(1 0 0 / 8%)",
            }}
          >
            <button
              onClick={() => setMobileTab("chat")}
              className={[
                "flex-1 py-3 text-xs font-medium text-center transition-colors",
                mobileTab === "chat" ? "text-[#c4b5a0]" : "text-[#6b6560]",
              ].join(" ")}
            >
              Chat
            </button>
            <button
              onClick={() => setMobileTab("dashboard")}
              className={[
                "flex-1 py-3 text-xs font-medium text-center transition-colors",
                mobileTab === "dashboard" ? "text-[#c4b5a0]" : "text-[#6b6560]",
              ].join(" ")}
            >
              Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
