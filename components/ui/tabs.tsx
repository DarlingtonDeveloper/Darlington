"use client"

import { useState, createContext, useContext } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Tab context for managing tab state
type TabContextType = {
    activeTab: number
    setActiveTab: (index: number) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

function useTabContext() {
    const context = useContext(TabContext)
    if (!context) {
        throw new Error("Tab components must be used within a TabList")
    }
    return context
}

// Tab Container
interface TabListProps {
    defaultTab?: number
    onChange?: (index: number) => void
    children: React.ReactNode
    className?: string
}

export function TabList({
    defaultTab = 0,
    onChange,
    children,
    className,
}: TabListProps) {
    const [activeTab, setActiveTab] = useState(defaultTab)

    const handleTabChange = (index: number) => {
        setActiveTab(index)
        onChange?.(index)
    }

    return (
        <TabContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
            <div className={className}>
                {children}
            </div>
        </TabContext.Provider>
    )
}

// Individual Tab
interface TabProps {
    index: number
    children: React.ReactNode
    className?: string
    activeClassName?: string
    inactiveClassName?: string
}

export function Tab({
    index,
    children,
    className,
    activeClassName = "text-primary border-primary",
    inactiveClassName = "text-muted-foreground border-transparent hover:text-foreground hover:border-border",
}: TabProps) {
    const { activeTab, setActiveTab } = useTabContext()
    const isActive = activeTab === index

    return (
        <button
            className={cn(
                "relative px-4 py-2 border-b-2 transition-colors font-medium",
                isActive ? activeClassName : inactiveClassName,
                className
            )}
            onClick={() => setActiveTab(index)}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
        >
            {children}
            {isActive && (
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="tab-indicator"
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                    }}
                />
            )}
        </button>
    )
}

// Tab Content Container
interface TabContentProps {
    children: React.ReactNode
    className?: string
}

export function TabContent({ children, className }: TabContentProps) {
    return (
        <div className={cn("mt-4", className)} role="tabpanel">
            {children}
        </div>
    )
}

// Tab Panel (content for each tab)
interface TabPanelProps {
    index: number
    children: React.ReactNode
    className?: string
}

export function TabPanel({ index, children, className }: TabPanelProps) {
    const { activeTab } = useTabContext()

    if (activeTab !== index) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}