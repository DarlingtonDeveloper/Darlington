# Requirements: Kai Chat UI

## Functional
- R1: Chat page at `/kai` with message input and conversation display
- R2: Streaming responses via SSE (OpenClaw `/v1/chat/completions` endpoint)
- R3: Next.js API route at `/api/kai/chat` proxying to OpenClaw gateway (keeps tokens server-side)
- R4: Message history within browser session (not persisted to DB yet)
- R5: Loading/typing indicator during streaming
- R6: Mobile-responsive layout

## Non-Functional
- NR1: Follow existing component patterns (Radix + CVA, server page + client component)
- NR2: Dark theme, emerald accents, consistent with site design
- NR3: No authentication required for v1 (can add later)
- NR4: Graceful error handling if OpenClaw gateway is unreachable

## Out of Scope (v1)
- Persistent conversation history (Supabase)
- Voice input/output
- File/image sharing
- Authentication/rate limiting
