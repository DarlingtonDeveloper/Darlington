# Personal OS - Project Status

**Last Updated:** Jan 13, 2026
**Current Status:** Habits OS v0.3 (Health integration), Finance OS MVP live, Calendar OS complete, Health OS complete with iOS Shortcuts, Auth complete

For full roadmap and system architecture, see **VISION.md**.

---

## Completed

### Authentication
- Supabase Auth integrated
- Login/Signup pages with Google OAuth
- Middleware protecting routes (`/habits`, `/finance`, `/hanzi`, `/goals`, `/systems`, `/projects`, `/calendar`)
- Auth callback handling with Google token capture
- Session management with cookie refresh
- Google Calendar scope in OAuth flow

### Habits OS v0.3
- ~22 active habits with categories (morning, anytime, productivity, social, evening)
- Mobile-first Linear-inspired UI (Precision & Density design system)
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
- Health Today section with 5 auto-tracked metrics
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

### Calendar OS
- Google Calendar API integration (hybrid approach)
- Live fetch from Google for display (always fresh)
- Summary sync to Supabase for analytics
- Today view with timeline, events, free time blocks
- Week view with day summaries and busy bars
- Auto-sync on page load (if stale >1 hour)
- Manual sync button
- Token refresh handling

### Health OS
- 8 database tables (sleep, steps, diet, weight, screentime, workouts, templates, settings)
- iOS Shortcuts webhooks (global secret + user_id authentication):
  - `/api/health/webhook/morning` - wake_time (first call wins)
  - `/api/health/webhook/evening` - bedtime (server timestamp, last call wins) + steps
  - `/api/health/webhook/doomscroll` - app lock events (10 min threshold)
- Dashboard with 6 metric cards
- Diet: 10 signal toggles (tap=0↔100, double-tap=custom value)
- Weight: Manual entry with 7-day trend chart
- Sleep: Consistency scoring (60% wake time, 40% duration)
- Steps: Progress ring with streak counter, manual fallback
- Screen Time: Doomscroll events by app with daily/weekly trends
- Workouts: Template-based logging with exercise checklists (Daily Workout template)
- Settings: Targets (wake_target_time, bedtime_target, steps_target, sleep_duration)

### Habits + Health Integration
- Health Today section at top of /habits page showing 5 metrics:
  - Wake time, Steps, Bedtime (with target progress)
  - Diet check-in, Workout (action cards linking to /health/*)
- Health-linked habits auto-complete based on Health OS data
- Habits deactivated (tracked in Health OS): 15 min planning, No alcohol, 2L water, No masturbating, Mindful meal, Press-ups, Knee mobility, Yoga, Physical activity
- habits.health_link column links habits to health data sources

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

## Next Steps

Aligned with VISION.md phases:

### Phase 1: Foundation
- [x] **Health module** ✓ Complete
  - [x] Weight tracking (daily weigh-in)
  - [x] Diet signals (10 toggles: no alcohol, no snacking, protein, etc.)
  - [x] iOS Shortcuts webhooks (sleep, steps, screen time)
  - [x] Workout logging with templates
  - [x] Health Today section in Habits OS with auto-tracked metrics
- [ ] **Career module**
  - [ ] Tasks inbox (GTD-style capture)
  - [ ] Objectives (quarterly goals)
- [ ] **Relationships module**
  - [ ] WhatsApp MCP setup (Go bridge + Python server)
  - [ ] Contact list (family, friends, professional)
  - [ ] Last contact tracking (auto-populated from WhatsApp)
  - [ ] "Who haven't I talked to?" surfacing
  - [ ] Consolidate messaging (Instagram DMs, SMS → WhatsApp)

### Phase 2: AI Daily Planner MVP
- [ ] Custom chat UI at `/daily`
- [ ] Morning check-in (intention-setting, ~15 min)
- [ ] Evening check-in (reflection, ~15 min)
- [ ] Pre-loaded context from all modules
- [ ] Calendar output (intentions → Google Calendar events)
- [ ] Session storage in Supabase

### Phase 3: Expansion
- [ ] **Finance expansion**
  - [ ] Budgeting (category targets vs actuals)
  - [ ] Investing (activate seeded data, portfolio view)
- [ ] **Growth & Learning**
  - [ ] AI Learning tracker (courses, papers, projects)
  - [ ] Books (reading list, notes)
  - [ ] Media queue (intentional podcasts/YouTube)
- [ ] **Health expansion**
  - [ ] Strava integration (cardio sync)
  - [ ] Workout logging (bodyweight sessions)

### Phase 4: Intelligence
- [ ] Cross-domain insights dashboard
- [ ] Pattern detection (busy days vs habit completion, spending vs stress)
- [ ] Predictive suggestions

---

## Technical Debt

### Resolved
- ~~GitHub MCP / File Editing~~ → Using Claude Code CLI
- ~~Supabase MCP~~ → Using dashboard + Claude Code
- ~~Authentication~~ → Supabase Auth implemented
- ~~Hardcoded user_id~~ → Auth user in middleware
- ~~Time/Calendar integration~~ → Calendar OS implemented

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
- 91% reduction in gaming spend (£492 → £45/mo)
- 67% travel-related, 33% UK baseline

### Calendar
- Live Google Calendar integration
- 37 days of summaries synced (30 past + 7 future)
- Free time and meeting hours tracked

### Hanzi
- 93 characters available
- 8 units of progression

---

## Goals (6-Month)

1. Deeper social networks
2. Conversational Mandarin proficiency
3. Improved sleep patterns
4. Career transitions
5. Lose weight / improve metabolic fitness
6. Learning AI

---

## Technical Reference

**Production URL:** darlington.dev
**Supabase Project:** vufdabwdnpmxmgugzric

**Protected Routes:**
- `/habits` - Habit tracking
- `/finance` - Finance dashboard
- `/calendar` - Calendar OS (Google Calendar)
- `/health` - Health OS (sleep, diet, weight, workouts)
- `/hanzi` - Mandarin learning
- `/goals` - Goal tracking

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `HEALTH_WEBHOOK_SECRET` (for iOS Shortcuts)

**Stack:** Next.js 15, React 19, Tailwind CSS 4, Supabase, TypeScript

---

## Documentation

| File | Purpose |
|------|---------|
| `VISION.md` | Strategic roadmap, system architecture, module specs |
| `PROJECT_STATUS.md` | Operational tracking (this file) |
| `CLAUDE.md` | Dev guidance for Claude Code |
| ~~`FEATURES.md`~~ | Deprecated - absorbed into VISION.md |