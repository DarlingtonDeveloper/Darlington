# Darlington

**Personal OS** — a unified operating system for life, built with Next.js 15 and deployed on Vercel.

[darlington.dev](https://darlington.dev)

---

## What is this?

Darlington is a full-stack personal productivity platform that consolidates habits, health, finance, calendar, language learning, task management, and AI chat into a single authenticated app. Every module shares one database, one auth system, and one design language — so cross-domain insights (like how sleep affects habit completion) emerge naturally.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Database & Auth:** Supabase (Postgres + Row Level Security + OAuth)
- **Styling:** Tailwind CSS 4, shadcn/ui, Framer Motion
- **Deployment:** Vercel (Analytics + Speed Insights)
- **Integrations:** Google Calendar API, GitHub Events API, iOS Shortcuts webhooks
- **Testing:** Vitest + React Testing Library, Playwright E2E
- **CI/CD:** GitHub Actions, Husky + lint-staged

## Modules

### Habits

30+ daily habits across 5 categories (morning, productivity, social, evening, anytime). Multi-step habits, partial completions with notes, daily check-in flow, and an analytics dashboard with completion trends. Integrates with Health OS — health-linked habits auto-complete when data arrives.

### Health

Six tracked metrics: sleep, steps, weight, diet signals, workouts, and screen time. iOS Shortcuts fire webhooks to `/api/health/webhook/*` for automated data capture (wake time, bedtime, steps, doomscroll events). Trend charts and consistency scoring.

### Finance

1,100+ imported transactions with 99.9% automatic categorisation via 100+ regex rules. Weekly summaries, category breakdowns, top merchants, daily spending. XLS import with hash-based deduplication. Multi-currency support.

### Calendar

Google Calendar API integration with a hybrid fetch + Supabase cache model. Today view with timeline and free-time blocks. Week view with day summaries and busy bars. Auto-sync when data is stale, live fetch for always-fresh events.

### Hanzi Linker

Mandarin character learning app. Link game mode (English -> Pinyin -> Hanzi chains), 93 characters seeded from Duolingo Section 1, adaptive scoring, flashcard review, progression/unlock system with stats tracking.

### Kai

AI chat assistant with cross-domain context. Message history and contextual suggestions.

### Task Swiper

Tinder-style swipe interface for backlog prioritisation. Touch + mouse drag, 3-deep card stack with scale offsets, keyboard shortcuts, and a summary screen.

### Ship Log

Live GitHub activity feed pulling from multiple accounts (DarlingtonDeveloper + MikeSquared-Agency). Real-time commit tracking with colour-coded entries by org.

### Swarm

Fleet monitoring dashboard for the MikeSquared-Agency agent orchestrator. WebSocket-driven real-time updates, worker fleet overview, service health, and mission tracing across Warren, Dispatch, Chronicle, PromptForge, and Alexandria.

### Goals

Weighted goal tracking with progress metrics and completion percentages.

## Design

Precision & Density aesthetic inspired by Linear. Dark theme (`#07070e`), custom typography (Cormorant Garamond display, DM Sans body, JetBrains Mono data), monochrome palette with emerald accent. Mobile-first with 44px touch targets and safe area support for iOS.

## Development

```bash
npm run dev       # Development server on localhost:3000
npm run build     # Production build
npm run lint      # ESLint
npm test          # Vitest unit tests
npm run test:e2e  # Playwright E2E (needs dev server)
```

Requires `.env.local` with Supabase credentials, Google OAuth client ID/secret, and health webhook secret. See `CLAUDE.md` for full environment variable reference.
