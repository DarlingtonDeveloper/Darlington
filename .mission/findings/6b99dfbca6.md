# Summary

Discovery findings for MC Dashboard Mission 3B — checkpoints, zones, projects, and stage override capabilities across MissionControl (Go backend) and Darlington (Next.js frontend).

## 1. Checkpoints

### CLI Commands (`cmd/mc/checkpoint.go`)

- `mc checkpoint` — Create checkpoint (optional `--tokens` threshold gate)
- `mc checkpoint status` — Session health (green/yellow/red based on duration)
- `mc checkpoint history` — List past sessions from `sessions.jsonl`
- `mc checkpoint query <id>` — View a specific checkpoint
- `mc checkpoint restart` — End session, create checkpoint, start new session with briefing (optional `--from <id>`)
- `mc checkpoint auto` — Token-aware auto-checkpoint for pre-compaction (`--tokens`, `--reason`)

### Checkpoint Data Shape (`CheckpointData` struct)

```json
{
  "id": "cp-20260210-172916",
  "stage": "goal",
  "created_at": "2026-02-10T17:29:16Z",
  "session_id": "67040fbe",
  "tasks": [
    {
      "id": "",
      "name": "",
      "stage": "",
      "zone": "",
      "persona": "",
      "status": "",
      "created_at": "",
      "updated_at": ""
    }
  ],
  "gates": {
    "<stage>": {
      "stage": "",
      "status": "",
      "criteria": ["..."],
      "approved_at": "",
      "approval_note": ""
    }
  },
  "decisions": ["..."],
  "blockers": ["..."],
  "summary": ""
}
```

### Storage

- Checkpoint files: `.mission/orchestrator/checkpoints/<id>.json`
- Current pointer: `.mission/orchestrator/current.json` (`checkpoint_id`, `session_id`, `created_at`, optionally `briefing`)
- Session history: `.mission/orchestrator/sessions.jsonl` (SessionRecord lines)

### REST API (`orchestrator/api/`)

- `GET /api/checkpoints` — Lists checkpoint directories (returns `[{id, timestamp}]`) — **Note: currently looks in `.mission/checkpoints/` (dirs), while CLI writes to `.mission/orchestrator/checkpoints/` (files). Potential path mismatch.**
- `POST /api/checkpoints` — Shells out to `mc checkpoint`
- `POST /api/checkpoints/{id}/restart` — Shells out to `mc checkpoint restart {id}`

### WebSocket

- Topic: `checkpoint` — events pushed when checkpoint created
- Subscribed by frontend in `use-mc-websocket.ts`

### Frontend Types (`lib/mc/types.ts`)

```typescript
interface CheckpointInfo {
  id: string;
  stage: Stage;
  created_at: string;
  task_count?: number;
  auto?: boolean;
}
```

- `MCState.checkpoints: CheckpointInfo[]` — stored in state
- WebSocket handler appends new checkpoints to array
- **No dedicated checkpoint UI component exists yet** — data is collected but not rendered in any visible component

## 2. Zones

### Backend

- Tasks have a `zone` field (string, set via `mc task create --zone`)
- `GET /api/zones` — Returns zones from `zones.json` or derives unique zone strings from tasks
- `deriveZones()` — Extracts distinct zone values from tasks.jsonl
- No separate zone CRUD — zones emerge from task data
- WebSocket topic: `zone` (subscribed but handler is a no-op: `case "zone": return prev`)

### Frontend

- **`ZONE_GLYPHS`** in types.ts: `frontend: "◧"`, `backend: "◨"`, `database: "◩"`, `infra: "◪"`, `shared: "◫"`
- **`ZoneGroup` component** (`components/mc/zone-group.tsx`) — Collapsible zone section showing workers grouped by zone with busy/total counts and status dots
- Zone is used as a grouping mechanism for workers, not a standalone entity

### Gaps

- No zone management API (create/rename/delete)
- No zone-level metrics or status
- ZoneGroup only shows workers, not tasks

## 3. Projects (Multi-Project)

### CLI (`cmd/mc/project.go`)

- `mc project list` — Lists registered projects from `~/.mc/projects.json`
- `mc project register <name> [path]` — Register project name → .mission/ path
- `mc project remove <name>` — Unregister
- `mc project link <target> [location]` — Create .mission symlink
- `mc --project <name>` — Global flag to use a registered project

### Registry Shape (`~/.mc/projects.json`)

```json
{ "projects": { "name": "/path/to/.mission" } }
```

### REST API

- `GET /api/projects` — Reads `~/.mission-control/config.json` (different path from CLI registry!)
- `POST /api/projects/switch` — Body: `{ "path": "/project/root" }` — hot-swaps the server's `missionDir`

### Frontend

- No project switcher UI component exists
- No project-related types in `lib/mc/types.ts`

### Gaps

- **Path mismatch**: CLI uses `~/.mc/projects.json`, API reads `~/.mission-control/config.json`
- No project list endpoint that matches CLI's registry
- No frontend for project switching

## 4. Stage Override

### CLI (`cmd/mc/stage.go`)

- `mc stage` — Show current stage
- `mc stage next` — Advance with gate checks
- `mc stage <name>` — Set specific stage (with gate checks for forward jumps)
- `mc stage next --force --reason "..."` — Bypass gate checks (logged to audit)
- 10 stages: `discovery → goal → requirements → planning → design → implement → verify → validate → document → release`

### Gate Enforcement

- `enforceGate()` — Checks `gates.json` criteria AND `mc-core` structural checks
- `advanceStageChecked()` — Zero-task block, velocity check (<10s), findings content validation (>200 bytes), mandatory reviewer for verify stage
- Force bypass writes `gate_forced` audit entry

### REST API

- `POST /api/stages/override` — Body: `{ "stage": "implement" }` — calls `mc stage set <stage>`
- **No force/reason support in the API** — just sets the stage directly via `mc stage set`
- No GET endpoint for current stage (use `GET /api/status` which includes stage)

### Frontend

- `MCState.stage.current` tracks current stage
- `PipelineBar` component shows stage progression
- WebSocket topic `stage` updates `stage.current`
- `approveGate()` function in `use-mc-websocket.ts` calls `POST /api/gates/{stage}/approve`
- **No stage override UI exists** — no way to jump stages from the dashboard

### Gaps

- API override doesn't support `--force --reason` (no gate bypass with audit trail)
- No confirmation dialog or safety check in API
- No frontend override control

## 5. Existing Frontend Components

| Component                     | Purpose                         |
| ----------------------------- | ------------------------------- |
| `pipeline-bar.tsx`            | Stage progression visualization |
| `zone-group.tsx`              | Workers grouped by zone         |
| `worker-card.tsx`             | Individual worker display       |
| `worker-panel.tsx`            | Worker list panel               |
| `gate-conditions-panel.tsx`   | Gate criteria display           |
| `mission-view.tsx`            | Main mission overview           |
| `activity-view.tsx`           | Activity feed                   |
| `findings-view.tsx`           | Findings browser                |
| `specs-view.tsx`              | Specs viewer                    |
| `trace-view.tsx`              | Trace viewer                    |
| `chat-panel.tsx`              | Chat interface                  |
| `token-usage-panel.tsx`       | Token/cost tracking             |
| `dashboard-header.tsx`        | Header with status              |
| `bridge-status-indicator.tsx` | OpenClaw connection status      |
| `status-dot.tsx`              | Status indicator dot            |
| `badge.tsx`                   | Badge component                 |
| `card.tsx`                    | Card wrapper                    |
| `section-label.tsx`           | Section label                   |
| `action-button.tsx`           | Action button                   |

## 6. WebSocket Events

Topics subscribed: `stage`, `task`, `worker`, `gate`, `token`, `chat`, `zone`, `checkpoint`, `audit`

File watcher event → topic mapping:

- `stage_changed` → `stage`
- `task_created/updated/deleted` → `task`
- `worker_spawned/completed/status_changed` → `worker`
- `gate_approved/ready` → `gate`
- `zone_activity` → `zone`
- `checkpoint` → `checkpoint`
- `audit` → `audit`
- `findings_ready` → `task`
- `handoff_created` → `task`

Initial sync: `request_sync` → server calls `buildState()` → pushes `sync/initial_state` with full state.

## 7. Key Gaps for 3B Dashboard Work

1. **Checkpoint viewer** — Data flows to frontend but no UI renders it. Need timeline/list view, detail drill-down, restart button.
2. **Zone dashboard** — Only worker grouping exists. Need task-by-zone view, zone metrics.
3. **Project switcher** — No frontend. API path mismatch with CLI registry. Need dropdown/selector.
4. **Stage override** — No frontend control. API lacks force/reason support. Need confirmation dialog with reason field.
5. **Checkpoint API path bug** — `GET /api/checkpoints` reads `.mission/checkpoints/` (dirs) but CLI writes to `.mission/orchestrator/checkpoints/` (files). Needs alignment.
