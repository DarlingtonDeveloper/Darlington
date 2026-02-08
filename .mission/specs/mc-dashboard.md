# MissionControl Dashboard — Frontend Spec v1

## Overview

MissionControl is a multi-agent orchestration system. A King agent (Kai, running via OpenClaw) coordinates ephemeral worker agents (Claude Code sessions) through a 10-stage workflow. Workers spawn, complete tasks, output structured JSON findings, and die. All state lives in `.mission/` files on disk.

The dashboard lives at `darlington.dev/mc` and connects to `mc serve` running locally via Cloudflare Tunnel. It provides real-time visibility into the orchestration pipeline.

## Connection

| Channel   | URL                                                                          |
| --------- | ---------------------------------------------------------------------------- |
| REST      | `https://mc.darlington.dev/api/*`                                            |
| WebSocket | `wss://mc.darlington.dev/ws`                                                 |
| Auth      | Bearer token via `Authorization` header (REST) or `?token=` query param (WS) |

## Design System

Follows the existing darlington.dev aesthetic ("Precision & Density", Linear-inspired):

| Token              | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| Background         | `#07070e`                                                     |
| Foreground         | `#e8e4df`                                                     |
| Muted text         | `#6b6560`                                                     |
| Dim text           | `#4a4540`                                                     |
| Accent (warm gold) | `#c4b5a0`                                                     |
| Secondary accent   | `#a89880`                                                     |
| Success            | `#4ade80`                                                     |
| Danger             | `#f87171`                                                     |
| Warning            | `#fbbf24`                                                     |
| Display font       | Cormorant Garamond                                            |
| Body font          | DM Sans                                                       |
| Mono font          | JetBrains Mono                                                |
| Card bg            | `rgba(255,255,255,0.02)` with `rgba(255,255,255,0.06)` border |

Status colors are used consistently for dots, badges, and node fills:

| Status                 | Dot / Border color |
| ---------------------- | ------------------ |
| `in_progress` / `busy` | `#c4b5a0` (accent) |
| `complete` / `idle`    | `#4ade80` (green)  |
| `blocked` / `error`    | `#f87171` (red)    |
| `pending` / `offline`  | `#6b6560` (muted)  |

---

## Layout Structure

### Persistent Header (all views)

The header is always visible and contains four rows:

**Row 1 — Identity + Task Summary + Token Stats**

Left: MissionControl logo (◈ glyph in accent gradient box), title (Cormorant Garamond), subdomain (`mc.darlington.dev`), and connection status dot with "connected"/"live" label.

Centre: Task summary — four inline stat chips showing task counts by status:

- Active count (accent)
- Blocked count (red)
- Pending count (muted)
- Done count (green)

Right: Token stats in mono — `TOK` (total tokens), `COST` (estimated USD), `BURN` (tokens/min rate).

**Row 2 — Pipeline**

10-stage progress bar. Each stage is a segment showing icon + abbreviated label. Current stage has accent gradient background with glow animation and accent border. Complete stages show ✓ with green tint. Future stages are dimmed.

**Row 3 — View Tabs**

Three tabs in a pill-style toggle: **◈ Mission** · **◇ Trace** · **◷ Activity**

---

## Three Views

### 1. Mission View (main operational dashboard)

Two-column layout filling viewport below header.

**Left Column — Workers by Zone**

Workers are grouped into collapsible zone sections. Each zone group has:

- Zone glyph (◧ frontend, ◨ backend, ◩ database, ◪ infra, ◫ shared)
- Zone name (uppercase mono)
- Busy/total worker count badge
- Pulse dot if any worker is busy
- Chevron toggle (▾)

Zones with busy workers auto-expand on load. Zones with only idle workers start collapsed.

Each worker card within a zone shows:

- Status dot (pulsing if busy)
- Persona name (mono, bold)
- Kill button (× in danger style, only shown when busy)
- Task description (truncated single line)
- Stats row: uptime, token count, worker ID
- Live stdout preview (last line, mono, dark background, only shown when busy)

Below all zone groups: summary badges — X busy, X idle, X total.

Spawn Worker button at top of column.

**Right Column — Kai Chat**

Chat panel with header showing 🤖 icon, "Kai" label, and "coordinator" badge.

Scrollable message area. User messages right-aligned with accent background. Assistant messages left-aligned with subtle glass background.

Input bar at bottom: text input + send button (↑ arrow).

Actions: `POST /api/chat` with `{"message": "..."}`.

### 2. Trace View (dependency graph)

**Filter Bar**

Two dropdowns: stage filter and status filter. Right side shows ready count (green badge) and blocked count (red badge).

**Graph Area**

SVG-based dependency graph. Tasks are rectangular nodes with rounded corners, positioned in columns by stage.

Each node shows:

- Status dot (coloured by status)
- Task title (truncated)
- Persona + zone label
- Task ID (dim)

Node fill and border use status colours. Selected node gets accent border highlight.

Edges are lines between nodes representing `blocks` relationships:

- Normal edges: subtle accent colour with arrow markers
- Blocked edges: dashed red with danger arrow markers

Clicking a node opens a detail panel on the right showing: title, status badge, and a key-value grid of stage, zone, persona, worker ID, and blocks list.

**Future:** Node types will expand to `requirement` and `spec`. Edge types will expand to `implements`, `derives_from`, `traces_to`. Layout will become three-layer (requirements → specs → tasks).

### 3. Activity View (audit, checkpoints, gate review, analytics)

Two-column layout.

**Left Column — Gate + Audit Trail**

Gate Status card:

- Header: "Gate — {current_stage}" with met/total criteria count badge (warning style)
- Criteria checklist: each item has a checkbox (green check when met, empty when unmet), text with strikethrough when met
- Action buttons: Approve Gate (success, disabled until all criteria met), Reject (danger), Override (ghost, right-aligned)

Audit Trail card:

- Category filter dropdown (all, worker, stage, gate, task, checkpoint)
- Timeline of events, each showing: category icon in a small box, message text, time ago + actor + category badge

**Right Column — Stats + Checkpoints + Charts**

Worker & Task counts: 4-up grid of stat cards (Workers, Busy, Tasks, Complete) using Cormorant Garamond large numbers.

Checkpoints card:

- Header with "+ Create" button
- List of checkpoints showing: auto/manual icon (🔄/💾), checkpoint ID (mono), stage + task progress + time ago, Restore button

Token Usage Over Time: SVG line chart with area fill. Accent-coloured line and dots, subtle grid, time labels on x-axis, token count on y-axis.

Cost by Persona: horizontal bar chart showing each persona's token usage and cost with progress bars.

---

## WebSocket Protocol

### Initial State

On connect, server sends full snapshot:

```json
{
  "topic": "sync",
  "type": "initial_state",
  "data": {
    "stage": {},
    "tasks": [],
    "workers": [],
    "gates": {},
    "zones": [],
    "openclaw": {},
    "token_usage": {},
    "project": {}
  }
}
```

### Real-time Events

```json
{"topic": "worker", "type": "spawned", "data": {"worker_id": "mc-a1b2c", "persona": "developer", "zone": "frontend"}}
{"topic": "stage", "type": "changed", "data": {"current": "implement", "previous": "design"}}
{"topic": "token", "type": "usage_update", "data": {"worker_id": "mc-a1b2c", "total_tokens": 4500, "total_cost_usd": 0.04}}
{"topic": "worker", "type": "output", "data": {"worker_id": "mc-a1b2c", "line": "Creating login component...", "timestamp": "..."}}
```

### Topic Subscription

Optional — default is all topics:

```json
{
  "type": "subscribe",
  "topics": ["stage", "task", "worker", "gate", "token", "chat"]
}
```

Key topics: `stage`, `task`, `worker`, `gate`, `token`, `chat`, `zone`, `checkpoint`, `audit`, `requirement` (future), `spec` (future), `memory`

---

## REST Endpoints

### Reads

| Endpoint                                  | Purpose                                      |
| ----------------------------------------- | -------------------------------------------- |
| `GET /api/status`                         | Full snapshot for initial hydration          |
| `GET /api/tasks?stage=&zone=&status=`     | Filtered task list                           |
| `GET /api/graph`                          | Traceability graph (nodes + edges, D3-ready) |
| `GET /api/workers`                        | Active workers with health                   |
| `GET /api/workers/:id/logs`               | Per-worker stdout (last 200 lines)           |
| `GET /api/gates`                          | All gate criteria per stage                  |
| `GET /api/zones`                          | Zones with worker counts                     |
| `GET /api/checkpoints`                    | Checkpoint history                           |
| `GET /api/audit?limit=&offset=&category=` | Paginated audit log                          |
| `GET /api/tokens`                         | Token usage summary                          |
| `GET /api/projects`                       | Project list (sorted by lastOpened)          |

### Actions

| Endpoint                            | Purpose                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | ------------ |
| `POST /api/chat`                    | Send message to Kai (`{"message": "..."}`)                                                      |
| `POST /api/gates/:stage/approve`    | Approve gate                                                                                    |
| `POST /api/gates/:stage/reject`     | Reject gate                                                                                     |
| `POST /api/workers/spawn`           | Spawn worker (`{"persona": "developer", "task": "...", "zone": "frontend", "model": "sonnet"}`) |
| `POST /api/workers/:id/kill`        | Kill worker                                                                                     |
| `POST /api/checkpoints`             | Create manual checkpoint                                                                        |
| `POST /api/checkpoints/:id/restart` | Restart from checkpoint                                                                         |
| `POST /api/stages/override`         | Force stage change (`{"stage": "implement", "direction": "advance                               | rollback"}`) |
| `POST /api/projects/switch`         | Hot-swap project                                                                                |

---

## Graph Endpoint Structure

```json
{
  "nodes": [
    {
      "id": "mc-a1b2c",
      "type": "task",
      "title": "Build login form",
      "stage": "implement",
      "zone": "frontend",
      "status": "in_progress",
      "persona": "developer",
      "worker_id": "mc-x1y2z"
    }
  ],
  "edges": [{ "source": "mc-a1b2c", "target": "mc-d3e4f", "type": "blocks" }],
  "critical_path": ["mc-a1b2c", "mc-d3e4f"],
  "blocked_count": 3,
  "ready_count": 5
}
```

Node types will expand to `requirement` and `spec`. Edge types will expand to `implements`, `derives_from`, `traces_to`.

---

## Existing Shell

The current codebase has a basic shell at `/mc`:

| File                                  | Contents                                                               |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `app/mc/layout.tsx`                   | Dark theme layout wrapper                                              |
| `app/mc/page.tsx`                     | Server component                                                       |
| `app/mc/mc-client.tsx`                | Client component with connection status, channel badges, workers panel |
| `lib/mc/use-oc-websocket.ts`          | WebSocket hook (connect, reconnect, parse messages)                    |
| `lib/mc/types.ts`                     | `Worker`, `Channel`, `OcConnectionState` types                         |
| `components/mc/workers-panel.tsx`     | Flat worker list                                                       |
| `components/mc/connection-status.tsx` | Status dot indicator                                                   |
| `components/mc/channel-badges.tsx`    | Channel type badges                                                    |

This shell will be replaced/extended to implement the full spec above. The WebSocket hook needs updating to match the new protocol (topic-based events, initial state snapshot, topic subscription).
