'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { name: 'Link', href: '/hanzi' },
  { name: 'Lesson', href: '/hanzi/lesson' },
  { name: 'Review', href: '/hanzi/review' },
  { name: 'Stats', href: '/hanzi/stats' },
]

export function HanziNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 py-3 overflow-x-auto">
      <Link
        href="/habits"
        className="mr-2 flex items-center justify-center size-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors"
        aria-label="Back to Habits"
      >
        <svg
          className="size-4 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Link>

      <span className="text-sm font-medium text-neutral-50 mr-4">Hanzi</span>

      {tabs.map(tab => {
        const isActive =
          tab.href === '/hanzi'
            ? pathname === '/hanzi'
            : pathname?.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
              isActive
                ? 'bg-neutral-800 text-neutral-50'
                : 'text-neutral-400 hover:text-neutral-50 hover:bg-neutral-900'
            )}
          >
            {tab.name}
          </Link>
        )
      })}
    </nav>
  )
}
