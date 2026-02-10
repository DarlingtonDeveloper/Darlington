# MC Dashboard Mission 3B — Checkpoints, Zones, Projects & Stage Override

Add checkpoint browsing, zone visualization, project management, and stage override UI to darlington.dev/mc.

Features:

1. **Checkpoint viewer** — browse .mission/checkpoints/\*.json, show state snapshots with diffs between checkpoints
2. **Zone visualization** — display task zones/groups in the trace view, color-coded grouping
3. **Project switcher** — support multiple MC projects, switch between them in the dashboard
4. **Stage override UI** — allow manual stage advancement/rollback from the dashboard (with confirmation + audit)

Backend: MissionControl orchestrator (Go) already serves WebSocket + REST. May need new API endpoints.
Frontend: Next.js dashboard at app/mc/, components at components/mc/.
