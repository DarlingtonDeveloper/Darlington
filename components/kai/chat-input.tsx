'use client'

import { useRef, useCallback, type KeyboardEvent } from 'react'
import { SendHorizontal, Square } from 'lucide-react'

interface ChatInputProps {
    value: string
    onChange: (value: string) => void
    onSend: () => void
    onStop?: () => void
    disabled: boolean
    isStreaming?: boolean
}

export function ChatInput({ value, onChange, onSend, onStop, disabled, isStreaming }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleInput = useCallback(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }, [])

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
        }
    }, [onSend])

    return (
        <div className="px-4 py-3 pb-safe" style={{ borderTop: '1px solid oklch(1 0 0 / 8%)' }}>
            <div className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={e => { onChange(e.target.value); handleInput() }}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Kai..."
                    rows={1}
                    aria-label="Message input"
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-1"
                    style={{
                        background: 'oklch(1 0 0 / 6%)',
                        color: 'var(--fg, #e8e4df)',
                        fontFamily: 'var(--font-sans)',
                    }}
                />
                {isStreaming ? (
                    <button
                        onClick={onStop}
                        aria-label="Stop response"
                        className="p-2.5 rounded-xl transition-opacity active:opacity-80
                            min-w-[44px] min-h-[44px] flex items-center justify-center"
                        style={{
                            background: 'var(--accent2, #a89880)',
                            color: 'var(--bg, #07070e)',
                        }}
                    >
                        <Square className="w-4 h-4" fill="currentColor" />
                    </button>
                ) : (
                    <button
                        onClick={onSend}
                        disabled={disabled || !value.trim()}
                        aria-label="Send message"
                        className="p-2.5 rounded-xl transition-opacity
                            disabled:opacity-30 active:opacity-80
                            min-w-[44px] min-h-[44px] flex items-center justify-center"
                        style={{
                            background: 'var(--accent, #c4b5a0)',
                            color: 'var(--bg, #07070e)',
                        }}
                    >
                        <SendHorizontal className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    )
}
