'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface NavItem {
    name: string
    url: string
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

export function useNavigation(items: NavItem[]) {
    const pathname = usePathname()
    const [activeTab, setActiveTab] = useState('')
    const [isMobile, setIsMobile] = useState(false)
    const [hasScrolled, setHasScrolled] = useState(false)

    // Define isExternalLink as a callback to ensure it's properly initialized before use
    const isExternalLink = useCallback((url: string) => {
        return url.startsWith('http') || url.startsWith('https')
    }, [])

    // Set active tab based on current pathname
    useEffect(() => {
        // For each path, normalize by removing the hash part for comparison
        const normalizedPathname = pathname.split('#')[0];

        // Find the best matching nav item
        let bestMatch: NavItem | null = null;
        let bestMatchLength = 0;

        // First check for exact matches
        const exactMatch = items.find(item => {
            const itemUrlPath = item.url.split('#')[0];
            return normalizedPathname === itemUrlPath;
        });

        if (exactMatch) {
            setActiveTab(exactMatch.name);
            return;
        }

        // Handle special case for home page
        if (normalizedPathname === '/' || normalizedPathname === '') {
            const homeItem = items.find(item => item.url === '/' || item.url === '/#connect');
            if (homeItem) {
                setActiveTab(homeItem.name);
                return;
            }
        }

        // No exact match, find the best partial match
        // This handles nested routes where the pathname might include additional segments
        items.forEach(item => {
            const itemUrlPath = item.url.split('#')[0];

            // Skip external links for partial matching
            if (isExternalLink(item.url)) return;

            // Skip empty paths to prevent everything matching '/'
            if (itemUrlPath === '') return;

            if (normalizedPathname.startsWith(itemUrlPath) && itemUrlPath.length > bestMatchLength) {
                bestMatch = item;
                bestMatchLength = itemUrlPath.length;
            }
        });

        if (bestMatch) {
            setActiveTab(bestMatch.name);
        } else {
            // Default to first item if no match
            setActiveTab(items[0]?.name || '');
        }
    }, [pathname, items, isExternalLink]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        const handleScroll = () => {
            setHasScrolled(window.scrollY > 100)
        }

        handleResize()
        handleScroll()
        window.addEventListener("resize", handleResize)
        window.addEventListener("scroll", handleScroll)

        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    return {
        activeTab,
        isMobile,
        hasScrolled,
        isExternalLink
    }
}