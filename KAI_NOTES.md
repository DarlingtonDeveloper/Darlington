# KAI_NOTES.md — Darlington Project Summary

## What It Is

A **Personal OS** — a mobile-first life dashboard at **darlington.dev**. It's one person's (Mike's) integrated system for tracking habits, health, finances, calendar, Mandarin learning, and goals. The long-term vision is an AI Daily Planner ("Claude, what should I do next?") that draws cross-domain insights.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4, Linear-inspired design system (monochrome + emerald accent)
- **Backend/DB:** Supabase (auth, Postgres, RLS)
- **Auth:** Supabase Auth with Google OAuth (also captures Google Calendar tokens)
- **Hosting:** Vercel
- **External:** Google Calendar API, iOS Shortcuts webhooks
- **Dev:** `npm run dev` (port 3000), `npm run build`, `npm run lint`, pre-commit hooks

## Modules (Current)

| Module | Route | Status | Notes |
|--------|-------|--------|-------|
| **Habits** | `/habits` | v0.3 | ~30 daily habits, categories, analytics, check-ins, multi-step habits, health integration |
| **Health** | `/health/*` | Complete | 6 sub-pages: diet (signal toggles), sleep, steps, weight (trend chart), workouts (templates), screentime |
| **Finance** | `/finance` | MVP | 1,146 txns imported, regex auto-categorization, weekly summary, XLS import |
| **Calendar** | `/calendar` | Complete | Live Google Calendar fetch, week view, daily summaries synced to Supabase |
| **Hanzi** | `/hanzi` | Working | Mandarin character learning — link game, lessons, review, stats. 93 chars |
| **Goals** | `/goals` | Working | Weighted progress, overview/insights tabs |
| **Home** | `/` | Working | 3D Spline scene, portfolio pages at `/projects` and `/systems` |

## Key API Routes

```
POST /api/habits/complete          — Toggle habit completion
GET  /api/habits/list              — List habits
GET  /api/calendar/events          — Fetch Google Calendar events
POST /api/calendar/sync            — Sync daily summaries to Supabase
POST /api/health/webhook/morning   — Wake time (iOS Shortcut, first-call-wins)
POST /api/health/webhook/evening   — Bedtime + steps (last-call-wins)
POST /api/health/webhook/doomscroll — Screen time events
GET/POST /api/health/diet          — Diet signal entries
GET/POST /api/health/weight        — Weight entries
GET/POST /api/health/steps         — Step entries
GET/POST /api/health/workouts      — Workout logs + templates
GET/POST /api/health/settings      — Health targets
POST /api/checkin                  — Daily check-in (reflection/focus)
GET  /api/summary                  — Daily summaries
```

**Webhook auth:** `HEALTH_WEBHOOK_SECRET` header + `user_id` in payload (no per-user secrets).

## Key Database Tables

Habits: `habits`, `habit_completions`, `daily_summaries`, `daily_checkins`, `habit_steps`
Health: `sleep_entries`, `steps_entries`, `diet_entries`, `weight_entries`, `screen_time_events`, `workout_logs`, `workout_templates`, `health_settings`
Calendar: `user_oauth_tokens`, `calendar_daily_summaries`
Finance: transactions table with hash-based dedup, 100+ regex categorization rules in `app/finance/lib/categorize.ts`

## Contributor Notes

- **Mobile-first** — iPhone 16 Pro is primary target. 44px min touch targets, safe area padding (`pt-safe`, `pb-safe`).
- **Pattern:** Server component (page.tsx) fetches data → client component (*-client.tsx) handles interaction.
- **Standalone layouts:** Habits, Health, Calendar have their own layouts (hide site header/footer).
- **Env vars needed:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `HEALTH_WEBHOOK_SECRET`
- **Local dev gotcha:** OAuth redirects to prod, not localhost. Test auth flows on prod.
- **Post-push:** Check `vercel ls`, update PROJECT_STATUS.md on success.
- **No secrets in markdown** — reference env var names only.

## What's Planned (Not Built Yet)

1. **AI Daily Planner** (`/daily`) — conversational morning/evening check-ins with Claude, outputting to Google Calendar
2. **Relationships module** — contact tracking, WhatsApp MCP integration
3. **Career module** — GTD tasks, OKRs, interview pipeline
4. **Finance expansion** — budgeting, investing
5. **Learning tracker** — AI courses/papers, media queue
6. **Cross-domain insights** — pattern detection across all modules
