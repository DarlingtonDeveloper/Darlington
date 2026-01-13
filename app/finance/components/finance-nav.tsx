'use client'

import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'

export function FinanceNav() {
  return (
    <nav className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Link
          href="/habits"
          className="flex items-center justify-center size-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors"
          aria-label="Back to Dashboard"
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
        <h1 className="text-[13px] font-medium text-neutral-300 tracking-tight">Finance</h1>
      </div>
      <UserMenu compact />
    </nav>
  )
}
