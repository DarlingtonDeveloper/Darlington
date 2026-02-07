# Security Review: Kai Chat UI

**Reviewer:** Security Worker (MissionControl)
**Date:** 2026-02-07
**Branch:** feature/kai-chat
**Files:** `app/api/kai/chat/route.ts`, `app/kai/kai-client.tsx`

---

## Summary

Overall the implementation is **reasonable** for an internal tool. The gateway token is server-side only, and the client doesn't use `dangerouslySetInnerHTML`. There are a few issues worth addressing.

---

## Findings

### 1. No input validation on API route — messages array passed straight through
**Severity: HIGH**

`route.ts` does `const { messages } = await req.json()` and forwards the entire array to the gateway with no validation. An attacker (or buggy client) can:
- Send arbitrary roles (e.g. `system` messages) to manipulate the model via prompt injection
- Send extremely large payloads (no size limit)
- Send non-array values causing unexpected gateway behaviour

**Recommendation:** Validate that `messages` is an array, each entry has only `role` ∈ `{'user','assistant'}` and `content` is a string with a max length. Reject `system` role from client input.

---

### 2. No rate limiting
**Severity: MEDIUM**

The API route has no rate limiting. Any client can spam requests, burning tokens and potentially causing gateway overload.

**Recommendation:** Add rate limiting (e.g. via `next-rate-limit`, Vercel edge middleware, or an in-memory store). Even a simple per-IP limit of ~20 req/min would help.

---

### 3. No authentication on the API route
**Severity: HIGH**

The `/api/kai/chat` endpoint has no auth check. Anyone who can reach the server can use it, proxying requests through to the OpenClaw gateway on the server's behalf.

**Recommendation:** Add session/auth validation (e.g. check NextAuth session, API key, or at minimum restrict to authenticated users).

---

### 4. SSRF risk — gateway URL from env, but messages body is user-controlled
**Severity: LOW**

The gateway URL is from `process.env` (not user input), so direct SSRF is not possible. However, the user controls the full `messages` body sent to the gateway. If the gateway has any endpoints that interpret message content as URLs or commands, there's indirect risk.

**Recommendation:** No immediate action needed beyond input validation (finding #1).

---

### 5. Gateway token security
**Severity: ✅ PASS**

`GATEWAY_TOKEN` is read from `process.env` server-side only. It is never sent to the client. The `route.ts` file is a server-side API route. No secrets are exposed in `kai-client.tsx`.

---

### 6. XSS via message rendering
**Severity: LOW (pending sub-component review)**

`kai-client.tsx` does not use `dangerouslySetInnerHTML`. Messages are passed as string `content` to `<MessageList>`. If `MessageList` or any child renders markdown as raw HTML, XSS is possible.

**Recommendation:** Verify that `components/kai/message-list.tsx` does not use `dangerouslySetInnerHTML` or render unsanitised HTML. If it renders markdown, ensure a sanitiser (e.g. DOMPurify) is used.

---

### 7. Stream parsing — malformed SSE handling
**Severity: ✅ PASS**

The client wraps `JSON.parse` in a try/catch and silently skips malformed chunks. The `[DONE]` sentinel is handled. Buffer splitting on `\n` is correct. No crash risk from malformed responses.

---

### 8. No request body size limit
**Severity: MEDIUM**

`req.json()` will parse arbitrarily large bodies. A client could send a multi-MB payload of fake message history.

**Recommendation:** Either set `bodyParser` size limits in Next.js config or manually check `Content-Length` before parsing.

---

## Summary Table

| # | Issue | Severity |
|---|-------|----------|
| 1 | No input validation (role injection, payload size) | **HIGH** |
| 2 | No rate limiting | **MEDIUM** |
| 3 | No authentication on API route | **HIGH** |
| 4 | SSRF (indirect, low risk) | **LOW** |
| 5 | Gateway token exposure | ✅ PASS |
| 6 | XSS (needs sub-component check) | **LOW** |
| 7 | Malformed SSE handling | ✅ PASS |
| 8 | No request body size limit | **MEDIUM** |
