# Summary

Fixed all 5 verify issues from findings a18c1cb9ad, 021c9af423, and c18fc6bd10.

## MissionControl fixes (orchestrator/api/)

1. **handlers.go — handleStatus now includes stage**: Reads `.mission/state/stage.json` with fallback to last entry of `stages.jsonl`. Returns `null` if neither exists.

2. **routes_test.go — mock tracker fixed**: `mockTracker.List()` now returns `[]*tracker.TrackedProcess` and `Get()` returns `(*tracker.TrackedProcess, bool)`, matching the `TrackerReader` interface.

3. **handlers.go — handleTaskBriefing JSON validation**: Added `json.Valid(data)` check before serving raw bytes. Returns 500 with error message if file contains invalid JSON.

## Darlington fixes (components/mc/)

4. **findings-view.tsx — AbortController**: Added `AbortController` to the `useEffect` fetch calls with cleanup on unmount/re-render. Suppresses `AbortError` exceptions and skips state updates on aborted signals.

5. **findings-view.tsx — urlTransform**: Added `urlTransform` prop to `ReactMarkdown` that blocks `javascript:` URIs by returning empty string.

## Verification

- `go test ./...` — all packages pass
- `npx tsc --noEmit` — no type errors
