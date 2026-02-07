# Kai Chat — Feature Documentation

## Overview

Kai Chat is a real-time AI chat interface for the Darlington web app. It streams responses from an OpenClaw gateway via Server-Sent Events (SSE), providing a mobile-friendly, single-conversation chat experience at `/kai`.

## File List

| File | Description |
|------|-------------|
| `app/kai/layout.tsx` | Full-screen layout with sticky nav bar, dark theme |
| `app/kai/page.tsx` | Page entry point, renders `KaiClient` (force-dynamic) |
| `app/kai/kai-client.tsx` | Core chat logic — state management, streaming fetch, abort handling |
| `app/api/kai/chat/route.ts` | API route — validates input, proxies to OpenClaw gateway, streams SSE back |
| `components/kai/kai-nav.tsx` | Top nav with back arrow and "Kai" title |
| `components/kai/message-list.tsx` | Scrollable message list with auto-scroll and empty state |
| `components/kai/message-bubble.tsx` | Styled bubble (user = accent right, assistant = muted left) |
| `components/kai/chat-input.tsx` | Auto-resizing textarea + send button, Enter to send |
| `components/kai/typing-indicator.tsx` | Bouncing dots shown while waiting for first assistant chunk |

## Setup

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENCLAW_GATEWAY_TOKEN` | **Yes** | `""` | Bearer token for OpenClaw gateway auth |
| `OPENCLAW_GATEWAY_URL` | No | `http://127.0.0.1:18789` | Gateway base URL |

### Quick Start

```bash
# In your .env.local
OPENCLAW_GATEWAY_TOKEN=your-token-here
# OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789  # optional
```

## API Route — `/api/kai/chat`

### `POST /api/kai/chat`

Proxies chat messages to the OpenClaw gateway and streams the response.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "What's the weather?" }
  ]
}
```

**Validation rules:**
- `messages` must be a non-empty array, max 50 items
- Each message: `role` is `"user"` or `"assistant"`, `content` is a string ≤ 10,000 chars

**Response:** `text/event-stream` (SSE) — proxied directly from the gateway's OpenAI-compatible `/v1/chat/completions` endpoint.

**Error responses:**
| Status | Meaning |
|--------|---------|
| 400 | Invalid JSON or failed message validation |
| 502 | Gateway unavailable or returned an error |

**Gateway request details:**
- Model: `openclaw:main`
- User identifier: `darlington-web`
- Timeout: 60 seconds
- Streaming: enabled

## Architecture

```
┌─────────────────────────────┐
│  Browser (/kai)             │
│                             │
│  KaiClient                  │
│   ├─ MessageList            │
│   │   ├─ MessageBubble ×N   │
│   │   └─ TypingIndicator    │
│   └─ ChatInput              │
│                             │
│  fetch POST /api/kai/chat   │
│  ──── streaming SSE ─────── │
└──────────┬──────────────────┘
           │
    POST /api/kai/chat
    (Next.js API route)
           │
    validates messages
    proxies with Bearer token
           │
           ▼
┌──────────────────────────┐
│  OpenClaw Gateway        │
│  /v1/chat/completions    │
│  (SSE stream)            │
└──────────────────────────┘
```

## Known Limitations (v1)

1. **No persistence** — conversation is lost on page refresh (client state only)
2. **No authentication** — the API route has no user auth; anyone with access to the app can use it
3. **Single conversation** — no chat history, no multiple threads
4. **No markdown rendering** — assistant responses display as plain `whitespace-pre-wrap` text
5. **No retry/regenerate** — failed or bad responses can't be retried from the UI
6. **No token/cost awareness** — full message history is sent every turn with no truncation strategy
7. **60s hard timeout** — long responses may be cut off by the gateway timeout
