"use client"

import { Home, LayoutGrid, Images, BookOpen } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function Header() {
    const navItems = [
        { name: 'Connect', url: '#connect', icon: Home },
        { name: 'Featured', url: '#featured', icon: LayoutGrid },
        { name: 'Portfolio', url: '#portfolio', icon: Images },
        { name: 'Blog', url: 'https://hashnode.com/@darlington', icon: BookOpen }
    ]

    return (
        <>
            <NavBar items={navItems} />
        </>
    )
}