"use client";
import { useBridgeStatus } from "@/lib/mc/use-bridge-status";

interface BridgeStatusIndicatorProps {
  baseUrl: string;
}

export default function BridgeStatusIndicator({
  baseUrl,
}: BridgeStatusIndicatorProps) {
  const { connected, loading } = useBridgeStatus(baseUrl);

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`h-2 w-2 rounded-full ${
          loading
            ? "bg-zinc-500 animate-pulse"
            : connected
              ? "bg-emerald-400"
              : "bg-red-400"
        }`}
      />
      <span className="text-xs text-zinc-500">Bridge</span>
    </div>
  );
}
