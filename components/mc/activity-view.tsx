"use client";

import { useState } from "react";
import { Card } from "./card";
import { Badge } from "./badge";
import { SectionLabel } from "./section-label";
import { ActionButton } from "./action-button";
import type {
  GateCriteria,
  AuditEntry,
  Worker,
  Task,
  CheckpointInfo,
  TokenSummary,
} from "@/lib/mc/types";

// ─── Helpers ─────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  worker: "👤",
  stage: "📊",
  gate: "🚪",
  task: "📋",
  checkpoint: "💾",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for future use
function formatCost(tokens: number): string {
  const cost = tokens * 0.000003;
  return `$${cost.toFixed(4)}`;
}

// ─── Props ───────────────────────────────────────────────────

interface ActivityViewProps {
  gates: Record<string, GateCriteria>;
  currentStage: string;
  audit: AuditEntry[];
  workers: Worker[];
  tasks: Task[];
  checkpoints: CheckpointInfo[];
  tokens: TokenSummary;
  onApproveGate: (stage: string) => void;
  onRejectGate: (stage: string) => void;
  onCreateCheckpoint: () => void;
  onRestoreCheckpoint: (id: string) => void;
}

// ─── Component ───────────────────────────────────────────────

export function ActivityView({
  gates,
  currentStage,
  audit,
  workers,
  tasks,
  checkpoints,
  tokens,
  onApproveGate,
  onRejectGate,
  onCreateCheckpoint,
  onRestoreCheckpoint,
}: ActivityViewProps) {
  const [filterCategory, setFilterCategory] = useState("all");

  // Gate for current stage
  const gate = gates[currentStage];
  const criteria = gate?.criteria ?? [];
  // Determine met criteria — criteria that are met are tracked via gate status
  // For now, criteria are strings; met status comes from gate.status or we check approved_at
  // We'll treat criteria as all met when gate is approved, none when pending
  const allMet = gate?.status === "approved";
  const metCount = allMet ? criteria.length : 0;

  // Filtered audit
  const filteredAudit =
    filterCategory === "all"
      ? audit
      : audit.filter((e) => e.category === filterCategory);

  // Stats
  const activeWorkers = workers.filter((w) => w.status !== "offline").length;
  const busyWorkers = workers.filter((w) => w.status === "busy").length;
  const totalTasks = tasks.length;
  const completeTasks = tasks.filter((t) => t.status === "complete").length;

  // Token chart
  const sessions = tokens.sessions ?? [];
  const hasTokenData = sessions.length > 0;

  // Persona breakdown
  const personaMap = new Map<string, { tokens: number; cost: number }>();
  for (const s of sessions) {
    const existing = personaMap.get(s.persona) ?? { tokens: 0, cost: 0 };
    existing.tokens += s.total_tokens;
    existing.cost += s.estimated_cost_usd;
    personaMap.set(s.persona, existing);
  }
  const personaBreakdown = Array.from(personaMap.entries())
    .map(([persona, data]) => ({ persona, ...data }))
    .sort((a, b) => b.tokens - a.tokens);
  const maxPersonaTokens = Math.max(
    1,
    ...personaBreakdown.map((p) => p.tokens),
  );

  // Chart dimensions
  const chartW = 520;
  const chartH = 140;
  const chartPadL = 50;
  const chartPadR = 10;
  const chartPadT = 10;
  const chartPadB = 25;
  const plotW = chartW - chartPadL - chartPadR;
  const plotH = chartH - chartPadT - chartPadB;

  return (
    <div className="grid grid-cols-2 gap-4 pt-4">
      {/* ── Left Column: Gate + Audit ── */}
      <div className="flex flex-col gap-4">
        {/* Gate Status */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <SectionLabel>Gate — {currentStage}</SectionLabel>
            <Badge variant="warning">
              {metCount}/{criteria.length} met
            </Badge>
          </div>
          <div className="flex flex-col gap-1.5">
            {criteria.map((text, i) => {
              const met = allMet;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${
                    met ? "bg-[#4ade80]/[0.04]" : "bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                      met
                        ? "border-[1.5px] border-[#4ade80] bg-[#4ade80]/15 text-[#4ade80]"
                        : "border-[1.5px] border-white/15"
                    }`}
                  >
                    {met ? "✓" : ""}
                  </span>
                  <span
                    className={`text-xs ${
                      met
                        ? "text-[#a89880] line-through opacity-70"
                        : "text-[#6b6560]"
                    }`}
                  >
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-3">
            <ActionButton
              variant="success"
              disabled={!allMet}
              onClick={() => onApproveGate(currentStage)}
            >
              Approve Gate
            </ActionButton>
            <ActionButton
              variant="danger"
              onClick={() => onRejectGate(currentStage)}
            >
              Reject
            </ActionButton>
            <ActionButton variant="ghost">Override</ActionButton>
          </div>
        </Card>

        {/* Audit Trail */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <SectionLabel>Audit Trail</SectionLabel>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/[0.04] border border-white/[0.08] text-[#e8e4df] font-mono"
            >
              <option value="all">All</option>
              <option value="worker">Workers</option>
              <option value="stage">Stages</option>
              <option value="gate">Gates</option>
              <option value="task">Tasks</option>
              <option value="checkpoint">Checkpoints</option>
            </select>
          </div>
          <div className="flex flex-col gap-0.5">
            {filteredAudit.map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                className="flex items-start gap-2.5 px-1.5 py-2 border-b border-white/[0.03]"
              >
                <span className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center text-[11px] shrink-0">
                  {CATEGORY_ICONS[entry.category] ?? "📌"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[#a89880] leading-snug">
                    {entry.action}
                    {entry.details ? ` — ${entry.details}` : ""}
                  </div>
                  <div className="flex gap-2 mt-0.5 text-[9px] text-[#4a4540] font-mono">
                    <span>{timeAgo(entry.timestamp)}</span>
                    <span>·</span>
                    <span>{entry.actor}</span>
                    <span>·</span>
                    <Badge>{entry.category}</Badge>
                  </div>
                </div>
              </div>
            ))}
            {filteredAudit.length === 0 && (
              <div className="text-[11px] text-[#4a4540] py-4 text-center">
                No audit entries
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Right Column: Stats + Checkpoints + Charts ── */}
      <div className="flex flex-col gap-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Workers", value: activeWorkers, color: "text-[#e8e4df]" },
            { label: "Busy", value: busyWorkers, color: "text-[#c4b5a0]" },
            { label: "Tasks", value: totalTasks, color: "text-[#e8e4df]" },
            {
              label: "Complete",
              value: completeTasks,
              color: "text-[#4ade80]",
            },
          ].map((s) => (
            <Card key={s.label} className="text-center py-2 px-1.5">
              <div
                className={`text-xl font-light font-serif leading-none ${s.color}`}
              >
                {s.value}
              </div>
              <div className="text-[7px] text-[#4a4540] mt-0.5 font-mono tracking-[0.08em] uppercase">
                {s.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Checkpoints */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <SectionLabel>Checkpoints</SectionLabel>
            <ActionButton size="sm" onClick={onCreateCheckpoint}>
              + Create
            </ActionButton>
          </div>
          <div className="flex flex-col gap-1.5">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="flex items-center gap-2.5 p-2 rounded-md bg-white/[0.02] border border-white/[0.04]"
              >
                <span className="text-sm">{cp.auto ? "🔄" : "💾"}</span>
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-[#e8e4df] font-mono">
                    {cp.id}
                  </div>
                  <div className="text-[10px] text-[#6b6560]">
                    {cp.stage}
                    {cp.task_count != null
                      ? ` · ${cp.task_count} tasks`
                      : ""} · {timeAgo(cp.created_at)}
                  </div>
                </div>
                <ActionButton
                  size="sm"
                  onClick={() => onRestoreCheckpoint(cp.id)}
                >
                  Restore
                </ActionButton>
              </div>
            ))}
            {checkpoints.length === 0 && (
              <div className="text-[11px] text-[#4a4540] py-3 text-center">
                No checkpoints yet
              </div>
            )}
          </div>
        </Card>

        {/* Token Usage Chart */}
        <Card className="p-4">
          <SectionLabel>Token Usage Over Time</SectionLabel>
          {hasTokenData ? (
            <TokenChart
              sessions={sessions}
              chartW={chartW}
              chartH={chartH}
              chartPadL={chartPadL}
              chartPadR={chartPadR}
              chartPadT={chartPadT}
              chartPadB={chartPadB}
              plotW={plotW}
              plotH={plotH}
            />
          ) : (
            <div className="text-[11px] text-[#4a4540] py-6 text-center">
              Token tracking active
            </div>
          )}
        </Card>

        {/* Cost by Persona */}
        <Card className="p-4">
          <SectionLabel>Cost by Persona</SectionLabel>
          <div className="flex flex-col gap-2">
            {personaBreakdown.map((p) => (
              <div key={p.persona}>
                <div className="flex justify-between mb-1 text-[11px] font-mono">
                  <span className="text-[#a89880]">{p.persona}</span>
                  <span className="text-[#6b6560]">
                    {formatTokens(p.tokens)} tok · ${p.cost.toFixed(4)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#c4b5a0]/40 to-[#c4b5a0]/15 transition-[width] duration-500"
                    style={{
                      width: `${(p.tokens / maxPersonaTokens) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {personaBreakdown.length === 0 && (
              <div className="text-[11px] text-[#4a4540] py-3 text-center">
                No persona data yet
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Token Chart (SVG) ───────────────────────────────────────

function TokenChart({
  sessions,
  chartW,
  chartH,
  chartPadL,
  chartPadR,
  chartPadT,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chartPadB,
  plotW,
  plotH,
}: {
  sessions: { total_tokens: number; persona: string }[];
  chartW: number;
  chartH: number;
  chartPadL: number;
  chartPadR: number;
  chartPadT: number;
  chartPadB: number;
  plotW: number;
  plotH: number;
}) {
  // Accumulate tokens over sessions as a simple series
  const cumulative = sessions.reduce<number[]>((acc, s, i) => {
    acc.push((acc[i - 1] ?? 0) + s.total_tokens);
    return acc;
  }, []);

  const maxTokens = Math.max(1, ...cumulative);
  const points = cumulative.map((val, i) => ({
    x:
      chartPadL +
      (cumulative.length === 1
        ? plotW / 2
        : (i / (cumulative.length - 1)) * plotW),
    y: chartPadT + plotH - (val / maxTokens) * plotH,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartPadT + plotH} L ${points[0].x} ${chartPadT + plotH} Z`;

  return (
    <svg
      width={chartW}
      height={chartH}
      className="block w-full"
      viewBox={`0 0 ${chartW} ${chartH}`}
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = chartPadT + plotH * (1 - pct);
        return (
          <g key={pct}>
            <line
              x1={chartPadL}
              y1={y}
              x2={chartW - chartPadR}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
            <text
              x={chartPadL - 6}
              y={y + 3}
              textAnchor="end"
              className="text-[8px] fill-[#4a4540] font-mono"
            >
              {formatTokens(maxTokens * pct)}
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={areaPath} fill="rgba(196,181,160,0.06)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#c4b5a0" strokeWidth={1.5} />
      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#c4b5a0"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
