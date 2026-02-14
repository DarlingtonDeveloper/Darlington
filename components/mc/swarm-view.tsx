"use client";

import { Card } from "./card";
import { SectionLabel } from "./section-label";
import { Badge } from "./badge";
import { StatusDot } from "./status-dot";
import { ActionButton } from "./action-button";
import type { SwarmOverview } from "@/lib/mc/types";

interface SwarmViewProps {
  data: SwarmOverview | null;
  onRefresh: () => void;
}

function serviceStatus(
  data: SwarmOverview,
  key: string,
): "idle" | "error" | "offline" {
  if (data.errors[key]) return "error";
  const val = data[key as keyof SwarmOverview];
  if (!val || (typeof val === "object" && Object.keys(val).length === 0))
    return "offline";
  return "idle";
}

function agentState(state: string): string {
  const map: Record<string, string> = {
    ready: "idle",
    sleeping: "offline",
    starting: "busy",
    stopping: "offline",
    running: "busy",
    idle: "idle",
    error: "error",
  };
  return map[state] ?? "offline";
}

function dispatchAgentStatus(status: string): string {
  const map: Record<string, string> = {
    idle: "idle",
    busy: "busy",
    running: "busy",
    error: "error",
    offline: "offline",
  };
  return map[status] ?? "offline";
}

export function SwarmView({ data, onRefresh }: SwarmViewProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#6b6560]">
        <div className="text-sm font-mono">Loading fleet data...</div>
        <ActionButton variant="ghost" onClick={onRefresh}>
          Retry
        </ActionButton>
      </div>
    );
  }

  const services = [
    {
      key: "warren",
      label: "Warren",
      metric:
        data.warren?.health?.agents_connected != null
          ? `${data.warren.health.agents_connected} agents`
          : null,
    },
    {
      key: "chronicle",
      label: "Chronicle",
      metric:
        data.chronicle?.metrics?.events_per_minute != null
          ? `${data.chronicle.metrics.events_per_minute}/min`
          : null,
    },
    {
      key: "dispatch",
      label: "Dispatch",
      metric:
        data.dispatch?.stats?.in_progress != null
          ? `${data.dispatch.stats.in_progress} active`
          : null,
    },
    {
      key: "promptforge",
      label: "PromptForge",
      metric:
        data.promptforge?.prompt_count != null
          ? `${data.promptforge.prompt_count} prompts`
          : null,
    },
    {
      key: "alexandria",
      label: "Alexandria",
      metric:
        data.alexandria?.collection_count != null
          ? `${data.alexandria.collection_count} collections`
          : null,
    },
  ];

  const errors = Object.entries(data.errors);
  const dlqDepth = data.chronicle?.dlq?.depth ?? 0;

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Fleet Status */}
      <section>
        <SectionLabel>Fleet Status</SectionLabel>
        <div className="grid grid-cols-5 gap-2">
          {services.map((s) => {
            const status = serviceStatus(data, s.key);
            return (
              <Card key={s.key} className="p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <StatusDot status={status} size={6} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6b6560]">
                    {s.label}
                  </span>
                </div>
                <div className="text-sm font-mono text-[#e8e4df]">
                  {s.metric ?? <span className="text-[#4a4540]">--</span>}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Warren Agents */}
      {data.warren?.agents && data.warren.agents.length > 0 && (
        <section>
          <SectionLabel>Warren Agents</SectionLabel>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {data.warren.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/[0.02] border border-white/[0.04]"
                >
                  <StatusDot status={agentState(agent.state)} size={6} />
                  <span className="text-xs font-mono text-[#e8e4df] truncate flex-1">
                    {agent.name}
                  </span>
                  {agent.policy && <Badge>{agent.policy}</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Dispatch Pipeline */}
      {data.dispatch && (
        <section>
          <SectionLabel>Dispatch Pipeline</SectionLabel>
          <Card className="p-4 flex flex-col gap-3">
            {data.dispatch.stats && (
              <div className="flex gap-3">
                {(
                  [
                    ["pending", data.dispatch.stats.pending],
                    ["active", data.dispatch.stats.in_progress],
                    ["completed", data.dispatch.stats.completed],
                    ["failed", data.dispatch.stats.failed],
                  ] as const
                ).map(([label, val]) => (
                  <div
                    key={label}
                    className="flex items-baseline gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.04]"
                  >
                    <span
                      className={`text-sm font-semibold font-mono ${
                        label === "failed" && (val ?? 0) > 0
                          ? "text-red-400"
                          : label === "active"
                            ? "text-[#c4b5a0]"
                            : label === "completed"
                              ? "text-green-400"
                              : "text-[#6b6560]"
                      }`}
                    >
                      {val ?? 0}
                    </span>
                    <span className="text-[8px] text-[#4a4540] font-mono tracking-wider">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {data.dispatch.agents && data.dispatch.agents.length > 0 && (
              <div className="flex flex-col gap-1">
                {data.dispatch.agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04]"
                  >
                    <StatusDot
                      status={dispatchAgentStatus(agent.status)}
                      size={6}
                    />
                    <span className="text-xs font-mono text-[#e8e4df] truncate">
                      {agent.name ?? agent.id}
                    </span>
                    {agent.current_task && (
                      <span className="text-[10px] font-mono text-[#6b6560] truncate ml-auto">
                        {agent.current_task}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Chronicle Metrics */}
      {data.chronicle?.metrics && (
        <section>
          <SectionLabel>Chronicle Metrics</SectionLabel>
          <Card className="p-4">
            <div className="flex gap-4 items-center">
              <div>
                <div className="text-[10px] text-[#6b6560] font-mono tracking-wider">
                  EVENTS/MIN
                </div>
                <div className="text-sm font-semibold text-[#e8e4df] font-mono">
                  {data.chronicle.metrics.events_per_minute ?? "--"}
                </div>
              </div>
              <div className="w-px h-6 bg-white/[0.06]" />
              <div>
                <div className="text-[10px] text-[#6b6560] font-mono tracking-wider">
                  ERROR RATE
                </div>
                <div className="text-sm font-semibold text-[#e8e4df] font-mono">
                  {data.chronicle.metrics.error_rate != null
                    ? `${(data.chronicle.metrics.error_rate * 100).toFixed(1)}%`
                    : "--"}
                </div>
              </div>
              <div className="w-px h-6 bg-white/[0.06]" />
              <div>
                <div className="text-[10px] text-[#6b6560] font-mono tracking-wider">
                  DLQ DEPTH
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[#e8e4df] font-mono">
                    {dlqDepth}
                  </span>
                  {dlqDepth > 0 && <Badge variant="warning">!</Badge>}
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Errors Panel */}
      {errors.length > 0 && (
        <section>
          <SectionLabel>Errors</SectionLabel>
          <Card className="p-4 border-red-400/20">
            <div className="flex flex-col gap-2">
              {errors.map(([service, message]) => (
                <div
                  key={service}
                  className="flex items-start gap-2 text-xs font-mono"
                >
                  <span className="text-red-400 shrink-0 uppercase">
                    {service}
                  </span>
                  <span className="text-[#6b6560]">{message}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <span className="text-[10px] font-mono text-[#4a4540]">
          fetched{" "}
          {data.fetched_at
            ? new Date(data.fetched_at).toLocaleTimeString()
            : "--"}
        </span>
        <ActionButton variant="ghost" onClick={onRefresh}>
          Refresh
        </ActionButton>
      </div>
    </div>
  );
}
