"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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
    const [activeTab, setActiveTab] = useState(items[0].name)
    const [isMobile, setIsMobile] = useState(false)
    const [hasScrolled, setHasScrolled] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        const handleScroll = () => {
            setHasScrolled(window.scrollY > 100)

            // Update active tab based on scroll position
            const scrollPosition = window.scrollY + 100

            // Only check navigation items with hash links
            const hashItems = items.filter(item => item.url.startsWith('#'))

            // Determine which section is currently in view
            // Start from the bottom sections and work up for proper highlighting
            for (let i = hashItems.length - 1; i >= 0; i--) {
                const item = hashItems[i]
                const targetId = item.url.substring(1)
                const element = document.getElementById(targetId)

                if (element) {
                    const rect = element.getBoundingClientRect()
                    const elementTop = window.scrollY + rect.top

                    // If we've scrolled to or past this element, make it active
                    // Add a small offset to trigger the highlight slightly before reaching the section
                    if (scrollPosition >= elementTop - 150) {
                        if (activeTab !== item.name) {
                            setActiveTab(item.name)
                        }
                        break
                    }
                }
            }

            // If at the very top of the page, select the first tab
            if (window.scrollY < 100 && hashItems.length > 0 && activeTab !== hashItems[0].name) {
                setActiveTab(hashItems[0].name)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        window.addEventListener("scroll", handleScroll)

        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("scroll", handleScroll)
        }
    }, [items, activeTab])

    const isExternalLink = (url: string) => {
        return url.startsWith('http') || url.startsWith('https')
    }

    return (
        <div
            className={cn(
                isMobile
                    ? "fixed bottom-0 left-0 right-0 mb-6 z-50"
                    : "fixed top-4 left-0 right-0 z-50",
                hasScrolled ? "opacity-100" : "opacity-100",
                className
            )}
        >
            <div className="flex justify-center">
                <div className={cn(
                    "flex items-center gap-3 py-1 px-1 rounded-full shadow-lg",
                    "bg-background/5 border border-border backdrop-blur-lg",
                    hasScrolled && "bg-[#0D1117]/90 backdrop-blur-md"
                )}>
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
                                        onClick={() => setActiveTab(item.name)}
                                    >
                                        <span className="hidden md:inline">{item.name}</span>
                                        <span className="md:hidden">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </span>
                                    </a>
                                ) : (
                                    <a
                                        href={item.url}
                                        className="block w-full h-full"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setActiveTab(item.name)

                                            // Handle smooth scrolling for internal links
                                            if (item.url.startsWith('#')) {
                                                const targetId = item.url.substring(1)
                                                const targetElement = document.getElementById(targetId)

                                                if (targetElement) {
                                                    // Just scroll the element into view - simplest approach
                                                    targetElement.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'start'
                                                    })
                                                }
                                            }
                                        }}
                                    >
                                        <span className="hidden md:inline">{item.name}</span>
                                        <span className="md:hidden">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </span>
                                    </a>
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
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
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