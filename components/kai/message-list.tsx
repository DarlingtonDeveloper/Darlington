'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'
import type { Message } from '@/app/kai/kai-client'

interface MessageListProps {
    messages: Message[]
    isStreaming: boolean
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const isNearBottom = () => {
        const el = containerRef.current
        if (!el) return true
        return el.scrollHeight - el.scrollTop - el.clientHeight < 100
    }

    useEffect(() => {
        if (isNearBottom()) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isStreaming])

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-center px-8">
                <div>
                    <p className="font-display text-2xl mb-2" style={{ color: 'var(--accent, #c4b5a0)' }}>Kai</p>
                    <p className="text-sm" style={{ color: 'var(--fg2, #6b6560)' }}>Ask me anything</p>
                </div>
            </div>
        )
    }

    const lastMsg = messages[messages.length - 1]
    const showTyping = isStreaming && lastMsg?.role === 'user'

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4" role="list" aria-label="Chat messages">
            <div className="flex flex-col gap-3">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                ))}
                {showTyping && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}
