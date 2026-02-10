# Summary

Integrated all 5 developer-created components into the MC Dashboard.

## Changes Made

### components/mc/mission-view.tsx

- Added imports for `WorkerPanel`, `GateConditionsPanel`, `TokenUsagePanel`
- Extended `MissionViewProps` with `gates`, `tokens`, `currentStage`
- Added all three panels to the left column below the existing zone groups

### app/mc/mc-client.tsx

- Added `BridgeStatusIndicator` import and placed it in header area above `DashboardHeader`
- Passed `gates`, `tokens`, `currentStage` props to `MissionView`
- `BridgeStatusIndicator` receives `MC_API_URL` as `baseUrl`

### Lint/Type Fixes

- **gate-conditions-panel.tsx**: Fixed ternary-as-statement lint error (replaced with if/else)
- **use-mc-websocket.ts**: Removed unused `Worker` and `GateCriteria` imports
- **activity-view.tsx**: Fixed pre-existing type error — `GateCriterion` rendered as ReactNode, changed to `.description`

## Build Status

- ✅ Compilation successful
- ✅ Linting passed (only pre-existing warning in hanzi module)
- ✅ Type checking passed
- ⚠️ Page data collection fails for `/api/health/webhook/evening` due to missing `supabaseUrl` env var (pre-existing, unrelated)
