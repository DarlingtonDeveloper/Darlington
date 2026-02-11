// Stages
export const STAGES = [
  "discovery",
  "goal",
  "requirements",
  "planning",
  "design",
  "implement",
  "verify",
  "validate",
  "document",
  "release",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_ICONS: Record<Stage, string> = {
  discovery: "🔍",
  goal: "🎯",
  requirements: "📋",
  planning: "🗺️",
  design: "✏️",
  implement: "⚡",
  verify: "🧪",
  validate: "✅",
  document: "📝",
  release: "🚀",
};

// Zone glyphs
export const ZONE_GLYPHS: Record<string, string> = {
  frontend: "◧",
  backend: "◨",
  database: "◩",
  infra: "◪",
  shared: "◫",
};

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "complete"
  | "done"
  | "blocked";
export type WorkerStatus =
  | "busy"
  | "idle"
  | "error"
  | "offline"
  | "spawning"
  | "running"
  | "complete"
  | "failed";

export interface Task {
  id: string;
  name: string;
  stage: Stage;
  zone: string;
  persona: string;
  status: TaskStatus;
  worker_id?: string;
  blocks?: string[];
  blocked_by?: string[];
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  persona: string;
  zone: string;
  status: WorkerStatus;
  task: string;
  task_id?: string;
  uptime: number;
  tokens: number;
  cost_usd?: number;
  stdout?: string[];
  started_at?: string;
  model?: string;
}

export interface GateCriterion {
  description: string;
  met: boolean;
}

export interface GateCriteria {
  stage: Stage;
  status: "pending" | "approved" | "rejected";
  criteria: GateCriterion[];
  approved_at?: string;
  approval_note?: string;
}

export interface CheckpointInfo {
  id: string;
  stage: Stage;
  created_at: string;
  task_count?: number;
  auto?: boolean;
}

export interface ProjectInfo {
  name: string;
  path: string;
  active: boolean;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  category: string;
  details?: string;
}

export interface TokenSummary {
  total_tokens: number;
  total_cost: number;
  budget_limit: number;
  budget_used: number;
  budget_remaining: number;
  sessions: SessionTokens[];
}

export interface SessionTokens {
  worker_id: string;
  persona: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  critical_path: string[];
  blocked_count: number;
  ready_count: number;
}

export interface GraphNode {
  id: string;
  type: "task" | "requirement" | "spec";
  title: string;
  stage: Stage;
  zone: string;
  status: TaskStatus;
  persona: string;
  worker_id?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "blocks" | "implements" | "derives_from";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface MCState {
  stage: { current: Stage };
  tasks: Task[];
  workers: Worker[];
  gates: Record<string, GateCriteria>;
  tokens: TokenSummary;
  connected: boolean;
  audit: AuditEntry[];
  checkpoints: CheckpointInfo[];
  graph?: GraphData;
}
