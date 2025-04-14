"use client"

import { Home, Book, Leaf, Info } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function Header() {
    const navItems = [
        { name: 'Concept', url: '#concept', icon: Info },
        { name: 'How It Works', url: '#how-it-works', icon: Book },
        { name: 'Why Sprout', url: '#why-sprout', icon: Leaf }
    ]

    return (
        <>
            <NavBar items={navItems} />
        </>
    )
}