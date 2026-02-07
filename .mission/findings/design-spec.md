# Design Spec: Kai Chat UI

## File Structure

```
app/kai/
  layout.tsx              # Full-screen overlay layout with KaiNav
  page.tsx                # Server component (minimal — no auth needed for v1)
  kai-client.tsx          # Client component — all chat logic + UI

app/api/kai/chat/
  route.ts                # POST handler: proxy to OpenClaw gateway, stream SSE back

components/kai/
  kai-nav.tsx             # Top nav bar (back button + title)
  message-bubble.tsx      # Single message (user or assistant)
  message-list.tsx        # Scrollable message container
  chat-input.tsx          # Input bar with send button
  typing-indicator.tsx    # Animated dots shown during streaming
```

## Component Hierarchy

```
layout.tsx
  └─ <div fixed inset-0 z-50 bg-neutral-950> (full-screen overlay)
     ├─ KaiNav (sticky top)
     └─ page.tsx
        └─ KaiClient
           ├─ MessageList
           │   ├─ MessageBubble (role: assistant)
           │   ├─ MessageBubble (role: user)
           │   ├─ ...
           │   └─ TypingIndicator (when streaming)
           └─ ChatInput (sticky bottom)
```

## Component Details

### `app/kai/layout.tsx`
```tsx
import { KaiNav } from '@/components/kai/kai-nav'

export default function KaiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col">
      <div className="sticky top-0 bg-neutral-950 z-30 pt-safe">
        <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto">
          <KaiNav />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
```

### `app/kai/page.tsx`
```tsx
import { KaiClient } from './kai-client'

export const dynamic = 'force-dynamic'

export default function KaiPage() {
  return <KaiClient />
}
```

### `app/kai/kai-client.tsx`

Client component. State:
- `messages: Message[]` — `{ id: string, role: 'user' | 'assistant', content: string }`
- `input: string` — current input text
- `isStreaming: boolean` — whether a response is being streamed
- `error: string | null` — error state

Key behaviors:
- On send: append user message, POST to `/api/kai/chat`, read SSE stream, append/update assistant message token-by-token
- Auto-scroll to bottom on new messages (with scroll-locked logic: only auto-scroll if user is near bottom)
- Disable input during streaming
- Show TypingIndicator at start of streaming (before first token), then show partial message

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { MessageList } from '@/components/kai/message-list'
import { ChatInput } from '@/components/kai/chat-input'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function KaiClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)
    setError(null)

    // Build conversation history for API
    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      abortRef.current = new AbortController()
      const res = await fetch('/api/kai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('Failed to send message')

      setMessages(prev => [...prev, assistantMsg])

      // Read SSE stream
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              setMessages(prev =>
                prev.map(m => m.id === assistantMsg.id ? { ...m, content: fullContent } : m)
              )
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Could not reach Kai. Try again.')
      }
    } finally {
      setIsStreaming(false)
    }
  }, [input, isStreaming, messages])

  return (
    <div className="flex flex-col h-full sm:max-w-2xl sm:mx-auto">
      <MessageList messages={messages} isStreaming={isStreaming} />
      {error && (
        <div className="px-4 py-2 text-sm text-red-400 text-center">{error}</div>
      )}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        disabled={isStreaming}
      />
    </div>
  )
}
```

### `components/kai/kai-nav.tsx`
```tsx
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function KaiNav() {
  return (
    <nav className="flex items-center justify-between border-b border-neutral-800 py-3">
      <Link href="/" className="text-neutral-500 active:text-neutral-300 p-1">
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <span className="text-sm font-medium text-neutral-50">Kai</span>
      <div className="w-7" /> {/* spacer for centering */}
    </nav>
  )
}
```

### `components/kai/message-bubble.tsx`
```tsx
interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-neutral-800 text-neutral-100 rounded-bl-md'
          }
        `}
      >
        {content}
      </div>
    </div>
  )
}
```

### `components/kai/message-list.tsx`
Scrollable container with auto-scroll. Uses a `ref` on a bottom sentinel div and `scrollIntoView`.

### `components/kai/chat-input.tsx`
- `<textarea>` (auto-grows, max 4 lines) with send button (emerald, `SendHorizontal` icon from lucide)
- Submit on Enter (Shift+Enter for newline)
- `pb-safe` for iPhone home indicator
- 44px min touch target on send button

```tsx
<div className="border-t border-neutral-800 px-4 py-3 pb-safe">
  <div className="flex items-end gap-2">
    <textarea ... className="flex-1 bg-neutral-900 rounded-xl px-4 py-2.5 text-sm text-neutral-100
      placeholder-neutral-500 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
    <button ... className="p-2.5 bg-emerald-600 rounded-xl text-white
      disabled:opacity-40 active:bg-emerald-700 transition-colors">
      <SendHorizontal className="w-5 h-5" />
    </button>
  </div>
</div>
```

### `components/kai/typing-indicator.tsx`
Three animated dots. Shown when `isStreaming && assistantMessage.content === ''`.
```tsx
<div className="flex justify-start">
  <div className="bg-neutral-800 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:0ms]" />
    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:150ms]" />
    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:300ms]" />
  </div>
</div>
```

## API Route

### `app/api/kai/chat/route.ts`

```tsx
import { NextRequest } from 'next/server'

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789'
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
    },
    body: JSON.stringify({
      model: 'openclaw:main',
      messages,
      stream: true,
      user: 'darlington-web',  // session key for OpenClaw
    }),
  })

  if (!response.ok) {
    return new Response('Gateway error', { status: 502 })
  }

  // Pass through the SSE stream
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

## Data Flow

```
1. User types message → ChatInput onChange
2. User hits Send (or Enter) → sendMessage()
3. POST /api/kai/chat { messages: [...history] }
4. API route proxies to OpenClaw gateway POST /v1/chat/completions (stream: true)
5. Gateway returns SSE stream (data: {"choices":[{"delta":{"content":"..."}}]})
6. API route pipes stream directly to browser (no buffering)
7. Client reads stream with ReadableStream reader
8. Each SSE chunk parsed → delta.content appended to assistant message
9. React state update triggers re-render → MessageBubble shows partial text
10. Stream ends with data: [DONE] → isStreaming = false
```

## Environment Variables

```env
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=<token>
```

## Scroll Behavior

- Track whether user is "near bottom" (within 100px of scroll end)
- If near bottom when new content arrives → `scrollIntoView({ behavior: 'smooth' })`
- If user has scrolled up → don't auto-scroll (respect their position)
- On send → always scroll to bottom

## Empty State

When `messages.length === 0`, show a centered welcome:
```
<div className="flex-1 flex items-center justify-center text-center px-8">
  <div>
    <p className="text-neutral-400 text-sm">Ask Kai anything</p>
  </div>
</div>
```

## Summary

8 files total. No Supabase, no auth, no external deps beyond what's already in the project. Raw `fetch` + `ReadableStream` for streaming (no Vercel AI SDK needed for v1). Follows the existing full-screen overlay pattern exactly.
