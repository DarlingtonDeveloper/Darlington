# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build (run before pushing)
npm run lint     # ESLint check
npm test         # Unit tests (vitest)
npm run test:e2e # E2E tests (playwright, needs dev server running)
```

## Architecture

**Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4, Supabase, TypeScript

### Routes

- `/` - Home (3D Spline scene)
- `/projects` - Portfolio gallery with carousel
- `/systems` - Interactive portfolio grid
- `/habits` - Habit tracker with Health Today section (standalone layout)
- `/finance` - Finance OS with weekly spending summary
- `/calendar` - Calendar OS with Google Calendar integration (standalone layout)
- `/calendar/week` - Week view with day summaries
- `/health` - Health OS dashboard (standalone layout)
- `/health/diet` - Diet signal toggles
- `/health/sleep` - Sleep tracking
- `/health/steps` - Step tracking
- `/health/weight` - Weight tracking with trend chart
- `/health/workouts` - Workout logging with templates
- `/health/screentime` - Doomscroll events
- `/health/settings` - Health targets and webhook config
- `/hanzi` - Chinese character learning app
- `/swarm` - Fleet monitoring dashboard (MissionControl + Swarm BFF)

### Key Directories

- `app/` - Next.js App Router pages and layouts
- `components/` - Feature components (header, footer, gallery, portfolio-grid)
- `components/ui/` - Reusable UI primitives (button, card, tabs, glowing-effect, etc.)
- `lib/` - Utilities and Supabase client

### Habits System

The `/habits` route is a personal habit tracking app using Supabase:

- `app/habits/page.tsx` - Server component, fetches habits from Supabase
- `app/habits/habits-client.tsx` - Client component with toggle/save interactions
- `app/habits/layout.tsx` - Standalone full-screen layout (hides site header/footer)

**Database tables:** `habits`, `habit_completions`, `daily_summaries`, `daily_checkins`, `habit_steps`

### Calendar System

The `/calendar` route integrates with Google Calendar API (hybrid approach):

- **Live fetch**: Events displayed are fetched directly from Google Calendar API
- **Summary sync**: Daily summaries synced to Supabase for cross-domain analytics

**Key files:**

- `app/calendar/page.tsx` - Server component
- `app/calendar/calendar-client.tsx` - Today view with timeline, free time blocks
- `app/calendar/week/` - Week view with day summaries
- `app/api/calendar/events/route.ts` - Fetches events from Google Calendar
- `app/api/calendar/sync/route.ts` - Syncs daily summaries to Supabase
- `lib/google-calendar.ts` - Token management and API helpers

**Database tables:** `user_oauth_tokens`, `calendar_daily_summaries`

**Google OAuth flow:**

- Calendar scope added to login/signup OAuth requests
- Tokens captured in `/auth/callback` and stored in `user_oauth_tokens`
- Token refresh handled automatically in `lib/google-calendar.ts`

### Health System

The `/health` route tracks health metrics with iOS Shortcuts automation:

- `app/health/page.tsx` - Server component, dashboard with 6 metric cards
- `app/health/layout.tsx` - Standalone full-screen layout
- `components/habits/health-today.tsx` - Health metrics in habits page

**Webhook endpoints (iOS Shortcuts integration):**

- `app/api/health/webhook/morning/route.ts` - wake_time (first call wins)
- `app/api/health/webhook/evening/route.ts` - bedtime + steps (last call wins)
- `app/api/health/webhook/doomscroll/route.ts` - app lock events

**Authentication:** Global `HEALTH_WEBHOOK_SECRET` + `user_id` in payload (no per-user secrets)

**Database tables:** `sleep_entries`, `steps_entries`, `diet_entries`, `weight_entries`, `screen_time_events`, `workout_logs`, `workout_templates`, `health_settings`

**Habits integration:**

- `habits.health_link` column links habits to health data ('wake_time', 'steps', 'bedtime')
- Health-linked habits auto-complete based on health data
- HealthToday component shows 5 metrics at top of habits page

### Swarm / MissionControl System

The `/swarm` route is the fleet monitoring dashboard for the OpenClaw orchestrator:

- `app/swarm/page.tsx` - Server component
- `app/swarm/mc-client.tsx` - Client component with WebSocket state, view routing, swarm polling
- `app/swarm/layout.tsx` - Standalone layout
- `components/mc/` - All MC/Swarm UI components (dashboard-header, mission-view, swarm-view, etc.)
- `lib/mc/types.ts` - MC + Swarm type definitions
- `lib/mc/constants.ts` - `MC_API_URL`, `MC_WS_URL` from env vars

**Swarm BFF:** Fetches fleet-wide status from `MC_API_URL/api/swarm/overview` (Warren, Chronicle, Dispatch, PromptForge, Alexandria). Polled every 30s when the Swarm tab is active.

**Views:** Mission, Trace, Activity, Specs, Swarm (5 tabs)

### Testing

- **Unit tests:** `__tests__/` — Vitest + React Testing Library (`vitest.config.ts`)
- **E2E tests:** `e2e/` — Playwright with Chromium (`playwright.config.ts`)
- Setup: `vitest.setup.ts` configures jest-dom matchers and cleanup

### Environment Variables

Required in `.env.local` and Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (for Calendar API)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `HEALTH_WEBHOOK_SECRET` - Global secret for iOS Shortcuts webhooks
- `NEXT_PUBLIC_MC_API_URL` - MC orchestrator API URL (default: https://mc.darlington.dev)
- `NEXT_PUBLIC_MC_WS_URL` - MC orchestrator WebSocket URL
- `NEXT_PUBLIC_MC_TOKEN` - MC orchestrator auth token

## Conventions

- Mobile-first responsive design (iPhone 16 Pro primary target)
- 44px minimum touch targets for iOS
- Safe area support (`pt-safe`, `pb-safe`) for notch/home indicator
- Monospace (`font-mono tabular-nums`) for data display (timestamps, counts)
- Design system: Precision & Density (Linear-inspired), monochrome with emerald accent

## Security Rules

- NEVER put API keys, tokens, passwords, or user IDs in markdown files
- Reference secrets via environment variable names only (e.g., "set SUPABASE_KEY")
- Keep sensitive IDs in .env, not documentation

## Post-Push Workflow

After every `git push`:

1. Check deployment status with `vercel ls`
2. If deployment **succeeds**:
   - Update `/todos` to mark completed items
   - Move completed items in `Project_status.md` from "Next Steps" to "Completed"
3. If deployment **fails**:
   - Check Vercel logs to identify the issue
   - Attempt to fix the problem
   - Re-push and verify
   - If fix fails, notify the user with the error details
