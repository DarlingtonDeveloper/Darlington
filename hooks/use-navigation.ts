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

    // Define isExternalLink function
    const isExternalLink = useCallback((url: string): boolean => {
        return url.startsWith('http') || url.startsWith('https')
    }, [])

    // Set active tab based on current pathname
    useEffect(() => {
        // For each path, normalize by removing the hash part for comparison
        const normalizedPathname = pathname?.split('#')[0] || '';

        // Initialize with first item as default
        let activeItem: NavItem | undefined = items[0];

        // First check for exact matches
        for (const item of items) {
            const itemUrlPath = item.url.split('#')[0];
            if (normalizedPathname === itemUrlPath) {
                activeItem = item;
                break;
            }
        }

        // Handle special case for home page
        if ((normalizedPathname === '/' || normalizedPathname === '') && activeItem?.url !== '/') {
            const homeItem = items.find(item => item.url === '/' || item.url === '/#connect');
            if (homeItem) {
                activeItem = homeItem;
            }
        }

        // If still no match and not on homepage, try partial matching
        if (activeItem?.url.split('#')[0] !== normalizedPathname &&
            normalizedPathname !== '/' &&
            normalizedPathname !== '') {

            let bestMatchLength = 0;

            for (const item of items) {
                const itemUrlPath = item.url.split('#')[0];

                // Skip external links and empty paths
                if (isExternalLink(item.url) || itemUrlPath === '' || itemUrlPath === '/') {
                    continue;
                }

                if (normalizedPathname.startsWith(itemUrlPath) && itemUrlPath.length > bestMatchLength) {
                    activeItem = item;
                    bestMatchLength = itemUrlPath.length;
                }
            }
        }

        // Set the active tab
        if (activeItem) {
            setActiveTab(activeItem.name);
        }
    }, [pathname, items, isExternalLink]);

    // Handle scroll and resize effects
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