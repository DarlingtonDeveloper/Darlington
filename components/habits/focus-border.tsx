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
      {/* Pulsing glow border */}
      <div
        className="absolute -inset-[1px] rounded-lg sm:rounded-md animate-pulse-glow"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.5), rgba(251, 191, 36, 0.3))',
          backgroundSize: '200% 200%',
        }}
      />
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  )
}
