# MC Dashboard Visibility — Mission 1

Make the MC dashboard show what's happening in real-time during a mission run.

Features:

1. Worker lifecycle — spawn/running/complete visible on mission view
2. Gate conditions — per-stage criteria with satisfied/unsatisfied status + approval notes
3. Token usage — per-worker and total token/cost display
4. OpenClaw bridge status — connection indicator
5. Stale cache fix — buildState/watcher refresh after .mission reinit

Target: darlington.dev/mc
Backend APIs already exist — this is purely frontend work.
