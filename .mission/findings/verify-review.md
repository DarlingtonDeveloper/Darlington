# Kai Chat UI — Code Review Findings

**Reviewer:** Code Review Worker  
**Date:** 2025-02-07  
**Branch:** feature/kai-chat  
**Verdict:** Mostly solid. A few real issues to fix before merge.

---

## 🔴 Issues (Should Fix)

### 1. API route has no error handling around `req.json()` or `fetch()`
**File:** `app/api/kai/chat/route.ts`  
If the gateway is down, `fetch()` will throw a `TypeError` (connection refused). This is uncaught — Next.js will return a generic 500 with no useful info. Similarly, malformed request bodies will crash.

```ts
// Current: no try/catch at all
const { messages } = await req.json()
const response = await fetch(...)
```

**Fix:** Wrap in try/catch, return a 502 with a JSON body for gateway errors, 400 for bad input.

### 2. No input validation on the API route
**File:** `app/api/kai/chat/route.ts`  
The `messages` array from the client is passed directly to the gateway with zero validation. A malicious or buggy client could send arbitrary roles (e.g. `system`), inject prompts, or send an empty array.

**Fix:** Validate that `messages` is a non-empty array, roles are only `user`|`assistant`, and content is a string. Consider adding a system prompt server-side.

### 3. Empty assistant message visible briefly before streaming starts
**File:** `app/kai/kai-client.tsx`  
The assistant message is appended to state immediately after the fetch succeeds but before any SSE data arrives. If the gateway is slow to start streaming, the user sees an empty bubble (no content, no typing indicator — `showTyping` only shows when `content === ''` but the bubble still renders).

Actually looking closer: `showTyping` checks `lastAssistant.content === ''`, so the typing indicator will show. But the empty `MessageBubble` is *also* rendered (since it's in the `messages` array). The bubble renders with empty content — an empty div with padding/background is visible alongside the typing indicator.

**Fix:** Either skip rendering bubbles with empty content in `MessageList`, or don't add the assistant message to state until the first chunk arrives.

### 4. `res.body!` non-null assertion
**File:** `app/kai/kai-client.tsx`, line ~46  
`res.body` can be `null` if the response has no body. The `!` assertion skips this check.

**Fix:** Guard with `if (!res.body) throw new Error('No response body')`.

### 5. Abort controller is never cleaned up / stop button missing
**File:** `app/kai/kai-client.tsx`  
`abortRef` is set but there's no UI to cancel a streaming response, and no cleanup on unmount. If the user navigates away mid-stream, the request continues in the background.

**Fix:** Add `useEffect` cleanup that calls `abortRef.current?.abort()` on unmount. Consider a stop button in the UI.

---

## 🟡 Concerns (Should Consider)

### 6. No request timeout
**File:** `app/api/kai/chat/route.ts`  
If the gateway hangs, the request will hang indefinitely (until Vercel's 60s function timeout on hobby, 300s on pro). No `AbortSignal.timeout()` or similar.

### 7. SSE buffer may miss final chunk
**File:** `app/kai/kai-client.tsx`  
After the `while` loop exits (`done === true`), whatever is left in `buffer` is discarded. If the final SSE line doesn't end with `\n`, it's lost.

**Fix:** Process `buffer` after the loop exits.

### 8. No markdown rendering for assistant messages
**File:** `components/kai/message-bubble.tsx`  
Assistant responses will likely contain markdown (code blocks, lists, bold). Currently rendered as plain text with `whitespace-pre-wrap`. This will look rough for anything beyond simple text.

### 9. Accessibility gaps
- **KaiNav:** Back link has no `aria-label` (just an icon, no text)
- **ChatInput:** Send button has no `aria-label`  
- **TypingIndicator:** No `aria-live` region or screen reader text
- **MessageBubble:** No `role` attribute for chat semantics

### 10. `sm:max-w-2xl sm:mx-auto` repeated in 3 places
Layout applies it, MessageList applies it internally, ChatInput applies it. The layout constraint should be in one place (layout or KaiClient), not duplicated.

---

## ✅ Good

- **Pattern consistency:** Layout structure matches habits/health (fixed inset, sticky nav, pt-safe/pb-safe). Good.
- **Server page + client component split:** Correct pattern per CLAUDE.md (NR1).
- **Touch targets:** Send button has `min-w-[44px] min-h-[44px]` ✓
- **Streaming implementation:** SSE parsing logic is correct for the happy path. `TextDecoder` with `{ stream: true }` is right.
- **Mobile layout:** `flex-col h-full` with overflow on message list, fixed input at bottom — standard chat pattern, should work.
- **Dark theme + emerald accents:** Consistent with site design (NR2) ✓
- **No auth required:** Matches NR3 ✓
- **Abort controller for cancellation support:** Good foundation even if UI is missing.
- **`force-dynamic`** on page — correct since it's a chat UI.

---

## Summary

The main risks are: **unhandled API route errors** (#1), **no input validation** (#2), and the **empty bubble flash** (#3). These should be fixed before merge. The rest are improvements worth doing but not blockers.
