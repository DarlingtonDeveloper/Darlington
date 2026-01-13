# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build (run before pushing)
npm run lint     # ESLint check
```

## Architecture

**Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4, Supabase, TypeScript

### Routes

- `/` - Home (3D Spline scene)
- `/projects` - Portfolio gallery with carousel
- `/systems` - Interactive portfolio grid
- `/habits` - Habit tracker (standalone layout, no header/footer)
- `/finance` - Finance OS with weekly spending summary
- `/calendar` - Calendar OS with Google Calendar integration (standalone layout)
- `/calendar/week` - Week view with day summaries
- `/hanzi` - Chinese character learning app

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

### Environment Variables

Required in `.env.local` and Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (for Calendar API)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

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
