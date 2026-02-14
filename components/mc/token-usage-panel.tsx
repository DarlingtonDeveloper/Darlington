"use client";

import type { TokenSummary } from "@/lib/mc/types";

interface TokenUsagePanelProps {
  tokens: TokenSummary;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function TokenUsagePanel({ tokens }: TokenUsagePanelProps) {
  const { sessions, total_cost, budget_limit, budget_used, budget_remaining } =
    tokens;

  const totalInput = sessions.reduce((sum, s) => sum + s.input_tokens, 0);
  const totalOutput = sessions.reduce((sum, s) => sum + s.output_tokens, 0);
  const budgetPercent =
    budget_limit > 0 ? Math.min((budget_used / budget_limit) * 100, 100) : 0;

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-black/20 p-4">
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#6b6560] mb-3">
          Token Usage
        </h3>
        <p className="text-[11px] font-mono text-[#4a4540] text-center py-6">
          No token data yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20 p-4 space-y-3">
      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#6b6560]">
        Token Usage
      </h3>

      {/* Budget progress bar */}
      {budget_limit > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#6b6560] uppercase tracking-wider">
              Budget
            </span>
            <span className="text-[#a89880]">
              {formatCost(budget_used)} / {formatCost(budget_limit)}
              {budget_remaining > 0 && (
                <span className="text-[#4a4540] ml-1.5">
                  ({formatCost(budget_remaining)} left)
                </span>
              )}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent > 90
                  ? "bg-[#f87171]"
                  : budgetPercent > 70
                    ? "bg-[#fbbf24]"
                    : "bg-[#c4b5a0]"
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Per-worker grid */}
      <div className="space-y-0.5">
        {/* Header */}
        <div className="grid grid-cols-[1fr_70px_70px_80px] gap-1 text-[9px] font-mono uppercase tracking-wider text-[#4a4540] border-b border-white/[0.04] pb-1">
          <span>Worker</span>
          <span className="text-right">In</span>
          <span className="text-right">Out</span>
          <span className="text-right">Cost</span>
        </div>

        {/* Rows */}
        {sessions.map((s) => (
          <div
            key={s.worker_id}
            className="grid grid-cols-[1fr_70px_70px_80px] gap-1 text-[10px] font-mono py-0.5"
          >
            <span className="text-[#a89880] truncate">{s.persona}</span>
            <span className="text-right text-[#6b6560]">
              {formatNumber(s.input_tokens)}
            </span>
            <span className="text-right text-[#6b6560]">
              {formatNumber(s.output_tokens)}
            </span>
            <span className="text-right text-[#c4b5a0]">
              {formatCost(s.estimated_cost_usd)}
            </span>
          </div>
        ))}

        {/* Total row */}
        <div className="grid grid-cols-[1fr_70px_70px_80px] gap-1 text-[10px] font-mono border-t border-white/[0.06] pt-1 mt-1 font-bold">
          <span className="text-[#e8e4df]">Total</span>
          <span className="text-right text-[#e8e4df]">
            {formatNumber(totalInput)}
          </span>
          <span className="text-right text-[#e8e4df]">
            {formatNumber(totalOutput)}
          </span>
          <span className="text-right text-[#c4b5a0]">
            {formatCost(total_cost)}
          </span>
        </div>
      </div>
    </div>
  );
}
