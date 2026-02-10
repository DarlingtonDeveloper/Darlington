"use client";

import { useState } from "react";
import type { GateCriteria, Stage } from "@/lib/mc/types";
import { STAGES } from "@/lib/mc/types";
import { Badge } from "./badge";

interface GateConditionsPanelProps {
  gates: Record<string, GateCriteria>;
  currentStage: string;
}

export default function GateConditionsPanel({
  gates,
  currentStage,
}: GateConditionsPanelProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set([currentStage]),
  );

  const toggleStage = (stage: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
  };

  const sortedGates = Object.values(gates).sort((a, b) => {
    if (a.stage === currentStage) return -1;
    if (b.stage === currentStage) return 1;
    return STAGES.indexOf(a.stage as Stage) - STAGES.indexOf(b.stage as Stage);
  });

  if (sortedGates.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
        <div className="text-[11px] font-mono font-semibold text-[#6b6560] uppercase tracking-wider mb-2">
          Gate Conditions
        </div>
        <div className="py-6 text-center text-[11px] font-mono text-[#4a4540]">
          No gates defined
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <div className="text-[11px] font-mono font-semibold text-[#6b6560] uppercase tracking-wider mb-2">
        Gate Conditions
      </div>
      <div className="space-y-1">
        {sortedGates.map((gate) => {
          const isExpanded = expandedStages.has(gate.stage);
          const isCurrent = gate.stage === currentStage;

          return (
            <div key={gate.stage}>
              <div
                className="flex items-center justify-between cursor-pointer py-1.5 px-2 rounded-md hover:bg-white/[0.02] transition-colors"
                onClick={() => toggleStage(gate.stage)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#4a4540]">
                    {isExpanded ? "▾" : "▸"}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#e8e4df]">
                    {gate.stage}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] text-[#6b6560] font-mono">
                      (current)
                    </span>
                  )}
                </div>
                <Badge
                  variant={
                    gate.status === "approved"
                      ? "success"
                      : gate.status === "rejected"
                        ? "danger"
                        : "default"
                  }
                >
                  {gate.status}
                </Badge>
              </div>

              {isExpanded && (
                <div className="ml-5 space-y-1 pb-2">
                  {gate.criteria.length === 0 ? (
                    <div className="text-[10px] font-mono text-[#4a4540] italic">
                      No criteria defined
                    </div>
                  ) : (
                    gate.criteria.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-[11px] font-mono"
                      >
                        <span
                          className={
                            c.met ? "text-emerald-400" : "text-zinc-600"
                          }
                        >
                          {c.met ? "✓" : "✗"}
                        </span>
                        <span
                          className={
                            c.met ? "text-[#a89880]" : "text-[#6b6560]"
                          }
                        >
                          {c.description}
                        </span>
                      </div>
                    ))
                  )}
                  {gate.status === "approved" && gate.approval_note && (
                    <div className="mt-1.5 rounded-md bg-[#4ade80]/5 border border-[#4ade80]/10 p-2 text-[10px] font-mono italic text-zinc-400">
                      &ldquo;{gate.approval_note}&rdquo;
                      {gate.approved_at && (
                        <span className="ml-2 text-[#4a4540]">
                          — {new Date(gate.approved_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
