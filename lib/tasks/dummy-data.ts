export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2" | "P3";
  effort: "S" | "M" | "L" | "XL";
  tags: string[];
  service: string;
  created: string;
}

export const dummyTasks: Task[] = [
  {
    id: "task-001",
    title: "vault-entrypoint.sh retry logic",
    description:
      "Add exponential backoff retry logic to the vault-entrypoint.sh bootstrap script. Currently fails hard on first connection error during service initialisation.",
    priority: "P1",
    effort: "S",
    tags: ["vault", "infra", "reliability"],
    service: "Warren",
    created: "2026-02-10T09:00:00Z",
  },
  {
    id: "task-002",
    title: "Cortex Phase 1: Storage Layer",
    description:
      "Implement the storage abstraction layer for Cortex — vector store interface, embedding pipeline, and chunking strategy. Foundation for all retrieval features.",
    priority: "P0",
    effort: "XL",
    tags: ["cortex", "storage", "embeddings"],
    service: "Cortex",
    created: "2026-02-08T11:30:00Z",
  },
  {
    id: "task-003",
    title: "Port hardening for mode:host services",
    description:
      "Audit all services running in host network mode and enforce strict iptables rules. Some services expose unnecessary ports on the LAN interface.",
    priority: "P1",
    effort: "M",
    tags: ["security", "networking", "docker"],
    service: "Warren",
    created: "2026-02-12T14:00:00Z",
  },
  {
    id: "task-004",
    title: "PromptForge migration 003",
    description:
      "Apply migration 003 to add prompt versioning with diff tracking. Includes schema changes to the prompts table and a backfill of existing records.",
    priority: "P1",
    effort: "M",
    tags: ["promptforge", "migrations", "db"],
    service: "PromptForge",
    created: "2026-02-14T10:00:00Z",
  },
  {
    id: "task-005",
    title: "Marketing touchpoint audit",
    description:
      "Review and map all current marketing touchpoints across email, social, and the portfolio site. Identify gaps and redundancies before Q2 push.",
    priority: "P2",
    effort: "M",
    tags: ["marketing", "audit", "strategy"],
    service: "Darlington",
    created: "2026-02-11T09:00:00Z",
  },
  {
    id: "task-006",
    title: "Dispatch dead-letter queue handler",
    description:
      "Implement a DLQ consumer for Dispatch that captures failed job payloads, stores them in Postgres, and exposes a retry endpoint via the admin API.",
    priority: "P1",
    effort: "L",
    tags: ["dispatch", "queues", "reliability"],
    service: "Dispatch",
    created: "2026-02-09T16:00:00Z",
  },
  {
    id: "task-007",
    title: "Alexandria: document ingestion pipeline",
    description:
      "Build the PDF/markdown ingestion pipeline for Alexandria. Parse → chunk → embed → store, with metadata extraction for title, author, and date.",
    priority: "P0",
    effort: "XL",
    tags: ["alexandria", "ingestion", "pipeline"],
    service: "Alexandria",
    created: "2026-02-07T10:00:00Z",
  },
  {
    id: "task-008",
    title: "Hermes webhook signature verification",
    description:
      "Add HMAC-SHA256 signature verification to all incoming Hermes webhooks. Currently accepting payloads without validation — security gap.",
    priority: "P0",
    effort: "S",
    tags: ["hermes", "security", "webhooks"],
    service: "Hermes",
    created: "2026-02-13T08:30:00Z",
  },
  {
    id: "task-009",
    title: "Darlington /ship-log redesign",
    description:
      "Redesign the ship-log page to use a timeline layout with better visual hierarchy. Current card grid doesn't convey chronology well.",
    priority: "P3",
    effort: "M",
    tags: ["darlington", "ui", "design"],
    service: "Darlington",
    created: "2026-02-15T11:00:00Z",
  },
  {
    id: "task-010",
    title: "Warren service discovery cache TTL",
    description:
      "Service discovery results are currently cached indefinitely in memory. Add configurable TTL (default 60s) with stale-while-revalidate semantics.",
    priority: "P2",
    effort: "S",
    tags: ["warren", "caching", "service-discovery"],
    service: "Warren",
    created: "2026-02-10T13:00:00Z",
  },
  {
    id: "task-011",
    title: "Cortex Phase 2: Query Router",
    description:
      "Implement the query router that decides between vector search, keyword search, and hybrid retrieval based on query classification. Requires Phase 1 complete.",
    priority: "P1",
    effort: "XL",
    tags: ["cortex", "search", "routing"],
    service: "Cortex",
    created: "2026-02-08T12:00:00Z",
  },
  {
    id: "task-012",
    title: "Dispatch job priority lanes",
    description:
      "Add 3-tier priority queue (critical/default/bulk) to Dispatch. Critical jobs bypass the main queue, bulk jobs yield CPU when critical traffic spikes.",
    priority: "P1",
    effort: "L",
    tags: ["dispatch", "queues", "performance"],
    service: "Dispatch",
    created: "2026-02-11T14:30:00Z",
  },
  {
    id: "task-013",
    title: "MissionControl stage gate UI",
    description:
      "Build the stage gate approval UI in the Darlington swarm view. Display gate criteria, current findings, and allow one-click approve/reject with reason.",
    priority: "P2",
    effort: "L",
    tags: ["missioncontrol", "ui", "swarm"],
    service: "Darlington",
    created: "2026-02-13T10:00:00Z",
  },
  {
    id: "task-014",
    title: "Hermes Telegram rate limit backpressure",
    description:
      "Telegram API returns 429 when message volume spikes. Implement adaptive rate limiting in Hermes with per-chat token bucket and queue draining.",
    priority: "P1",
    effort: "M",
    tags: ["hermes", "telegram", "rate-limiting"],
    service: "Hermes",
    created: "2026-02-12T09:00:00Z",
  },
  {
    id: "task-015",
    title: "Warren secrets rotation automation",
    description:
      "Automate quarterly secrets rotation using Vault's dynamic secrets engine. Currently manual — engineer runs a playbook. Target: zero-touch rotation with audit log.",
    priority: "P2",
    effort: "XL",
    tags: ["warren", "vault", "secrets"],
    service: "Warren",
    created: "2026-02-06T10:00:00Z",
  },
  {
    id: "task-016",
    title: "PromptForge: prompt diff viewer",
    description:
      "Add a visual diff viewer to the PromptForge UI that shows changes between prompt versions. Use unified diff format with syntax highlighting for variable placeholders.",
    priority: "P2",
    effort: "M",
    tags: ["promptforge", "ui", "versioning"],
    service: "PromptForge",
    created: "2026-02-14T15:00:00Z",
  },
  {
    id: "task-017",
    title: "Darlington analytics dashboard",
    description:
      "Build a private analytics dashboard aggregating Vercel metrics, GitHub activity, and custom events. No third-party trackers — all first-party data.",
    priority: "P3",
    effort: "L",
    tags: ["darlington", "analytics", "dashboard"],
    service: "Darlington",
    created: "2026-02-15T14:00:00Z",
  },
  {
    id: "task-018",
    title: "Cortex: citation extraction",
    description:
      "After retrieval, extract and surface source citations alongside LLM responses. Users should see which documents contributed to each answer.",
    priority: "P1",
    effort: "M",
    tags: ["cortex", "citations", "ux"],
    service: "Cortex",
    created: "2026-02-09T10:00:00Z",
  },
];

export const TASKS = dummyTasks;
