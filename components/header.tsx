"use client"

import { Home, LayoutGrid, Images, BookOpen, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"
import { Logo } from "@/components/logo"

export function Header() {
    const navItems = [
        { name: 'Home', url: '/', icon: Home },
        { name: 'Projects', url: '/projects', icon: LayoutGrid },
        { name: 'Systems', url: '/systems', icon: Images },
        { name: 'Blog', url: 'https://blog.darlington.dev', icon: BookOpen },
        { name: 'Docs', url: 'https://docs.darlington.dev', icon: FileText }
    ]

    return (
        <>
            {/* Logo in top left with highest z-index */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50 pointer-events-auto">
                <Logo size="small" />
            </div>
            {/* Navigation bar */}
            <NavBar items={navItems} />
        </>
    )
}