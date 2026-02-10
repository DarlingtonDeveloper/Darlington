# Summary

Added findings and briefings serving endpoints to the MissionControl API.

## Changes

### orchestrator/api/handlers.go

- Added `validateTaskID(id string) bool` — rejects empty IDs and those containing `..`, `/`, or `\` (path traversal prevention)
- Added `handleTaskFindings(w, r, id)` — serves `.mission/findings/{id}.md` as `text/markdown; charset=utf-8`, returns 404 JSON if file missing, 400 if invalid ID
- Added `handleTaskBriefing(w, r, id)` — serves `.mission/handoffs/{id}-briefing.json` as `application/json`, same error handling

### orchestrator/api/routes.go

- Extended `handleTaskRouter` switch: added `case "findings"` and `case "briefing"` dispatching to the new handlers (GET only, 405 for other methods)

## Verification

- `go build ./api/...` compiles cleanly
- Pre-existing interface mismatch in `serve/serve.go` (TrackerReader/TokenReader) is unrelated to these changes

## Endpoints

- `GET /api/tasks/{id}/findings` → 200 `text/markdown` | 404 | 400
- `GET /api/tasks/{id}/briefing` → 200 `application/json` | 404 | 400
