'use client'

import { useState, useEffect } from 'react'

interface NavItem {
    name: string
    url: string
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

export function useNavigation(items: NavItem[]) {
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

    const handleNavigation = (itemName: string, itemUrl: string) => {
        setActiveTab(itemName)

        // Handle smooth scrolling for internal links
        if (itemUrl.startsWith('#')) {
            const targetId = itemUrl.substring(1)
            const targetElement = document.getElementById(targetId)

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
        }
    }

    return {
        activeTab,
        isMobile,
        hasScrolled,
        isExternalLink,
        handleNavigation
    }
}