"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { KaiClient } from "../kai/kai-client";
import { MC_API_URL } from "@/lib/mc/constants";

type ServiceStatus = "sleeping" | "starting" | "ready" | "error";

export function DutyBoundClient() {
  const [status, setStatus] = useState<ServiceStatus>("sleeping");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  useEffect(() => {
    let mounted = true;

    async function init() {
      const health = await checkHealth();
      if (!mounted) return;

      if (health === "ready") {
        setStatus("ready");
        return;
      }

      // Not ready — send wake and start polling
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

  if (status === "ready") {
    return <KaiClient />;
  }

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
          <p className="text-sm mb-4" style={{ color: "var(--fg2, #6b6560)" }}>
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
