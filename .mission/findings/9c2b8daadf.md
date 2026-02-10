# Summary

Fixed route mounting in `orchestrator/serve/serve.go` and updated API interfaces in `orchestrator/api/routes.go`.

## Changes

### serve.go

- **Replaced 8 inline handlers** (`/api/health`, `/api/status`, `/api/tokens`, `/api/workers`, `/api/requirements`, `/api/requirements/coverage`, `/api/specs`, `/api/specs/orphans`) with `api.NewServer()` + `mux.Handle("/api/", apiRoutes)`
- **Added audit to `buildState()`**: reads `.mission/audit.jsonl` via `readJSONL()` and includes as `audit` key in state snapshot, enabling WebSocket initial sync of audit data
- **Removed local `writeJSON` helper** (duplicated `api.writeJSON`); inlined JSON responses for the two remaining fallback OpenClaw handlers
- **Preserved**: `/ws` WebSocket handler, OpenClaw bridge routes (conditionally registered on outer mux, take precedence over api.Server catch-all)

### routes.go

- **Fixed interface definitions**: `TrackerReader` and `TokenReader` interfaces now use concrete return types (`[]*tracker.TrackedProcess`, `*tracker.TrackedProcess`, `tokens.TokenSummary`) instead of `interface{}`, matching the actual `tracker.Tracker` and `tokens.Accumulator` implementations
- Added imports for `tracker` and `tokens` packages

## Verification

- `go build ./...` passes with no errors
