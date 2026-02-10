# Summary

Requirements specification for Mission 2: Wire MC Dashboard backend routes and build frontend views for audit trail, findings, and briefings.

## REQ-1: Fix Route Mounting in serve.go

**Problem:** `serve.go` builds its own `http.NewServeMux()` with inline handlers. `api.Server.Routes()` is never called, leaving `/api/audit`, `/api/tasks`, `/api/graph`, `/api/gates`, `/api/zones`, `/api/checkpoints`, `/api/stages/override`, `/api/projects`, `/api/chat` as dead code.

**Requirements:**

1. Create `api.NewServer(missionDir, hub, trk, acc)` in `serve.go` and mount its `Routes()` handler
2. Remove inline handlers that duplicate `api.Server` routes: `/api/health`, `/api/status`, `/api/tokens`, `/api/workers`, `/api/requirements`, `/api/requirements/coverage`, `/api/specs`, `/api/specs/orphans`
3. Preserve `/ws` (WebSocket) — not in `api.Server`, must stay inline
4. Preserve OpenClaw bridge routes (`/api/openclaw/status`, `/api/chat`) — conditionally registered, must take precedence over api.Server placeholders when bridge is connected
5. CORS middleware (`api.CORSMiddleware`) must wrap the final handler (already does via `api.Chain`)

**Acceptance Criteria:**

- `GET /api/audit` returns 200 with `{entries, total, limit, offset}`
- `GET /api/tasks` returns 200 with task list
- `GET /api/graph` returns 200
- `GET /api/gates` returns 200
- `GET /api/zones` returns 200
- `GET /api/checkpoints` returns 200
- All previously working endpoints (`/api/health`, `/api/status`, `/api/tokens`, `/api/workers`, `/ws`) continue to work
- `go test ./...` passes

**Files to modify:**

- `MissionControl/orchestrator/serve/serve.go` — remove inline handlers, mount api.Server.Routes()

**Implementation notes:**

- `api.Server` needs `TrackerReader` and `TokenReader` interfaces. `tracker.Tracker` has `List()` and `Get()`. `tokens.Accumulator` has `Summary()`. Verify interface satisfaction.
- Strategy: use `api.Server.Routes()` as the base mux, then register `/ws` and OpenClaw routes on top. Or use a wrapper mux that delegates to api.Server for `/api/` paths.

## REQ-2: Findings Endpoint

**Requirements:**

1. `GET /api/tasks/{id}/findings` serves `.mission/findings/{id}.md` as `text/markdown; charset=utf-8`
2. Path traversal protection: reject any `id` containing `..`, `/`, or `\`
3. Return 404 with JSON error if file doesn't exist
4. Return 400 with JSON error if id fails validation

**Acceptance Criteria:**

- `GET /api/tasks/abc123/findings` with existing file → 200, `Content-Type: text/markdown`, body is raw markdown
- `GET /api/tasks/nonexistent/findings` → 404 JSON
- `GET /api/tasks/../etc/passwd/findings` → 400 JSON
- `GET /api/tasks/foo%2f..%2fbar/findings` → 400 JSON

**Files to modify:**

- `MissionControl/orchestrator/api/handlers.go` — add `handleTaskFindings` handler
- `MissionControl/orchestrator/api/routes.go` — wire route in `handleTaskRouter` for path segment `findings`

## REQ-3: Briefings Endpoint

**Requirements:**

1. `GET /api/tasks/{id}/briefing` serves `.mission/handoffs/{id}-briefing.json` as `application/json`
2. Same path traversal protection as REQ-2
3. Return 404 if file doesn't exist
4. Validate JSON before serving (or serve raw with correct content-type)

**Acceptance Criteria:**

- `GET /api/tasks/abc123/briefing` with existing file → 200, `Content-Type: application/json`, body is briefing JSON
- `GET /api/tasks/nonexistent/briefing` → 404 JSON
- `GET /api/tasks/../etc/passwd/briefing` → 400 JSON

**Files to modify:**

- `MissionControl/orchestrator/api/handlers.go` — add `handleTaskBriefing` handler
- `MissionControl/orchestrator/api/routes.go` — wire route in `handleTaskRouter` for path segment `briefing`

## REQ-4: Frontend Audit View (Real Data + WebSocket)

**Problem:** `activity-view.tsx` receives `audit: AuditEntry[]` as props but the parent never fetches from `/api/audit` (since the endpoint was 404).

**Requirements:**

1. Parent component (or activity-view itself) fetches `GET /api/audit` on mount
2. Subscribe to WebSocket `audit` topic for real-time updates
3. Append new audit entries to the list without full refetch
4. Display: event action, timestamp (time-ago), actor, category with icon, details

**Acceptance Criteria:**

- On page load, audit trail section shows entries from `/api/audit`
- When a new audit event occurs, it appears in the list within 2 seconds without page refresh
- Category filter dropdown works with real data
- Entries show timestamp, action, actor, category badge, and details

**Files to modify:**

- `Darlington/components/mc/activity-view.tsx` — already renders audit, may need to add fetch/WS logic or keep as presentational
- `Darlington/app/` or `Darlington/components/mc/` — parent component that provides data to ActivityView (identify the parent that passes `audit` prop)
- `Darlington/lib/mc/` — add or update API client/hooks for audit fetching and WebSocket subscription

## REQ-5: Frontend Findings/Briefings Browser

**Requirements:**

1. New component or extend task detail view to show findings and briefings
2. When user selects a task, fetch `GET /api/tasks/{id}/findings` and render markdown
3. For markdown rendering: use a markdown-to-HTML library (e.g., `react-markdown`) or render in a `<pre>` block
4. Fetch `GET /api/tasks/{id}/briefing` and display as formatted JSON
5. Handle 404 gracefully (show "No findings" / "No briefing" message)

**Acceptance Criteria:**

- Clicking a task shows its findings markdown rendered as formatted text/HTML
- Clicking a task shows its briefing JSON formatted and readable
- Tasks without findings/briefings show appropriate empty state
- Markdown headings, lists, code blocks render correctly

**Files to modify:**

- `Darlington/components/mc/` — new `findings-view.tsx` or `task-detail.tsx` component
- `Darlington/lib/mc/types.ts` — no changes needed (findings are raw markdown, briefings are JSON)
- `Darlington/lib/mc/` — API client functions for fetching findings/briefings
- `Darlington/package.json` — add `react-markdown` or similar dependency if not present

## Files Summary

### MissionControl repo

| File                           | Changes                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `orchestrator/serve/serve.go`  | Remove inline handlers, create api.Server, mount Routes() |
| `orchestrator/api/routes.go`   | Add findings/briefing routes to handleTaskRouter          |
| `orchestrator/api/handlers.go` | Add handleTaskFindings, handleTaskBriefing handlers       |

### Darlington repo

| File                              | Changes                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `components/mc/activity-view.tsx` | Wire real audit data fetch + WebSocket subscription (or keep presentational) |
| `components/mc/findings-view.tsx` | New: markdown findings viewer + briefing JSON viewer                         |
| `lib/mc/api.ts` or similar        | API client functions for audit, findings, briefings                          |
| `lib/mc/hooks.ts` or similar      | React hooks for data fetching + WebSocket                                    |
| Parent page/layout component      | Pass real audit data to ActivityView                                         |
| `package.json`                    | Add react-markdown dependency                                                |
