"use client";

import { Worker } from "@/lib/mc/types";
import { StatusDot } from "./status-dot";

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

interface WorkerCardProps {
  worker: Worker;
  onKill?: (id: string) => void;
}

export function WorkerCard({ worker: w, onKill }: WorkerCardProps) {
  const isBusy = w.status === "busy";

  return (
    <div className="flex gap-2 rounded-md border border-white/[0.04] bg-black/15 p-[7px_8px]">
      <StatusDot status={w.status} size={7} pulse={isBusy} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold text-[#e8e4df]">
            {w.persona}
          </span>
          {isBusy && onKill && (
            <button
              onClick={() => onKill(w.id)}
              className="rounded px-1.5 py-0.5 text-[10px] font-medium text-red-400 hover:bg-red-400/10 transition-colors"
            >
              ×
            </button>
          )}
        </div>
        <div className="mt-px truncate text-[10px] text-[#a89880]">
          {w.task || "Idle — awaiting task"}
        </div>
        <div className="mt-[3px] flex gap-2.5 font-mono text-[9px] text-[#4a4540]">
          <span>⏱ {formatUptime(w.uptime)}</span>
          <span>◈ {formatTokens(w.tokens)}</span>
          <span>{w.id}</span>
        </div>
        {w.stdout && w.stdout.length > 0 && isBusy && (
          <div className="mt-1 truncate rounded-sm bg-black/30 px-1.5 py-[3px] font-mono text-[9px] text-[#5a5550]">
            → {w.stdout[w.stdout.length - 1]}
          </div>
        )}
      </div>
    </div>
  );
}
