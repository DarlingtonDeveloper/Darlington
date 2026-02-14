"use client";

import { useState } from "react";
import type { Worker } from "@/lib/mc/types";
import { Badge } from "./badge";

const STATUS_BADGE: Record<
  string,
  {
    variant: "warning" | "accent" | "success" | "danger" | "default";
    label: string;
  }
> = {
  spawning: { variant: "warning", label: "spawning" },
  running: { variant: "accent", label: "running" },
  busy: { variant: "accent", label: "busy" },
  complete: { variant: "success", label: "complete" },
  failed: { variant: "danger", label: "failed" },
  idle: { variant: "success", label: "idle" },
  error: { variant: "danger", label: "error" },
  offline: { variant: "default", label: "offline" },
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function truncateId(id: string, len = 10): string {
  return id.length > len ? id.slice(0, len) + "…" : id;
}

interface WorkerPanelProps {
  workers: Worker[];
}

export default function WorkerPanel({ workers }: WorkerPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeCount = workers.filter(
    (w) =>
      w.status === "busy" || w.status === "running" || w.status === "spawning",
  ).length;

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-white/[0.06] bg-[#1a1816] p-3">
      <div className="flex items-center justify-between px-0.5 pb-1">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6b6560]">
          ◈ Workers
        </span>
      </div>

      {workers.length === 0 ? (
        <div className="py-8 text-center text-[11px] font-mono text-[#4a4540]">
          No workers active
        </div>
      ) : (
        <div className="flex flex-col gap-1 overflow-auto">
          {workers.map((w) => {
            const isExpanded = expanded === w.id;
            const badge = STATUS_BADGE[w.status] ?? {
              variant: "default" as const,
              label: w.status,
            };

            return (
              <div key={w.id}>
                <div
                  className="flex items-center gap-2 rounded-md border border-white/[0.04] bg-black/15 p-2 cursor-pointer hover:bg-white/[0.03] transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : w.id)}
                >
                  <span className="text-[10px] text-[#4a4540]">
                    {isExpanded ? "▾" : "▸"}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#c4b5a0] w-24 truncate">
                    {w.persona}
                  </span>
                  <span className="font-mono text-[10px] text-[#4a4540] flex-1 truncate">
                    {w.task_id ? truncateId(w.task_id) : "—"}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                    {formatTokens(w.tokens)}
                  </span>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>

                {isExpanded && (
                  <div className="ml-4 mt-1 mb-2 space-y-0.5 text-[10px] font-mono text-[#6b6560] border-l border-white/[0.06] pl-3">
                    <div>
                      task:{" "}
                      <span className="text-[#a89880]">
                        {w.task_id ?? w.task ?? "—"}
                      </span>
                    </div>
                    <div>
                      session: <span className="text-[#a89880]">{w.id}</span>
                    </div>
                    <div>
                      persona:{" "}
                      <span className="text-[#a89880]">{w.persona}</span>
                    </div>
                    <div>
                      zone: <span className="text-[#a89880]">{w.zone}</span>
                    </div>
                    <div>
                      uptime:{" "}
                      <span className="text-[#a89880]">
                        {formatUptime(w.uptime)}
                      </span>
                    </div>
                    <div>
                      tokens:{" "}
                      <span className="text-[#a89880]">
                        {formatTokens(w.tokens)}
                      </span>
                      {w.cost_usd != null && (
                        <>
                          {" "}
                          · cost:{" "}
                          <span className="text-[#c4b5a0]">
                            ${w.cost_usd.toFixed(4)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-1 flex flex-wrap gap-1.5 border-t border-white/[0.04] px-0.5 pt-2">
        <Badge variant="accent">{activeCount} active</Badge>
        <Badge>{workers.length} total</Badge>
      </div>
    </div>
  );
}
