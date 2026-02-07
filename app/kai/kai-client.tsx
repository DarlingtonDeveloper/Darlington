'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { MessageList } from '@/components/kai/message-list'
import { ChatInput } from '@/components/kai/chat-input'

export interface Message {
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

    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            abortRef.current?.abort()
        }
    }, [])

    const sendMessage = useCallback(async () => {
        if (!input.trim() || isStreaming) return

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() }
        const assistantId = crypto.randomUUID()

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsStreaming(true)
        setError(null)

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

            if (!res.body) throw new Error('No response body')

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let fullContent = ''
            let assistantAdded = false

            const processLines = (lines: string[]) => {
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    const data = line.slice(6)
                    if (data === '[DONE]') continue

                    try {
                        const parsed = JSON.parse(data)
                        const delta = parsed.choices?.[0]?.delta?.content
                        if (delta) {
                            fullContent += delta

                            // Only add assistant message on first content chunk
                            if (!assistantAdded) {
                                assistantAdded = true
                                setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: fullContent }])
                            } else {
                                const captured = fullContent
                                setMessages(prev =>
                                    prev.map(m => m.id === assistantId ? { ...m, content: captured } : m)
                                )
                            }
                        }
                    } catch {
                        // skip malformed SSE chunks
                    }
                }
            }

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''
                processLines(lines)
            }

            // Process any remaining buffer
            if (buffer.trim()) {
                processLines([buffer])
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError('Could not reach Kai. Try again.')
            }
        } finally {
            setIsStreaming(false)
        }
    }, [input, isStreaming, messages])

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto">
            <MessageList messages={messages} isStreaming={isStreaming} />
            {error && (
                <div className="px-4 py-2 text-sm text-center" style={{ color: 'var(--accent2, #a89880)' }}>{error}</div>
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
