"use client"

import React from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigation } from "@/hooks/use-navigation"
import Link from "next/link"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items: NavItem[]
    className?: string
}

export function NavBar({ items, className }: NavBarProps) {
    const {
        activeTab,
        isMobile,
        hasScrolled,
        isExternalLink
    } = useNavigation(items)

    return (
        <div
            className={cn(
                isMobile
                    ? "w-full z-10" // Changed from fixed positioning for mobile
                    : "fixed top-4 left-0 right-0 z-40",
                hasScrolled ? "opacity-100" : "opacity-100",
                className
            )}
            style={{ pointerEvents: 'none' }} // Make the container not capture clicks
        >
            <div className="flex justify-center" style={{ pointerEvents: 'none' }}>
                <div className={cn(
                    "flex items-center gap-3 py-1 px-1 rounded-full shadow-lg",
                    "bg-background/5 border border-border backdrop-blur-lg",
                    hasScrolled && "bg-[#0D1117]/90 backdrop-blur-md"
                )}
                    style={{ pointerEvents: 'auto' }} // Re-enable pointer events only for the navbar itself
                >
                    {items.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.name
                        const external = isExternalLink(item.url)

                        return (
                            <div
                                key={item.name}
                                className={cn(
                                    "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                                    "text-foreground/80 hover:text-primary",
                                    isActive && "bg-muted text-primary",
                                )}
                            >
                                {external ? (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full h-full"
                                    >
                                        <span className="hidden md:inline">{item.name}</span>
                                        <span className="md:hidden">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </span>
                                    </a>
                                ) : (
                                    <Link
                                        href={item.url}
                                        className="block w-full h-full"
                                    >
                                        <span className="hidden md:inline">{item.name}</span>
                                        <span className="md:hidden">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </span>
                                    </Link>
                                )}

                                {isActive && (
                                    <motion.div
                                        layoutId="lamp"
                                        className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    >
                                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                                            <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                                            <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                                            <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}