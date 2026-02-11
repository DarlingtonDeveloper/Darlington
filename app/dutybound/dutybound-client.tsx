"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { KaiClient } from "../kai/kai-client";
import { MC_API_URL } from "@/lib/mc/constants";
import type { StarterPrompt } from "@/components/kai/starter-prompts";

const DashboardPanel = lazy(() =>
  import("./dashboard-panel").then((m) => ({ default: m.DashboardPanel })),
);

type ServiceStatus = "sleeping" | "starting" | "ready" | "error";
type ProjectState = "unknown" | "none" | "active";

const ONBOARDING_STARTERS: StarterPrompt[] = [
  {
    label: "I want to start a new project",
    message: "I want to start a new project",
  },
  {
    label: "I have a repo I'd like to work on",
    message: "I have a repo I'd like to work on",
  },
  {
    label: "Show me how DutyBound works",
    message: "Show me how DutyBound works",
  },
];

export function DutyBoundClient() {
  const [status, setStatus] = useState<ServiceStatus>("sleeping");
  const [error, setError] = useState<string | null>(null);
  const [projectState, setProjectState] = useState<ProjectState>("unknown");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const projectPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeSent = useRef(false);

  const checkHealth = useCallback(async (): Promise<ServiceStatus> => {
    try {
      const res = await fetch(`${MC_API_URL}/api/health`, {
        cache: "no-store",
      });
      if (!res.ok) return "error";
      const data = await res.json();
      return (data.status as ServiceStatus) || "error";
    } catch {
      return "error";
    }
  }, []);

  const sendWake = useCallback(async () => {
    try {
      await fetch(`${MC_API_URL}/api/wake`, {
        method: "POST",
        cache: "no-store",
      });
    } catch {
      // Wake failure is handled by health polling
    }
  }, []);

  const checkProjectState = useCallback(async (): Promise<ProjectState> => {
    try {
      const res = await fetch(`${MC_API_URL}/api/status`, {
        cache: "no-store",
      });
      if (!res.ok) return "none";
      const data = await res.json();
      if (data.stage?.current) return "active";
      return "none";
    } catch {
      return "none";
    }
  }, []);

  // Service wake/health polling
  useEffect(() => {
    let mounted = true;

    async function init() {
      const health = await checkHealth();
      if (!mounted) return;

      if (health === "ready") {
        setStatus("ready");
        return;
      }

      if (!wakeSent.current) {
        wakeSent.current = true;
        setStatus("starting");
        await sendWake();
      }

      pollRef.current = setInterval(async () => {
        const s = await checkHealth();
        if (!mounted) return;

        if (s === "ready") {
          setStatus("ready");
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } else if (s === "error") {
          setError("Could not reach DutyBound services");
          setStatus("error");
        } else {
          setStatus(s);
        }
      }, 3000);
    }

    init();

    return () => {
      mounted = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [checkHealth, sendWake]);

  // Project state detection — runs once services are ready
  useEffect(() => {
    if (status !== "ready") return;
    let mounted = true;

    async function detect() {
      const state = await checkProjectState();
      if (mounted) setProjectState(state);
    }

    detect();

    // If no project yet, poll every 10s for transition
    projectPollRef.current = setInterval(async () => {
      const state = await checkProjectState();
      if (!mounted) return;
      if (state === "active") {
        setProjectState("active");
        if (projectPollRef.current) {
          clearInterval(projectPollRef.current);
          projectPollRef.current = null;
        }
      }
    }, 10000);

    return () => {
      mounted = false;
      if (projectPollRef.current) {
        clearInterval(projectPollRef.current);
        projectPollRef.current = null;
      }
    };
  }, [status, checkProjectState]);

  // Mobile tab state — must be before early returns (hooks rule)
  const [mobileTab, setMobileTab] = useState<"chat" | "dashboard">("chat");

  // Not ready yet — show wake/error UI
  if (status !== "ready") {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8 text-center">
        {status === "error" ? (
          <>
            <p
              className="font-display text-xl mb-2"
              style={{ color: "var(--accent, #c4b5a0)" }}
            >
              Connection failed
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--fg2, #6b6560)" }}
            >
              {error || "Could not reach DutyBound services."}
            </p>
            <button
              onClick={() => {
                setError(null);
                setStatus("starting");
                wakeSent.current = false;
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: "var(--accent, #c4b5a0)",
                color: "var(--bg, #07070e)",
              }}
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "oklch(1 0 0 / 10%)",
                  borderTopColor: "var(--accent, #c4b5a0)",
                }}
              />
            </div>
            <p
              className="font-display text-xl mb-2"
              style={{ color: "var(--accent, #c4b5a0)" }}
            >
              Waking up
            </p>
            <p className="text-sm" style={{ color: "var(--fg2, #6b6560)" }}>
              {status === "sleeping"
                ? "Sending wake signal..."
                : "Starting services, this may take a moment..."}
            </p>
          </>
        )}
      </div>
    );
  }

  // Services ready — onboarding (full-screen chat) or split layout
  const isActive = projectState === "active";

  return (
    <div className="flex h-full relative">
      {/* Chat panel */}
      <div
        className={[
          "flex flex-col transition-all duration-500 ease-out",
          isActive ? "w-[400px] shrink-0 max-md:w-full" : "w-full",
          // On mobile when dashboard tab is active, hide chat
          isActive && mobileTab === "dashboard" ? "max-md:hidden" : "",
        ].join(" ")}
      >
        <KaiClient
          starters={projectState === "none" ? ONBOARDING_STARTERS : undefined}
        />
      </div>

      {/* Dashboard panel — slides in when project is active */}
      {isActive && (
        <div
          className={[
            "flex-1 min-w-0 transition-all duration-500 ease-out animate-in fade-in slide-in-from-right-4",
            // On mobile, show only when dashboard tab is selected
            mobileTab === "chat" ? "max-md:hidden" : "max-md:w-full",
          ].join(" ")}
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div
                  className="w-6 h-6 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "oklch(1 0 0 / 10%)",
                    borderTopColor: "var(--accent, #c4b5a0)",
                  }}
                />
              </div>
            }
          >
            <DashboardPanel />
          </Suspense>
        </div>
      )}

      {/* Mobile tab bar when project is active */}
      {isActive && (
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
