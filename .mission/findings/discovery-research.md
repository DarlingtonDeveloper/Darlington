# Discovery Research: Kai Chat UI on darlington.dev

## 1. Existing App Patterns

### Stack
- Next.js 15 (App Router), React 19, Tailwind CSS 4, Supabase, TypeScript
- UI primitives: custom `components/ui/` (button, card, tabs) using Radix UI + CVA + clsx + tailwind-merge (shadcn/ui pattern)
- Animations: Framer Motion
- Icons: lucide-react
- Design system: "Precision & Density" (Linear-inspired), monochrome with emerald accent, mobile-first (iPhone 16 Pro primary)

### Route Patterns
- **Standalone apps** (habits, calendar, health, hanzi, goals) use their own `layout.tsx` with full-screen overlay pattern:
  ```tsx
  <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto">
  ```
- Each has a nav component (e.g., `HabitsNav`, `HealthNav`)
- Server components for data fetching → client components for interactivity (`page.tsx` → `*-client.tsx`)
- API routes under `app/api/` for backend logic

### Auth
- Supabase auth with `/auth/callback` route
- Login/signup under `(auth)` route group

## 2. Where /kai Fits

A `/kai` route would follow the standalone app pattern like `/habits` or `/hanzi`:
- `app/kai/layout.tsx` — standalone full-screen layout with KaiNav
- `app/kai/page.tsx` — server component (auth check, load history)
- `app/kai/kai-client.tsx` — client component with chat UI
- `components/kai/kai-nav.tsx` — navigation bar

## 3. OpenClaw Integration Options

### Option A: OpenAI-Compatible Chat Completions API (Recommended)
OpenClaw Gateway exposes `POST /v1/chat/completions` — a standard OpenAI-compatible endpoint.

**How it works:**
- Enable in OpenClaw config: `gateway.http.endpoints.chatCompletions.enabled: true`
- Call from Next.js API route: `POST http://127.0.0.1:18789/v1/chat/completions`
- Auth via `Authorization: Bearer <token>`
- Supports streaming (SSE) with `stream: true`
- Session persistence via `user` field (derives stable session key)
- Target agent with `model: "openclaw:main"` or `x-openclaw-agent-id` header

**Architecture:**
```
Browser → Next.js API route (/api/kai/chat) → OpenClaw Gateway (localhost:18789) → Kai agent
```

The Next.js API route acts as a proxy, keeping the gateway token server-side.

**Streaming approach:** Use the Vercel AI SDK (`ai` package) or raw SSE via `ReadableStream` to stream responses to the client.

### Option B: Gateway WebSocket (Direct)
The Gateway also supports WebSocket connections with `chat.send`/`chat.history` commands. More complex to implement but enables real-time bidirectional comms. Probably overkill for this use case.

### Option C: Tools Invoke API
`POST /tools/invoke` — for invoking individual tools. Not suitable for chat.

## 4. Recommended Approach

### API Layer
1. **Next.js API route** (`app/api/kai/chat/route.ts`) proxies to OpenClaw's `/v1/chat/completions`
2. Use streaming SSE for real-time response display
3. Gateway token stored as `OPENCLAW_GATEWAY_TOKEN` env var
4. Pass authenticated user ID as `user` field for session persistence

### Frontend
1. Chat UI client component with message list + input
2. Stream responses using `fetch` with `ReadableStream` parsing
3. Style consistent with existing design system (dark, monochrome, emerald accents)
4. Mobile-first with 44px touch targets, safe area padding
5. Auto-scroll, typing indicators during streaming

### Optional: Vercel AI SDK
The `ai` package from Vercel provides `useChat` hook that handles streaming, message state, and the API route format out of the box. Would significantly reduce boilerplate. Compatible with OpenAI-format endpoints.

## 5. Technical Constraints

- **Gateway must be running** and accessible from the Next.js server (localhost in dev, need network path in prod)
- **Production deployment (Vercel)**: The OpenClaw gateway runs on Mike's server, not on Vercel. The API route needs to reach it — options:
  - Tailscale Funnel to expose gateway publicly with password auth
  - Or run Next.js self-hosted alongside the gateway
  - Or use the gateway's remote mode
- **Auth**: Need to decide if chat is public or requires Supabase login
- **Rate limiting**: Should add rate limiting on the API route
- **No existing chat tables in Supabase** — OpenClaw manages its own session history

## 6. Open Questions

1. **Deployment topology**: Is darlington.dev on Vercel or self-hosted? This determines how the Next.js API route reaches the OpenClaw gateway.
2. **Auth requirement**: Should `/kai` require login, or be open to visitors?
3. **Which OpenClaw agent?** Is there a dedicated `kai` agent, or use `main`?
4. **Conversation persistence**: Rely on OpenClaw's session management, or also store in Supabase?
5. **Gateway config**: Is `chatCompletions` endpoint already enabled? What's the current gateway auth setup?
6. **Scope**: Simple chat only, or also show conversation history across sessions?
7. **Vercel AI SDK**: Worth adding as a dependency for `useChat`, or keep it lightweight with raw fetch?
