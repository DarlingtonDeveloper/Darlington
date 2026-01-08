'use client'

import { cn } from '@/lib/utils'

interface FocusBorderProps {
  children: React.ReactNode
  active?: boolean
  className?: string
}

export function FocusBorder({ children, active = false, className }: FocusBorderProps) {
  if (!active) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative', className)}>
      {/* Animated gradient border */}
      <div
        className="absolute -inset-[1px] rounded-lg sm:rounded-md overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 animate-focus-border"
          style={{
            background: 'conic-gradient(from var(--angle), transparent 60%, rgba(251, 191, 36, 0.4) 80%, rgba(251, 191, 36, 0.6) 90%, rgba(251, 191, 36, 0.4) 100%, transparent)',
          }}
        />
      </div>
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  )
}
