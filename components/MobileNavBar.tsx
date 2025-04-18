'use client'

import { Home, LayoutGrid, Images, BookOpen, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function MobileNavBar() {
    // Define navigation items in the client component
    const navItems = [
        { name: 'Home', url: '/', icon: Home },
        { name: 'Projects', url: '/projects', icon: LayoutGrid },
        { name: 'Systems', url: '/systems', icon: Images },
        { name: 'Blog', url: 'https://blog.darlington.dev', icon: BookOpen },
        { name: 'Docs', url: 'https://docs.darlington.dev', icon: FileText }
    ];

    return (
        <div className="py-4">
            <NavBar items={navItems} />
        </div>
    );
}