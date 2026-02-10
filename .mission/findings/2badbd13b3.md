# Summary

Goal definition and measurable success metrics for the MC Dashboard Visibility mission.

## Goal

Make the MC dashboard a reliable, real-time window into mission state — workers, gates, tokens, and bridge status — with no hardcoded data, no stale cache, and correct type mappings between backend and frontend.

## Success Metrics

### 1. Workers Panel — Real-Time with Correct Field Mapping

- **Metric**: Workers panel renders spawn/running/complete states matching backend `/api/workers` response
- **Acceptance**: Adapter maps `worker_id→id`, `status:"running"→"busy"`, `token_count→tokens`, `task_id→task`
- **Verify**: Spawn a worker → panel updates within 2s via WebSocket `worker.spawned` event; kill it → shows complete/offline

### 2. Gate Conditions Panel — Per-Stage Criteria with ✓/✗

- **Metric**: Gate panel displays all criteria for each stage from `/api/status` gates object
- **Acceptance**: Each criterion shows ✓ (met) or ✗ (unmet); approval notes and timestamps render when present
- **Verify**: Approve a gate → panel updates via WS `gate` topic; criteria status toggles visually

### 3. Token Usage Panel — Live Data from /api/tokens

- **Metric**: Token panel shows per-worker and total tokens sourced from `/api/tokens` endpoint
- **Acceptance**: No hardcoded values (burn rate 142/m removed); `total_cost_usd` mapped to frontend `total_cost`; budget fields (`budget_limit`, `budget_used`, `budget_remaining`) rendered
- **Verify**: Run a worker that consumes tokens → totals update via WS `token` topic

### 4. Bridge Status Indicator — Connected/Disconnected

- **Metric**: Header shows bridge connection status from `/api/openclaw/status`
- **Acceptance**: Green dot + "Connected" when bridge alive; red dot + "Disconnected" on failure; polls or uses WS for updates
- **Verify**: Stop bridge → indicator flips to disconnected within 10s

### 5. WebSocket Handlers — All Subscribed Topics Wired

- **Metric**: WS hook switch statement handles `audit`, `checkpoint`, `zone`, and `chat` topics (currently subscribed but unhandled)
- **Acceptance**: Each topic handler updates corresponding state slice; no console warnings for unhandled events
- **Verify**: Emit a test event on each topic → state updates without errors

### 6. Type Mismatches Fixed

- **Metric**: Zero runtime type errors between backend API responses and frontend TypeScript types
- **Acceptance**: `Worker` type aligned (`worker_id→id`, status enum includes `"running"`); `Token` type includes `total_cost_usd`→`total_cost` mapping; adapter layer or backend alignment in place
- **Verify**: `tsc --noEmit` passes; no `undefined` field renders in UI

### 7. Stale Cache Fix — Dashboard Refreshes on .mission Reinit

- **Metric**: When `.mission/` is reinitialised, dashboard discards old state and rehydrates
- **Acceptance**: WS `request_sync` triggered on reinit detection (via `stage` or `sync` event); no stale workers/tasks from prior mission shown
- **Verify**: Run `mc init` on existing project → dashboard clears and shows fresh state within 5s

## Dependencies

- Backend endpoints: `/api/workers`, `/api/tokens`, `/api/status`, `/api/openclaw/status` must be operational
- `/api/audit` currently 404 — needs backend implementation or gate this metric on availability
- WebSocket hub must broadcast on all subscribed topics

## Out of Scope

- Worker stdout/log streaming (`Worker.stdout` field)
- Trace view graph data (always null, derives from tasks)
- Chat panel improvements (uses separate OpenClaw gateway WS)
