# MC Dashboard Mission 2 — Audit & Content Browsing

Add audit trail, findings/briefings browser, and requirements coverage to darlington.dev/mc.

Features:

1. Audit trail view — full event history (gate approvals, task creates, stage transitions)
2. Findings browser — read .mission/findings/\*.md per task, rendered as markdown
3. Briefings browser — read .mission/handoffs/\*-briefing.json per task
4. Requirements coverage — which tasks satisfy which requirements

Backend APIs already exist: /api/audit, /api/requirements, /api/requirements/coverage
Findings/briefings need new API endpoints or direct file serving.
