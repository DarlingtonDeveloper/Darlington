import type {
  Worker,
  GateCriteria,
  GateCriterion,
  TokenSummary,
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
