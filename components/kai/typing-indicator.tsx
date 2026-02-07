export function TypingIndicator() {
    return (
        <div className="flex justify-start" role="status" aria-label="Kai is typing">
            <div
                className="rounded-2xl px-4 py-3 flex gap-1"
                style={{
                    background: 'oklch(1 0 0 / 6%)',
                    borderBottomLeftRadius: '0.375rem',
                }}
            >
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: 'var(--fg2, #6b6560)' }} />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: 'var(--fg2, #6b6560)' }} />
                <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: 'var(--fg2, #6b6560)' }} />
            </div>
        </div>
    )
}
