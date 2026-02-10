"use client";

import { useState, useMemo } from "react";
import { Badge } from "./badge";
import { Card } from "./card";
import { SectionLabel } from "./section-label";
import type { GraphData, GraphNode, GraphEdge, Task } from "@/lib/mc/types";
import { STAGES } from "@/lib/mc/types";

const STATUSES = ["pending", "in_progress", "complete", "blocked"] as const;

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const GAP_Y = 20;
const COL_SPACING = 250;

const statusColors: Record<
  string,
  { bg: string; border: string; dot: string }
> = {
  pending: {
    bg: "rgba(107,101,96,0.08)",
    border: "rgba(107,101,96,0.3)",
    dot: "#6b6560",
  },
  in_progress: {
    bg: "rgba(196,181,160,0.08)",
    border: "rgba(196,181,160,0.3)",
    dot: "#c4b5a0",
  },
  complete: {
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.3)",
    dot: "#4ade80",
  },
  blocked: {
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.3)",
    dot: "#f87171",
  },
};

interface TraceViewProps {
  graph: GraphData | null;
  tasks: Task[];
  selectedTaskId?: string | null;
  onSelectTask?: (id: string | null) => void;
}

export function TraceView({
  graph,
  tasks,
  selectedTaskId,
  onSelectTask,
}: TraceViewProps) {
  const [localSelectedNodeId, setLocalSelectedNodeId] = useState<string | null>(
    null,
  );

  const selectedNodeId =
    selectedTaskId !== undefined ? selectedTaskId : localSelectedNodeId;
  const setSelectedNodeId = (id: string | null) => {
    if (onSelectTask) onSelectTask(id);
    else setLocalSelectedNodeId(id);
  };
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Derive nodes from graph data, falling back to tasks
  const nodes: GraphNode[] = useMemo(() => {
    if (graph?.nodes?.length) return graph.nodes;
    return tasks.map((t) => ({
      id: t.id,
      type: "task" as const,
      title: t.name,
      stage: t.stage,
      zone: t.zone,
      status: t.status,
      persona: t.persona,
      worker_id: t.worker_id,
    }));
  }, [graph, tasks]);

  const edges: GraphEdge[] = useMemo(() => {
    if (graph?.edges?.length) return graph.edges;
    const result: GraphEdge[] = [];
    tasks.forEach((t) => {
      (t.blocks || []).forEach((targetId) => {
        result.push({ source: t.id, target: targetId, type: "blocks" });
      });
    });
    return result;
  }, [graph, tasks]);

  const criticalPath = useMemo(
    () => new Set(graph?.critical_path || []),
    [graph],
  );

  const filteredNodes = useMemo(
    () =>
      nodes.filter((n) => {
        if (filterStage !== "all" && n.stage !== filterStage) return false;
        if (filterStatus !== "all" && n.status !== filterStatus) return false;
        return true;
      }),
    [nodes, filterStage, filterStatus],
  );

  const readyCount =
    graph?.ready_count ??
    nodes.filter(
      (n) =>
        n.status !== "blocked" &&
        n.status !== "complete" &&
        n.status !== "in_progress",
    ).length;
  const blockedCount =
    graph?.blocked_count ?? nodes.filter((n) => n.status === "blocked").length;

  // Layout: group by stage into columns
  const { nodePositions, svgWidth, svgHeight, activeStages } = useMemo(() => {
    const stageGroups: Record<string, GraphNode[]> = {};
    STAGES.forEach((s) => (stageGroups[s] = []));
    filteredNodes.forEach((n) => {
      if (stageGroups[n.stage]) stageGroups[n.stage].push(n);
    });

    const active = STAGES.filter((s) => stageGroups[s].length > 0);
    const positions: Record<string, { x: number; y: number }> = {};

    active.forEach((stage, colIdx) => {
      stageGroups[stage].forEach((n, rowIdx) => {
        positions[n.id] = {
          x: colIdx * COL_SPACING + 20,
          y: rowIdx * (NODE_HEIGHT + GAP_Y) + 50,
        };
      });
    });

    const maxRow = Math.max(
      ...Object.values(stageGroups).map((g) => g.length),
      1,
    );

    return {
      nodePositions: positions,
      svgWidth: Math.max(600, active.length * COL_SPACING + 40),
      svgHeight: Math.max(350, maxRow * (NODE_HEIGHT + GAP_Y) + 80),
      activeStages: active,
    };
  }, [filteredNodes]);

  // Find visible edges
  const visibleEdges = useMemo(
    () =>
      edges.filter((e) => nodePositions[e.source] && nodePositions[e.target]),
    [edges, nodePositions],
  );

  const selectedNode = selectedNodeId
    ? (nodes.find((n) => n.id === selectedNodeId) ?? null)
    : null;
  const selectedTask = selectedNodeId
    ? (tasks.find((t) => t.id === selectedNodeId) ?? null)
    : null;

  if (!graph && tasks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-[#6b6560]">
        No dependency graph available. Create task dependencies to visualize
        them.
      </div>
    );
  }

  return (
    <div className="pt-4">
      {/* Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-[#e8e4df]"
        >
          <option value="all">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-[#e8e4df]"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <Badge variant="success">{readyCount} ready</Badge>
          <Badge variant="danger">{blockedCount} blocked</Badge>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Graph Area */}
        <div className="min-h-[350px] flex-1 overflow-auto rounded-xl border border-white/[0.06] bg-black/30">
          <svg width={svgWidth} height={svgHeight} style={{ display: "block" }}>
            <defs>
              <marker
                id="arrow-normal"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(196,181,160,0.3)" />
              </marker>
              <marker
                id="arrow-blocked"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(248,113,113,0.4)" />
              </marker>
              <filter id="glow-critical">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="#c4b5a0" floodOpacity="0.4" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Stage labels */}
            {activeStages.map((stage, i) => (
              <text
                key={stage}
                x={i * COL_SPACING + 20 + NODE_WIDTH / 2}
                y={25}
                textAnchor="middle"
                style={{
                  fontSize: 9,
                  fill: "#6b6560",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                {stage}
              </text>
            ))}

            {/* Edges */}
            {visibleEdges.map((edge, i) => {
              const from = nodePositions[edge.source];
              const to = nodePositions[edge.target];
              const targetNode = nodes.find((n) => n.id === edge.target);
              const isBlocked = targetNode?.status === "blocked";
              return (
                <line
                  key={i}
                  x1={from.x + NODE_WIDTH}
                  y1={from.y + NODE_HEIGHT / 2}
                  x2={to.x}
                  y2={to.y + NODE_HEIGHT / 2}
                  stroke={
                    isBlocked
                      ? "rgba(248,113,113,0.4)"
                      : "rgba(196,181,160,0.2)"
                  }
                  strokeWidth={isBlocked ? 2 : 1}
                  strokeDasharray={isBlocked ? "4 2" : "none"}
                  markerEnd={
                    isBlocked ? "url(#arrow-blocked)" : "url(#arrow-normal)"
                  }
                />
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((n) => {
              const pos = nodePositions[n.id];
              if (!pos) return null;
              const sc = statusColors[n.status] || statusColors.pending;
              const isSelected = selectedNodeId === n.id;
              const isCritical = criticalPath.has(n.id);
              return (
                <g
                  key={n.id}
                  onClick={() => setSelectedNodeId(isSelected ? null : n.id)}
                  style={{ cursor: "pointer" }}
                  filter={isCritical ? "url(#glow-critical)" : undefined}
                >
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={8}
                    ry={8}
                    fill={isSelected ? "rgba(196,181,160,0.12)" : sc.bg}
                    stroke={isSelected ? "#c4b5a0" : sc.border}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  {/* Status dot */}
                  <circle cx={pos.x + 16} cy={pos.y + 20} r={4} fill={sc.dot} />
                  {/* Title */}
                  <text
                    x={pos.x + 28}
                    y={pos.y + 23}
                    style={{
                      fontSize: 11,
                      fill: "#e8e4df",
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {n.title.length > 20 ? n.title.slice(0, 20) + "…" : n.title}
                  </text>
                  {/* Persona + Zone */}
                  <text
                    x={pos.x + 14}
                    y={pos.y + 44}
                    style={{
                      fontSize: 9,
                      fill: "#6b6560",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {n.persona} · {n.zone}
                  </text>
                  {/* Task ID */}
                  <text
                    x={pos.x + 14}
                    y={pos.y + 60}
                    style={{
                      fontSize: 8,
                      fill: "#4a4540",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {n.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <Card className="w-[260px] shrink-0">
            <SectionLabel>Task Detail</SectionLabel>
            <div className="flex flex-col gap-2">
              <div>
                <div className="mb-1 text-sm font-semibold text-[#e8e4df]">
                  {selectedNode.title}
                </div>
                <Badge
                  variant={
                    selectedNode.status === "blocked"
                      ? "danger"
                      : selectedNode.status === "complete"
                        ? "success"
                        : selectedNode.status === "in_progress"
                          ? "accent"
                          : "default"
                  }
                >
                  {selectedNode.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
                <span className="text-[#6b6560]">Stage</span>
                <span className="text-[#a89880]">{selectedNode.stage}</span>
                <span className="text-[#6b6560]">Zone</span>
                <span className="text-[#a89880]">{selectedNode.zone}</span>
                <span className="text-[#6b6560]">Persona</span>
                <span className="text-[#a89880]">{selectedNode.persona}</span>
                <span className="text-[#6b6560]">Worker</span>
                <span className="font-mono text-[10px] text-[#a89880]">
                  {selectedNode.worker_id || "unassigned"}
                </span>
                <span className="text-[#6b6560]">Blocks</span>
                <span className="font-mono text-[10px] text-[#a89880]">
                  {selectedTask?.blocks?.length
                    ? selectedTask.blocks.join(", ")
                    : "none"}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
