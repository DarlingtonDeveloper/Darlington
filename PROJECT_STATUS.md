# Personal OS - Project Status

**Last Updated:** Jan 13, 2026
**Current Status:** Habits OS v0.2 stable, Finance OS MVP live, Calendar OS Phase 2 complete, Auth complete

---

## Completed

### Authentication
- Supabase Auth integrated
- Login/Signup pages with Google OAuth
- Middleware protecting routes (`/habits`, `/finance`, `/hanzi`, `/goals`, `/systems`, `/projects`, `/calendar`)
- Auth callback handling with Google token capture
- Session management with cookie refresh
- Google Calendar scope in OAuth flow

### Habits OS v0.2
- 30 habits with categories (morning, anytime, productivity, social, evening)
- Mobile-first Linear-inspired UI
- Daily completion tracking with timestamps
- Progress bar and completion percentage
- Energy level selector
- Daily summary notes
- Partial completions (percentage-based tracking)
- Habit notes (optional notes on completions)
- Daily check-in flow (reflection, focus selection, intention)
- What's Next button (smart habit suggestion)
- Multi-step habits (Yoga with 8 steps)
- Goals table with weighted progress tracking
- Analytics dashboard (Overview, Habits, Goals, Insights tabs)
- Notion data migrated to Supabase

### Finance OS MVP
- 1,146 transactions imported (Jun 2025 - Jan 2026)
- 99.9% automatic categorization (100+ regex rules)
- Weekly summary view (total spent, trends, category breakdown)
- Top merchants display
- Daily spending breakdown
- XLS upload and import (Santander current + credit card)
- Hash-based deduplication for imports
- Manual categorization popup for uncategorized items
- Multi-currency support (7 countries)

### Calendar OS (NEW - Jan 13, 2026)
- Google Calendar API integration (hybrid approach)
- Live fetch from Google for display (always fresh)
- Summary sync to Supabase for analytics
- Today view with timeline, events, free time blocks
- Week view with day summaries and busy bars
- Auto-sync on page load (if stale >1 hour)
- Manual sync button
- Token refresh handling
- Calendar link in user dropdown menu

**Key files:**
- `app/calendar/` - Today view
- `app/calendar/week/` - Week view
- `app/api/calendar/events/` - Live fetch from Google
- `app/api/calendar/sync/` - Sync summaries to Supabase
- `lib/google-calendar.ts` - Token management & API helpers

**Database tables:** `user_oauth_tokens`, `calendar_daily_summaries`

### Hanzi Linker
- Link game mode (English -> Pinyin -> Hanzi chains)
- 93 characters seeded (Duolingo Section 1, 8 units)
- Progression/unlock logic
- Adaptive scoring system
- Lesson mode for flashcard learning

### Infrastructure
- GitHub repo connected
- Vercel deployment configured
- Pre-commit hooks (lint + build)
- TypeScript strict mode
- ESLint passing

---

## Potential Next Steps

### Calendar OS Phase 4
- [ ] Cross-domain queries (calendar + habits + finance)
- [ ] Insights UI showing correlations:
  - Do busy days hurt habit completion?
  - Spending patterns vs meeting load
  - Best days for deep work

### New Personal OS Modules
- [ ] Tasks/Projects (one-off items vs recurring habits)
- [ ] Health Dashboard (Apple Watch data aggregation)
- [ ] Social/Contacts CRM
- [ ] Reading/Learning tracker

### Cross-Domain Features
- [ ] AI Daily Scheduler ("Claude, what should I do next?")
- [ ] Context Engine (unified cross-domain awareness)
- [ ] Unified insights dashboard

### Enhancements
- [ ] Hanzi Linker audio (listening/speaking challenges)
- [ ] Apple Watch integration (sleep, steps via Shortcuts -> Webhook)
- [ ] Goals feature expansion

---

## Technical Debt

### Resolved
- ~~GitHub MCP / File Editing~~ -> Using Claude Code CLI
- ~~Supabase MCP~~ -> Using dashboard + Claude Code
- ~~Authentication~~ -> Supabase Auth implemented
- ~~Hardcoded user_id~~ -> Auth user in middleware
- ~~Time/Calendar integration~~ -> Calendar OS implemented

### Remaining
- MCP connectors still flaky (Supabase, GitHub OAuth)
- Local dev OAuth redirect issue (redirects to prod) - workaround: test on prod

---

## Key Data

### Habits
- 30 daily habits tracked
- ~75% average completion rate
- 10 habits at 100% consistency

### Finance
- £28,328 total spending tracked (7 months)
- £147.54 average daily (inflated by Asia travel)
- 91% reduction in gaming spend (£492 -> £45/mo)
- 67% travel-related, 33% UK baseline

### Calendar
- Live Google Calendar integration
- 37 days of summaries synced (30 past + 7 future)
- Free time and meeting hours tracked

### Hanzi
- 93 characters available
- 8 units of progression

---

## Vision

**North Star:** "Claude, what should I do next?"

An AI Daily Scheduler with full context across:
- Habits (what I should do daily)
- Finance (spending patterns, budget awareness)
- Calendar (what's scheduled) - NOW INTEGRATED
- Goals (what I'm working toward)
- Energy/Health (current capacity)
- Learning (Mandarin progress)

**Core Insight:** Value comes from cross-domain patterns, not individual app sophistication.

---

## Technical Reference

**Production URL:** darlington.dev
**Supabase Project:** vufdabwdnpmxmgugzric

**Protected Routes:**
- `/habits` - Habit tracking
- `/finance` - Finance dashboard
- `/calendar` - Calendar OS (Google Calendar)
- `/hanzi` - Mandarin learning
- `/goals` - Goal tracking

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Stack:** Next.js 15, React 19, Tailwind CSS 4, Supabase, TypeScript
