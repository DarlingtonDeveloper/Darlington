# Kai Chat UI — Fix Report

**Date:** 2026-02-07  
**Branch:** feature/kai-chat  
**Status:** All required fixes applied, restyle complete

---

## Fixes Applied

### 1. API route error handling (review #1, security #1)
**File:** `app/api/kai/chat/route.ts`
- Wrapped `req.json()` in try/catch → returns 400 on malformed JSON
- Wrapped `fetch()` in try/catch → returns 502 on gateway connection failure
- Added `AbortSignal.timeout(60_000)` for gateway request timeout (review #6)
- Added null check on `response.body` before streaming

### 2. Input validation (review #2, security #1, security #8)
**File:** `app/api/kai/chat/route.ts`
- Added `validateMessages()` function: checks array, non-empty, max 50 messages
- Rejects `system` role — only `user` and `assistant` allowed
- Enforces max 10,000 chars per message content
- Validates content is string, role is valid enum
- Returns 400 with descriptive error on validation failure

### 3. Empty assistant bubble fix (review #3)
**File:** `app/kai/kai-client.tsx`
- Assistant message is no longer added to state before streaming starts
- Message is added only when the first content chunk arrives (`assistantAdded` flag)
- No more empty bubble flash

### 4. `res.body!` non-null assertion removed (review #4)
**File:** `app/kai/kai-client.tsx`
- Added proper null check: `if (!res.body) throw new Error('No response body')`

### 5. AbortController cleanup on unmount (review #5)
**File:** `app/kai/kai-client.tsx`
- Added `useEffect` cleanup that calls `abortRef.current?.abort()` on unmount

### 6. Remaining SSE buffer processing (review #7)
**File:** `app/kai/kai-client.tsx`
- After the read loop, remaining `buffer` content is now processed via `processLines()`

### 7. Accessibility improvements (review #9)
- **kai-nav.tsx:** Back link has `aria-label="Back to home"`
- **chat-input.tsx:** Send button has `aria-label="Send message"`, textarea has `aria-label="Message input"`
- **typing-indicator.tsx:** Container has `role="status"` and `aria-label="Kai is typing"`
- **message-list.tsx:** Message container has `role="list"` and `aria-label="Chat messages"`
- **message-bubble.tsx:** Each bubble has `role="listitem"`

### 8. Duplicate max-width constraint removed (review #10)
- Removed `sm:max-w-2xl sm:mx-auto` from MessageList and ChatInput
- Single `max-w-2xl mx-auto` in KaiClient controls the width constraint

---

## Restyle: Main Site Theme

All components restyled from dashboard-app dark theme (hardcoded Tailwind `bg-neutral-*`, `text-neutral-*`, `bg-emerald-*`) to main Compass site palette using CSS variables.

### Color changes across all files:
| Old (Tailwind) | New (CSS var) |
|---|---|
| `bg-neutral-950` | `var(--bg, #07070e)` |
| `text-neutral-100` / `text-neutral-50` | `var(--fg, #e8e4df)` |
| `text-neutral-400` / `text-neutral-500` | `var(--fg2, #6b6560)` |
| `bg-emerald-600` | `var(--accent, #c4b5a0)` |
| `bg-neutral-800` / `bg-neutral-900` | `oklch(1 0 0 / 6%)` (subtle white overlay) |
| `border-neutral-800` | `oklch(1 0 0 / 8%)` |
| `text-red-400` (error) | `var(--accent2, #a89880)` |

### Typography:
- KaiNav title uses `font-display` class (Cormorant Garamond)
- Empty state heading uses `font-display` class
- Input uses `var(--font-sans)` (DM Sans)

### Layout:
- Layout stays at `app/kai/` (NOT in `(apps)` route group) ✓
- Border moved from KaiNav to layout wrapper for cleaner separation
- User bubbles: warm accent background with dark text (matches site gold/warm palette)
- Assistant bubbles: subtle glass-like overlay (not opaque neutral-800)

---

## Not Fixed (Noted, out of scope)

- **Rate limiting** (security #2) — infrastructure concern, not a code fix
- **Authentication** (security #3) — intentionally public per NR3 spec
- **Markdown rendering** (review #8) — separate feature, not a bug fix
