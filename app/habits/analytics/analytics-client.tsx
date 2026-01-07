'use client'

import { useState } from 'react'
import type { HabitStreak, WeeklyStat, CompletionTimePattern, DailyCompletionRate, PersonalRecords, Habit, EnergyCorrelation } from '@/types/database'
import { OverviewTab } from './components/overview-tab'
import { HabitsTab } from './components/habits-tab'
import { InsightsTab } from './components/insights-tab'

interface HabitCompletion {
    habit_id: string
    completion_date: string
    completion_percentage: number
    notes: string | null
}

interface HabitWithGoals {
    id: string
    name: string
    category: string | null
    goal_habits: Array<{
        goals: {
            id: string
            title: string
        }
    }>
}

interface AnalyticsClientProps {
    streaks: HabitStreak[]
    weeklyStats: WeeklyStat[]
    timePatterns: CompletionTimePattern[]
    totalCompletions: number
    dailyRates: DailyCompletionRate[]
    personalRecords: PersonalRecords | null
    todayCompletedHabitIds: string[]
    totalActiveHabits: number
    habits: Habit[]
    recentCompletions: HabitCompletion[]
    habitGoals: HabitWithGoals[]
    energyCorrelation: EnergyCorrelation[]
}

type TabId = 'overview' | 'habits' | 'insights'

const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'habits', label: 'Habits' },
    { id: 'insights', label: 'Insights' },
]

export function AnalyticsClient({
    streaks,
    weeklyStats,
    timePatterns,
    totalCompletions,
    dailyRates,
    personalRecords,
    todayCompletedHabitIds,
    totalActiveHabits,
    habits,
    recentCompletions,
    habitGoals,
    energyCorrelation,
}: AnalyticsClientProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview')

    const hasData = streaks.length > 0 || weeklyStats.length > 0 || timePatterns.length > 0

    if (!hasData) {
        return (
            <div className="min-h-full bg-neutral-950 text-neutral-50 flex items-center justify-center px-4 pb-safe">
                <div className="text-center">
                    <div className="text-base font-medium mb-2 text-neutral-300">No analytics yet</div>
                    <div className="text-sm text-neutral-500">
                        Complete some habits to see your stats.
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
                    <OverviewTab
                        streaks={streaks}
                        weeklyStats={weeklyStats}
                        timePatterns={timePatterns}
                        totalCompletions={totalCompletions}
                        dailyRates={dailyRates}
                        personalRecords={personalRecords}
                        todayCompletedHabitIds={todayCompletedHabitIds}
                        totalActiveHabits={totalActiveHabits}
                    />
                )}
                {activeTab === 'habits' && (
                    <HabitsTab
                        streaks={streaks}
                        habits={habits}
                        recentCompletions={recentCompletions}
                        habitGoals={habitGoals}
                        timePatterns={timePatterns}
                    />
                )}
                {activeTab === 'insights' && (
                    <InsightsTab
                        streaks={streaks}
                        dailyRates={dailyRates}
                        energyCorrelation={energyCorrelation}
                        habits={habits}
                        recentCompletions={recentCompletions}
                    />
                )}
            </div>
        </div>
    )
}
