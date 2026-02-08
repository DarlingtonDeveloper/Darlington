# Auth Implementation Findings

## Research

### Existing auth patterns
- **API routes** (`/api/habits/list`, etc.) use `checkApiAuth()` from `lib/api-utils.ts` — this checks an `X-Summary-Secret` header + `user_id` query param. This is for **server-to-server** calls (webhooks, cron), not browser sessions.
- **Middleware** (`middleware.ts`) handles page-level auth via `PROTECTED_ROUTES` array — redirects unauthenticated users to `/login`. API routes are explicitly skipped (`pathname.startsWith('/api/')`).
- **Supabase server client** (`lib/supabase/server.ts`) uses `@supabase/ssr` with cookie-based sessions — the right choice for browser-facing API routes.

### Key insight
The Kai chat API is called from the browser (not server-to-server), so it needs **cookie-based Supabase session auth**, not the shared-secret pattern used by other API routes.

## Changes Made

### 1. `/app/api/kai/chat/route.ts`
- Added `createClient()` from `lib/supabase/server` to check the user's session cookie
- Returns 401 if no valid session
- Passes `user.id` to the gateway instead of hardcoded `'darlington-web'`

### 2. `/middleware.ts`
- Added `/kai` to `PROTECTED_ROUTES` — unauthenticated users hitting `/kai` are redirected to `/login?redirect=/kai`

## Commit
`feat: Add Supabase auth to Kai chat API` on branch `feature/kai-chat` (86f122b)
