"use client";
import { useState, useEffect } from "react";

interface BridgeStatus {
  connected: boolean;
  loading: boolean;
}

export function useBridgeStatus(baseUrl: string): BridgeStatus {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/openclaw/status`);
        if (!active) return;
        setConnected(res.ok);
      } catch {
        if (!active) return;
        setConnected(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    check();
    const interval = setInterval(check, 10_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [baseUrl]);

  return { connected, loading };
}
