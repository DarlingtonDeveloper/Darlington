# Summary

Research into MC Dashboard backend APIs, findings/briefings serving, and requirements coverage for Mission 2.

## API Status

| Endpoint                         | Status   | Notes                                                                                                                           |
| -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/health`                | ✅ Works | `{"status":"ok","version":"6.1"}`                                                                                               |
| `GET /api/status`                | ✅ Works | Full state snapshot (stage, tasks, gates, workers, tokens)                                                                      |
| `GET /api/audit`                 | ❌ 404   | **Route registered in `api/routes.go` but never mounted** — `serve.go` builds its own mux and doesn't use `api.Server.Routes()` |
| `GET /api/tasks`                 | ❌ 404   | Same root cause — registered in `api/routes.go` but not in `serve.go`'s mux                                                     |
| `GET /api/requirements`          | ✅ Works | Placeholder: returns `[]`                                                                                                       |
| `GET /api/requirements/coverage` | ✅ Works | Placeholder: returns `{"total":0,"implemented":0,"coverage":0}`                                                                 |
| `GET /api/tokens`                | ✅ Works | From accumulator                                                                                                                |
| `GET /api/workers`               | ✅ Works | From tracker                                                                                                                    |
| `WS /ws`                         | ✅ Works | Hub with topic subscriptions                                                                                                    |

## Root Cause: Missing Route Mounting

**`serve/serve.go`** creates its own `http.NewServeMux()` and registers routes inline (health, status, tokens, workers, requirements, specs placeholders). It **never calls `api.NewServer().Routes()`**, so all routes in `api/routes.go` are dead code:

- `/api/audit` (reads `audit.jsonl` with filtering + pagination)
- `/api/tasks` (CRUD)
- `/api/tasks/{id}`
- `/api/graph`
- `/api/gates`, `/api/gates/{stage}/approve|reject`
- `/api/zones`
- `/api/checkpoints`
- `/api/stages/override`
- `/api/projects`
- `/api/chat`

**Fix:** Replace inline handlers in `serve.go` with `apiServer.Routes()`, or merge them. The `api/handlers.go` implementations are complete and ready to use.

## Audit Trail

- **Backend:** `handleAudit` in `api/handlers.go` reads `.mission/audit.jsonl`, supports `?category=`, `?actor=`, `?limit=`, `?offset=` query params. Returns `{entries: [...], total: N, limit: N, offset: N}`.
- **Data exists:** `.mission/audit.jsonl` has entries (387 bytes currently).
- **Frontend:** `activity-view.tsx` already renders audit entries with category filtering, time-ago formatting, and actor display. It expects `AuditEntry[]` with `{timestamp, action, actor, category, details}`.
- **WebSocket:** The watcher broadcasts `"audit"` topic events when audit.jsonl changes (via `topicMap` in serve.go). Real-time audit is supported.
- **Gap:** Just need to mount the route.

## Findings/Briefings

- **Tasks don't include findings paths** in their data model. The `Task` type has: id, name, stage, zone, persona, status, worker_id, blocks, blocked_by, created_at, updated_at.
- **No API to read findings content.** Findings live at `.mission/findings/{taskId}.md` but there's no endpoint to serve them.
- **Handoff briefings** live at `.mission/handoffs/{taskId}-briefing.json` — also no serving endpoint.
- **Watcher emits `findings_ready`** events (serve.go handles this to auto-mark tasks complete), so the infrastructure knows when findings appear.
- **Need:** A new endpoint like `GET /api/tasks/{id}/findings` to serve findings markdown and `GET /api/tasks/{id}/briefing` for handoff briefings.

## Requirements Coverage

- **Currently placeholder:** Returns empty array / zero coverage.
- **No `.mission/state/requirements.jsonl`** or similar file exists yet.
- **Frontend types:** `GraphNode` has `type: "task" | "requirement" | "spec"` suggesting requirements were planned for the graph view.
- **Need:** Either wire up real requirements parsing from mission config, or keep as placeholder until a later mission.

## What Activity View Currently Does vs Needs

### Currently Does:

- **Gate status** for current stage with criteria checkboxes, approve/reject buttons
- **Audit trail** with category filter dropdown (worker/stage/gate/task/checkpoint)
- **Stats grid** (workers, busy, tasks, complete counts)
- **Checkpoints** list with create/restore
- **Token usage** SVG chart (cumulative over sessions)
- **Cost by persona** bar chart

### Needs for Mission 2:

1. **Working audit data** — fix route mounting so `/api/audit` works
2. **Findings browser** — click a task to see its findings markdown rendered inline
3. **Briefings viewer** — view handoff briefings for tasks
4. **Requirements coverage** — real data or at minimum a meaningful placeholder

## WebSocket Events

The hub supports topic-based subscriptions. Clients can subscribe to specific topics:

- `stage`, `task`, `worker`, `gate`, `zone`, `checkpoint`, `audit`, `memory`, `token`
- Initial state sync on connect via `stateProvider`
- Client commands: `subscribe`, `unsubscribe`, `request_sync`
- **Audit events are broadcast in real-time** when audit.jsonl changes

## Recommended Implementation Order

1. **Fix route mounting** in `serve.go` — use `api.Server.Routes()` instead of inline handlers (unblocks audit, tasks, gates, checkpoints, graph, zones)
2. **Add findings endpoint** — `GET /api/tasks/{id}/findings` reads `.mission/findings/{id}.md`
3. **Add briefing endpoint** — `GET /api/tasks/{id}/briefing` reads `.mission/handoffs/{id}-briefing.json`
4. **Frontend: findings panel** in activity view or task detail
5. **Requirements** can stay placeholder for now
