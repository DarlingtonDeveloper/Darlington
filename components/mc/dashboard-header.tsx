"use client";

import { useState, useEffect, useRef } from "react";
import type { MCState } from "@/lib/mc/types";
import { PipelineBar } from "./pipeline-bar";
import { MC_API_URL } from "@/lib/mc/constants";

interface ProjectInfo {
  name: string;
  path: string;
  active: boolean;
}

interface DashboardHeaderProps {
  state: MCState;
  view: string;
  setView: (view: string) => void;
  onProjectSwitch?: () => void;
  onStageOverride?: () => void;
}

function formatTokens(n: number): string {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function formatCost(tokens: number): string {
  return `$${(tokens * 0.000003).toFixed(4)}`;
}

export function DashboardHeader({
  state,
  view,
  setView,
  onProjectSwitch,
  onStageOverride,
}: DashboardHeaderProps) {
  const tasks = state.tasks ?? [];
  const tokens = state.tokens;
  const connected = state.connected;
  const currentStage = state.stage?.current ?? "discovery";

  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${MC_API_URL}/api/projects`)
      .then((r) => r.json())
      .then((data: ProjectInfo[]) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showProjectMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        projectMenuRef.current &&
        !projectMenuRef.current.contains(e.target as Node)
      ) {
        setShowProjectMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProjectMenu]);

  const activeProject = projects.find((p) => p.active);

  const handleProjectSwitch = async (path: string) => {
    setShowProjectMenu(false);
    await fetch(`${MC_API_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    onProjectSwitch?.();
  };

  const counts = {
    active: tasks.filter((t) => t.status === "in_progress").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    done: tasks.filter((t) => t.status === "complete" || t.status === "done")
      .length,
  };

  const totalTokens = tokens?.total_tokens ?? 0;
  const burnRate = 142; // TODO: derive from token history

  const statChips: { label: string; count: number; color: string }[] = [
    { label: "active", count: counts.active, color: "text-[#c4b5a0]" },
    { label: "blocked", count: counts.blocked, color: "text-red-400" },
    { label: "pending", count: counts.pending, color: "text-[#6b6560]" },
    { label: "done", count: counts.done, color: "text-green-400" },
  ];

  const tabs = [
    { key: "mission", label: "◈ Mission" },
    { key: "trace", label: "◇ Trace" },
    { key: "activity", label: "◷ Activity" },
    { key: "specs", label: "◆ Specs" },
  ];

  return (
    <header className="flex flex-col gap-3 py-4 border-b border-white/[0.06]">
      {/* Row 1 — Identity + Stats */}
      <div className="flex items-center justify-between">
        {/* Left: Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c4b5a0]/20 to-[#c4b5a0]/5 border border-[#c4b5a0]/25 flex items-center justify-center text-sm">
            ◈
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#e8e4df] tracking-tight leading-tight font-serif">
              MissionControl
            </h1>
            <div className="relative" ref={projectMenuRef}>
              <button
                onClick={() =>
                  projects.length > 1 && setShowProjectMenu((v) => !v)
                }
                className={[
                  "text-[10px] text-[#6b6560] font-mono tracking-wider bg-transparent border-none p-0",
                  projects.length > 1
                    ? "cursor-pointer hover:text-[#a89880]"
                    : "cursor-default",
                ].join(" ")}
              >
                {activeProject?.name ?? "mc.darlington.dev"}
                {projects.length > 1 && " ▾"}
              </button>
              {showProjectMenu && (
                <div className="absolute top-full left-0 mt-1 min-w-[200px] rounded-lg border border-white/[0.08] bg-[#0d0d15] shadow-xl z-50 py-1">
                  {projects.map((p) => (
                    <button
                      key={p.path}
                      onClick={() => !p.active && handleProjectSwitch(p.path)}
                      className={[
                        "w-full text-left px-3 py-1.5 text-[11px] font-mono border-none bg-transparent cursor-pointer",
                        p.active
                          ? "text-[#c4b5a0]"
                          : "text-[#6b6560] hover:text-[#e8e4df] hover:bg-white/[0.04]",
                      ].join(" ")}
                    >
                      {p.active ? "✓ " : "  "}
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <span className="flex items-center gap-1.5 ml-2">
            <span className="relative inline-flex w-1.5 h-1.5">
              {connected && (
                <span className="absolute inset-0 rounded-full bg-green-400 opacity-40 animate-ping" />
              )}
              <span
                className={`relative inline-block w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-[#4a4540]"}`}
              />
            </span>
            <span
              className={`text-[10px] font-mono ${connected ? "text-green-400" : "text-[#4a4540]"}`}
            >
              {connected ? "connected" : "offline"}
            </span>
          </span>
        </div>

        {/* Centre: Task stat chips */}
        <div className="flex gap-1.5 items-center">
          {statChips.map((s) => (
            <div
              key={s.label}
              className="flex items-baseline gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.04]"
            >
              <span
                className={`text-[13px] font-semibold font-mono ${s.color}`}
              >
                {s.count}
              </span>
              <span className="text-[8px] text-[#4a4540] font-mono tracking-wider">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Token stats */}
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <div className="text-[10px] text-[#6b6560] font-mono tracking-wider">
              TOK
            </div>
            <div className="text-sm font-semibold text-[#e8e4df] font-mono">
              {formatTokens(totalTokens)}
            </div>
          </div>
          <div className="w-px h-6 bg-white/[0.06]" />
          <div className="text-right">
            <div className="text-[10px] text-[#6b6560] font-mono tracking-wider">
              COST
            </div>
            <div className="text-sm font-semibold text-[#c4b5a0] font-mono">
              {formatCost(totalTokens)}
            </div>
          </div>
          <div className="w-px h-6 bg-white/[0.06]" />
          <div className="text-right">
            <div className="text-[10px] text-[#6b6560] font-mono tracking-wider">
              BURN
            </div>
            <div className="text-sm font-semibold text-[#a89880] font-mono">
              {burnRate}/m
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 — Pipeline + Override */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <PipelineBar currentStage={currentStage} gates={state.gates} />
        </div>
        {onStageOverride && (
          <button
            onClick={onStageOverride}
            className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase text-[#6b6560] hover:text-[#c4b5a0] border border-white/[0.06] hover:border-[#c4b5a0]/25 bg-transparent cursor-pointer transition-all"
          >
            Override
          </button>
        )}
      </div>

      {/* Row 3 — View tabs */}
      <div className="flex gap-0.5 bg-white/[0.02] rounded-lg p-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={[
              "flex-1 py-1.5 rounded-md text-[11px] font-medium font-mono tracking-wider uppercase cursor-pointer border-none transition-all duration-150",
              view === t.key
                ? "bg-[#c4b5a0]/[0.12] text-[#c4b5a0]"
                : "bg-transparent text-[#6b6560] hover:text-[#a89880]",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
}
