'use client'

import { useState } from 'react'
import type { GoalWithProgress } from './page'
import type { EnergyCorrelation } from '@/types/database'
import { OverviewTab } from './components/overview-tab'
import { GoalsTab } from './components/goals-tab'
import { InsightsTab } from './components/insights-tab'

interface GoalsClientProps {
    goals: GoalWithProgress[]
    energyCorrelation: EnergyCorrelation[]
}

type TabId = 'overview' | 'goals' | 'insights'

const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'goals', label: 'Goals' },
    { id: 'insights', label: 'Insights' },
]

export function GoalsClient({ goals, energyCorrelation }: GoalsClientProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview')

    const hasData = goals.length > 0

    if (!hasData) {
        return (
            <div className="min-h-full bg-neutral-950 text-neutral-50 flex items-center justify-center px-4 pb-safe">
                <div className="text-center">
                    <div className="text-base font-medium mb-2 text-neutral-300">No goals yet</div>
                    <div className="text-sm text-neutral-500">
                        Goals can be added via the database.
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full bg-neutral-950 text-neutral-50">
            {/* Header with Tabs */}
            <div className="bg-neutral-950 border-b border-neutral-800">
                <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto">
                    <div className="flex gap-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        relative px-4 py-3 text-sm font-medium
                                        transition-colors duration-150
                                        ${isActive
                                            ? 'text-neutral-50'
                                            : 'text-neutral-500 active:text-neutral-300'
                                        }
                                    `}
                                >
                                    {tab.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 sm:px-6 py-4 sm:max-w-2xl sm:mx-auto pb-safe">
                {activeTab === 'overview' && (
                    <OverviewTab goals={goals} />
                )}
                {activeTab === 'goals' && (
                    <GoalsTab goals={goals} />
                )}
                {activeTab === 'insights' && (
                    <InsightsTab goals={goals} energyCorrelation={energyCorrelation} />
                )}
            </div>
        </div>
    )
}
