'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function KaiNav() {
    return (
        <nav className="flex items-center justify-between py-3">
            <Link
                href="/"
                aria-label="Back to home"
                className="p-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--fg2, #6b6560)' }}
            >
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-display text-sm tracking-wide" style={{ color: 'var(--fg, #e8e4df)' }}>
                Kai
            </span>
            <div className="w-7" />
        </nav>
    )
}
