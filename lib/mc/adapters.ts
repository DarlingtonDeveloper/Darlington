import type {
  Worker,
  GateCriteria,
  GateCriterion,
  TokenSummary,
  GraphData,
  GraphNode,
  GraphEdge,
} from "./types";

export interface RawWorker {
  worker_id: string;
  persona: string;
  task_id: string;
  zone: string;
  model: string;
  pid: number;
  status: string;
  started_at: string;
  token_count: number;
  cost_usd: number;
}

export interface RawGate {
  stage: string;
  status: string;
  criteria: Array<{ description: string; met: boolean }> | string[];
  approved_at?: string;
  approval_note?: string;
}

export interface RawTokens {
  total_tokens: number;
  total_cost_usd: number;
  budget_limit: number;
  budget_used: number;
  budget_remaining: number;
  sessions: unknown[];
}

export function adaptWorker(raw: RawWorker): Worker {
  const now = Date.now();
  const started = raw.started_at ? new Date(raw.started_at).getTime() : now;
  const uptimeSeconds = Math.floor((now - started) / 1000);

  return {
    id: raw.worker_id,
    persona: raw.persona,
    zone: raw.zone,
    status: raw.status as Worker["status"],
    task: raw.task_id,
    task_id: raw.task_id,
    uptime: uptimeSeconds,
    tokens: raw.token_count,
    cost_usd: raw.cost_usd,
    started_at: raw.started_at,
    model: raw.model,
  };
}

export function adaptGate(raw: RawGate): GateCriteria {
  const criteria: GateCriterion[] = Array.isArray(raw.criteria)
    ? raw.criteria.map((c) =>
        typeof c === "string"
          ? { description: c, met: false }
          : { description: c.description, met: c.met },
      )
    : [];

  return {
    stage: raw.stage as GateCriteria["stage"],
    status: raw.status as GateCriteria["status"],
    criteria,
    approved_at: raw.approved_at,
    approval_note: raw.approval_note,
  };
}

// --- Graph adapter ---

interface RawGraphNode {
  id: string;
  name?: string;
  title?: string;
  type?: string;
  stage: string;
  zone: string;
  status: string;
  persona?: string;
  worker_id?: string;
}

interface RawGraphEdge {
  from?: string;
  to?: string;
  source?: string;
  target?: string;
  type?: string;
}

interface RawGraphResponse {
  nodes?: RawGraphNode[];
  edges?: RawGraphEdge[];
  critical_path?: string[];
  blocked_count?: number;
  ready_count?: number;
}

export function adaptGraphResponse(raw: unknown): GraphData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawGraphResponse;
  if (!Array.isArray(r.nodes)) return null;

  const nodes: GraphNode[] = r.nodes.map((n) => ({
    id: n.id,
    type: (n.type as GraphNode["type"]) ?? "task",
    title: n.title ?? n.name ?? n.id,
    stage: n.stage as GraphNode["stage"],
    zone: n.zone ?? "",
    status: (n.status as GraphNode["status"]) ?? "pending",
    persona: n.persona ?? "",
    worker_id: n.worker_id,
  }));

  const edges: GraphEdge[] = (r.edges ?? []).map((e) => ({
    source: e.source ?? e.from ?? "",
    target: e.target ?? e.to ?? "",
    type: (e.type as GraphEdge["type"]) ?? "blocks",
  }));

  return {
    nodes,
    edges,
    critical_path: r.critical_path ?? [],
    blocked_count: r.blocked_count ?? 0,
    ready_count: r.ready_count ?? 0,
  };
}

export function adaptTokens(raw: RawTokens): TokenSummary {
  return {
    total_tokens: raw.total_tokens,
    total_cost: raw.total_cost_usd,
    budget_limit: raw.budget_limit,
    budget_used: raw.budget_used,
    budget_remaining: raw.budget_remaining,
    sessions: (raw.sessions ?? []) as TokenSummary["sessions"],
  };
}
