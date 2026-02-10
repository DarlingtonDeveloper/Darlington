# Summary

Implementation plan for Mission 2: Audit trail, findings/briefings browser. 5 tasks across 2 waves.

## Wave 1 — Backend (parallel, no inter-dependencies)

### Task 1A: Fix Route Mounting in serve.go

**Files:** `MissionControl/orchestrator/serve/serve.go`
**Scope:** Remove inline `/api/health`, `/api/status`, `/api/tokens`, `/api/workers`, `/api/requirements`, `/api/requirements/coverage`, `/api/specs`, `/api/specs/orphans` handlers. Create `api.NewServer(missionDir, hub, trk, acc)` and mount `apiServer.Routes()` as the base. Keep `/ws` and OpenClaw bridge routes inline (registered on top). Ensure CORS middleware wraps everything.
**Implementation approach:** Use `apiServer.Routes()` as a fallback handler. Register `/ws` and OpenClaw routes on the outer mux, then use a catch-all that delegates to `apiServer.Routes()`. Alternatively, register apiServer routes first, then override with inline `/ws` + OpenClaw.
**Complexity:** Medium — careful ordering needed to avoid route shadowing. The Go 1.22 `ServeMux` precedence rules help (more specific wins).
**Acceptance:** All `/api/*` endpoints return 200, `/ws` still works, `go test ./...` passes.
**Dependencies:** None

### Task 1B: Findings Endpoint

**Files:** `MissionControl/orchestrator/api/handlers.go`, `MissionControl/orchestrator/api/routes.go`
**Scope:** Add `handleTaskFindings` in handlers.go — reads `.mission/findings/{id}.md`, serves as `text/markdown`. Path traversal protection (reject `..`, `/`, `\`). Wire in `handleTaskRouter` in routes.go for path segment `findings`.
**Implementation:**

- In `handleTaskRouter`, add case for `parts[1] == "findings"` → `s.handleTaskFindings(w, r, id)`
- Handler: validate id with `strings.ContainsAny(id, "../\\")`, read `s.missionPath("findings", id+".md")`, serve with `text/markdown; charset=utf-8`
  **Complexity:** Low — straightforward file serving with validation.
  **Acceptance:** GET returns 200/markdown, 404 JSON for missing, 400 JSON for bad id.
  **Dependencies:** None (routes.go change is minimal and non-conflicting with 1C)

### Task 1C: Briefings Endpoint

**Files:** `MissionControl/orchestrator/api/handlers.go`, `MissionControl/orchestrator/api/routes.go`
**Scope:** Add `handleTaskBriefing` — reads `.mission/handoffs/{id}-briefing.json`, serves as `application/json`. Same path traversal protection.
**Implementation:** Same pattern as 1B but for briefings. Wire `parts[1] == "briefing"` in `handleTaskRouter`.
**Complexity:** Low
**Acceptance:** GET returns 200/json, 404 JSON for missing, 400 JSON for bad id.
**Dependencies:** None (but shares files with 1B — if assigned to same worker, no conflict; if separate workers, the routes.go edits are on different lines in `handleTaskRouter`)

> **Note on 1B + 1C:** These touch the same two files. Safest to assign to **one worker** that implements both. Alternatively, 1B adds the `findings` case and 1C adds the `briefing` case — they edit different switch branches. Risk: low merge conflict. **Recommendation: combine 1B+1C into one task.**

## Wave 2 — Frontend (after Wave 1 completes)

### Task 2A: Audit View — Real Data Wiring

**Files:** `Darlington/app/mc/mc-client.tsx`, `Darlington/lib/mc/use-mc-websocket.ts`
**Scope:** The WebSocket hook already handles `audit` topic events and initial sync includes audit data. The `ActivityView` already receives `audit` prop from `mcState.audit`. **This is already wired.** The missing piece was that `/api/audit` was 404 (fixed by Task 1A), so initial sync from `/api/status` didn't include audit data, and the `audit` WebSocket topic had no source.
**Verification needed:** After Task 1A lands, verify that:

1. `buildState()` in serve.go includes audit data in the status response (it currently doesn't — only workers, tokens, stage, gates, tasks)
2. The WebSocket `initial_state` sync includes audit entries
   **Additional work:** Update `buildState()` in serve.go to include `audit` key by reading `audit.jsonl`. This is actually a **serve.go change** — should be part of Task 1A.
   **Frontend changes:** Potentially none if the data flow already works. May need to add a direct fetch of `/api/audit` on mount in `use-mc-websocket.ts` if `buildState` doesn't include it.
   **Complexity:** Low — mostly verification + possibly one fetch call
   **Dependencies:** Task 1A

### Task 2B: Findings/Briefings Viewer

**Files:** `Darlington/components/mc/findings-view.tsx` (new), `Darlington/components/mc/trace-view.tsx` or `mc-client.tsx` (integration point), `Darlington/package.json` (add `react-markdown`)
**Scope:** New component that:

1. Accepts a task ID
2. Fetches `GET /api/tasks/{id}/findings` → renders markdown via `react-markdown`
3. Fetches `GET /api/tasks/{id}/briefing` → renders formatted JSON
4. Handles 404 gracefully with empty states
5. Integrate into task detail view (likely in TraceView or as a panel triggered by task selection)
   **Implementation:**

- Install `react-markdown` + `remark-gfm`
- Create `findings-view.tsx` with two tabs: Findings (markdown) and Briefing (JSON)
- Hook into task selection in TraceView or add a detail panel
- Style: dark theme `#07070e`, accent `#c4b5a0`, use existing Card/Badge/SectionLabel components
  **Complexity:** Medium — new component + dependency + integration point
  **Dependencies:** Tasks 1B, 1C

## Task Summary

| ID  | Name                                     | Wave | Files                                                       | Complexity | Depends On |
| --- | ---------------------------------------- | ---- | ----------------------------------------------------------- | ---------- | ---------- |
| 1A  | Fix route mounting + audit in buildState | 1    | `serve.go`                                                  | Medium     | —          |
| 1BC | Findings + briefings endpoints           | 1    | `api/handlers.go`, `api/routes.go`                          | Low        | —          |
| 2A  | Audit view data verification + fetch     | 2    | `use-mc-websocket.ts`, `mc-client.tsx`                      | Low        | 1A         |
| 2B  | Findings/briefings viewer component      | 2    | `findings-view.tsx` (new), `trace-view.tsx`, `package.json` | Medium     | 1BC        |

## Scope Paths

```
Task 1A:
  scope_paths:
    - MissionControl/orchestrator/serve/serve.go

Task 1BC:
  scope_paths:
    - MissionControl/orchestrator/api/handlers.go
    - MissionControl/orchestrator/api/routes.go

Task 2A:
  scope_paths:
    - Darlington/lib/mc/use-mc-websocket.ts
    - Darlington/app/mc/mc-client.tsx

Task 2B:
  scope_paths:
    - Darlington/components/mc/findings-view.tsx
    - Darlington/components/mc/trace-view.tsx
    - Darlington/package.json
```

## Key Implementation Notes

1. **serve.go strategy:** Register `apiServer.Routes()` handler, then register `/ws` and OpenClaw routes on the outer mux. Go's ServeMux gives precedence to more specific patterns, so `/ws` and `/api/openclaw/*` registered on the outer mux will take priority when bridge is connected.

2. **buildState() must include audit:** Currently `buildState()` only returns workers, tokens, stage, gates, tasks. Add `audit` by reading `audit.jsonl` so the WebSocket initial sync includes audit entries. Without this, the frontend audit view stays empty until a new event fires.

3. **Findings/briefings share handleTaskRouter:** Both add a case in the `if len(parts) > 1` block. The `findings` case reads from `.mission/findings/{id}.md`, the `briefing` case from `.mission/handoffs/{id}-briefing.json`. Same validation logic — extract a `validateTaskID` helper.

4. **react-markdown:** Use `react-markdown` with `remark-gfm` for tables/strikethrough. Wrap in a div with prose-like styling matching the dark theme.
