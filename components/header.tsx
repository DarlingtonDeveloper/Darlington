"use client"

import { Home, LayoutGrid, Images, BookOpen } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function Header() {
    const navItems = [
        { name: 'Connect', url: '#connect', icon: Home },
        { name: 'Projects', url: '#projects', icon: LayoutGrid },
        { name: 'Systems', url: '#systems', icon: Images },
        { name: 'Blog', url: 'https://frtr.hashnode.dev/', icon: BookOpen }
    ]

    return (
        <>
            <NavBar items={navItems} />
        </>
    )
}