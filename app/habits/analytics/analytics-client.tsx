'use client'

import type { HabitStreak, WeeklyStat, CompletionTimePattern } from '@/types/database'

interface AnalyticsClientProps {
    streaks: HabitStreak[]
    weeklyStats: WeeklyStat[]
    timePatterns: CompletionTimePattern[]
    totalCompletions: number
}

export function AnalyticsClient({
    streaks,
    weeklyStats,
    timePatterns,
    totalCompletions,
}: AnalyticsClientProps) {
    // Calculate summary stats
    const avgStreak = streaks.length > 0
        ? Math.round(streaks.reduce((sum, s) => sum + s.current_streak, 0) / streaks.length)
        : 0

    // Calculate 7-day completion rate from weekly stats
    const recentWeekStats = weeklyStats.slice(0, 30) // Get recent entries
    const avgCompletionRate = recentWeekStats.length > 0
        ? Math.round(recentWeekStats.reduce((sum, s) => sum + s.completion_rate, 0) / recentWeekStats.length)
        : 0

    // Aggregate time patterns across all habits
    const hourlyTotals = Array(24).fill(0)
    timePatterns.forEach(p => {
        hourlyTotals[p.hour_of_day] += p.completion_count
    })
    const maxHourlyCount = Math.max(...hourlyTotals, 1)

    // Aggregate weekly stats for chart (overall rate per week)
    const weeklyAggregated = weeklyStats.reduce((acc, stat) => {
        if (!acc[stat.week_start]) {
            acc[stat.week_start] = { total: 0, count: 0 }
        }
        acc[stat.week_start].total += stat.completion_rate
        acc[stat.week_start].count += 1
        return acc
    }, {} as Record<string, { total: number; count: number }>)

    const weeklyChartData = Object.entries(weeklyAggregated)
        .map(([week, data]) => ({
            week,
            rate: Math.round(data.total / data.count),
        }))
        .sort((a, b) => a.week.localeCompare(b.week))
        .slice(-8)

    // Sort streaks by current_streak descending
    const sortedStreaks = [...streaks].sort((a, b) => b.current_streak - a.current_streak)

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
            {/* Header */}
            <div className="bg-neutral-950 border-b border-neutral-800">
                <div className="px-4 sm:px-6 py-4 sm:max-w-2xl sm:mx-auto">
                    <h1 className="text-xl sm:text-lg font-semibold tracking-tight">Analytics</h1>
                </div>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:max-w-2xl sm:mx-auto space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="7d rate" value={`${avgCompletionRate}%`} />
                    <StatCard label="avg streak" value={`${avgStreak}d`} />
                    <StatCard label="total" value={totalCompletions.toString()} />
                </div>

                {/* Weekly Chart */}
                {weeklyChartData.length > 0 && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                            Weekly Rate
                        </h2>
                        <WeeklyChart data={weeklyChartData} />
                    </div>
                )}

                {/* Time Heatmap */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Time of Day
                    </h2>
                    <TimeHeatmap hourlyTotals={hourlyTotals} maxCount={maxHourlyCount} />
                </div>

                {/* Streaks */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 pb-safe">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Current Streaks
                    </h2>
                    <div className="space-y-2">
                        {sortedStreaks.map((streak) => (
                            <StreakCard
                                key={streak.habit_id}
                                name={streak.habit_name}
                                days={streak.current_streak}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Stat Card Component
function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="font-mono text-2xl tabular-nums text-neutral-50 mb-1">
                {value}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
                {label}
            </div>
        </div>
    )
}

// Weekly Chart Component
function WeeklyChart({ data }: { data: { week: string; rate: number }[] }) {
    return (
        <div className="h-32">
            <div className="flex items-end justify-between h-full gap-2">
                {data.map((d, i) => {
                    const height = (d.rate / 100) * 100
                    const weekLabel = new Date(d.week).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex-1 flex items-end">
                                <div
                                    className="w-full bg-emerald-500 rounded-t-sm transition-all duration-300"
                                    style={{ height: `${height}%`, minHeight: d.rate > 0 ? '4px' : '0' }}
                                />
                            </div>
                            <span className="font-mono text-[10px] tabular-nums text-neutral-600">
                                {weekLabel.split(' ')[1]}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Time Heatmap Component
function TimeHeatmap({ hourlyTotals, maxCount }: { hourlyTotals: number[]; maxCount: number }) {
    const getIntensity = (count: number): string => {
        if (count === 0) return 'bg-neutral-800'
        const ratio = count / maxCount
        if (ratio < 0.25) return 'bg-emerald-950'
        if (ratio < 0.5) return 'bg-emerald-900'
        if (ratio < 0.75) return 'bg-emerald-700'
        return 'bg-emerald-500'
    }

    return (
        <div className="grid grid-cols-6 gap-1">
            {hourlyTotals.map((count, hour) => (
                <div
                    key={hour}
                    className={`
                        aspect-square rounded-sm flex items-center justify-center
                        ${getIntensity(count)}
                    `}
                    title={`${hour}:00 - ${count} completions`}
                >
                    <span className="font-mono text-[10px] tabular-nums text-neutral-400">
                        {hour.toString().padStart(2, '0')}
                    </span>
                </div>
            ))}
        </div>
    )
}

// Streak Card Component
function StreakCard({ name, days }: { name: string; days: number }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-neutral-300 truncate flex-1 mr-3">
                {name}
            </span>
            <span className="font-mono text-sm tabular-nums text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-1 rounded-md">
                {days}d
            </span>
        </div>
    )
}
