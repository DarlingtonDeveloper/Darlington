'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
    { name: 'Daily', href: '/habits' },
    { name: 'Analytics', href: '/habits/analytics' },
]

export function HabitsNav() {
    const pathname = usePathname()

    return (
        <nav className="flex gap-1 border-b border-neutral-800">
            {tabs.map((tab) => {
                const isActive = tab.href === '/habits'
                    ? pathname === '/habits'
                    : pathname.startsWith(tab.href)

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`
                            relative px-4 py-3 text-sm font-medium
                            transition-colors duration-150
                            ${isActive
                                ? 'text-neutral-50'
                                : 'text-neutral-500 active:text-neutral-300'
                            }
                        `}
                    >
                        {tab.name}
                        {isActive && (
                            <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full" />
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
