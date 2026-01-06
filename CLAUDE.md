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

**Database tables:** `habits`, `habit_completions`, `daily_summaries`
**User ID:** Hardcoded in RLS policies (no auth yet)

### Environment Variables

Required in `.env.local` and Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

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
