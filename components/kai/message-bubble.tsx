interface MessageBubbleProps {
    role: 'user' | 'assistant'
    content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
    const isUser = role === 'user'

    if (!content) return null

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`} role="listitem">
            <div
                className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={isUser ? {
                    background: 'var(--accent, #c4b5a0)',
                    color: 'var(--bg, #07070e)',
                    borderBottomRightRadius: '0.375rem',
                } : {
                    background: 'oklch(1 0 0 / 6%)',
                    color: 'var(--fg, #e8e4df)',
                    borderBottomLeftRadius: '0.375rem',
                }}
            >
                {content}
            </div>
        </div>
    )
}
