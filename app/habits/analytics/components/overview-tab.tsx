'use client'

import type { HabitStreak, WeeklyStat, CompletionTimePattern, DailyCompletionRate, PersonalRecords } from '@/types/database'

interface OverviewTabProps {
    streaks: HabitStreak[]
    weeklyStats: WeeklyStat[]
    timePatterns: CompletionTimePattern[]
    totalCompletions: number
    dailyRates: DailyCompletionRate[]
    personalRecords: PersonalRecords | null
    todayCompletedHabitIds: string[]
    totalActiveHabits: number
}

export function OverviewTab({
    streaks,
    weeklyStats,
    timePatterns,
    totalCompletions,
    dailyRates,
    personalRecords,
    todayCompletedHabitIds,
    totalActiveHabits,
}: OverviewTabProps) {
    // Calculate summary stats
    const avgStreak = streaks.length > 0
        ? Math.round(streaks.reduce((sum, s) => sum + s.current_streak, 0) / streaks.length)
        : 0

    // Calculate 7-day completion rate from weekly stats
    const recentWeekStats = weeklyStats.slice(0, 30)
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

    // Calculate streaks at risk (habits with streaks > 0 not completed today)
    const streaksAtRisk = streaks
        .filter(s => s.current_streak > 0 && !todayCompletedHabitIds.includes(s.habit_id))
        .sort((a, b) => b.current_streak - a.current_streak)
        .slice(0, 5)

    // Calculate this week vs last week comparison
    const thisWeekRates = dailyRates.filter(d => {
        const date = new Date(d.completion_date)
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        return date >= weekStart
    })
    const lastWeekRates = dailyRates.filter(d => {
        const date = new Date(d.completion_date)
        const now = new Date()
        const lastWeekStart = new Date(now)
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7)
        const thisWeekStart = new Date(now)
        thisWeekStart.setDate(now.getDate() - now.getDay())
        return date >= lastWeekStart && date < thisWeekStart
    })

    const thisWeekAvg = thisWeekRates.length > 0
        ? Math.round(thisWeekRates.reduce((sum, d) => sum + d.completion_rate, 0) / thisWeekRates.length)
        : 0
    const lastWeekAvg = lastWeekRates.length > 0
        ? Math.round(lastWeekRates.reduce((sum, d) => sum + d.completion_rate, 0) / lastWeekRates.length)
        : 0
    const weekDelta = thisWeekAvg - lastWeekAvg

    // Calculate day of week performance (last 4 weeks)
    const dayOfWeekStats = Array(7).fill(null).map((_, i) => {
        const daysForDow = dailyRates.filter(d => d.day_of_week === i)
        const avg = daysForDow.length > 0
            ? Math.round(daysForDow.reduce((sum, d) => sum + d.completion_rate, 0) / daysForDow.length)
            : 0
        return { day: i, rate: avg }
    })
    const maxDayRate = Math.max(...dayOfWeekStats.map(d => d.rate), 1)
    const bestDay = dayOfWeekStats.reduce((best, d) => d.rate > best.rate ? d : best, dayOfWeekStats[0])
    const worstDay = dayOfWeekStats.reduce((worst, d) => d.rate < worst.rate && d.rate > 0 ? d : worst, dayOfWeekStats[0])

    // Today's progress
    const todayCompletedCount = todayCompletedHabitIds.length
    const todayPercentage = totalActiveHabits > 0
        ? Math.round((todayCompletedCount / totalActiveHabits) * 100)
        : 0

    return (
        <div className="space-y-4">
            {/* Today's Progress */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        Today
                    </h2>
                    <span className="text-xs text-neutral-500">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                className="text-neutral-800"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${(todayPercentage / 100) * 176} 176`}
                                className="text-emerald-500"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-mono text-sm tabular-nums text-neutral-50">
                            {todayPercentage}%
                        </span>
                    </div>
                    <div>
                        <div className="font-mono text-2xl tabular-nums text-neutral-50">
                            {todayCompletedCount}/{totalActiveHabits}
                        </div>
                        <div className="text-xs text-neutral-500">habits completed</div>
                    </div>
                </div>
            </div>

            {/* Streaks at Risk */}
            {streaksAtRisk.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-amber-500 mb-3">
                        Streaks at Risk
                    </h2>
                    <div className="space-y-2">
                        {streaksAtRisk.map((streak) => (
                            <div key={streak.habit_id} className="flex items-center justify-between py-1">
                                <span className="text-sm text-neutral-300 truncate flex-1 mr-3">
                                    {streak.habit_name}
                                </span>
                                <span className="font-mono text-xs tabular-nums text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2 py-1 rounded-md">
                                    {streak.current_streak}d
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Week Comparison */}
            {dailyRates.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <div className="font-mono text-2xl tabular-nums text-neutral-50 mb-1">
                            {thisWeekAvg}%
                        </div>
                        <div className="text-xs text-neutral-500 uppercase tracking-wide">
                            This week
                        </div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <div className="font-mono text-2xl tabular-nums text-neutral-50 mb-1">
                            {lastWeekAvg}%
                        </div>
                        <div className="text-xs text-neutral-500 uppercase tracking-wide">
                            Last week
                        </div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <div className={`font-mono text-2xl tabular-nums mb-1 ${weekDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {weekDelta >= 0 ? '+' : ''}{weekDelta}%
                        </div>
                        <div className="text-xs text-neutral-500 uppercase tracking-wide">
                            Change
                        </div>
                    </div>
                </div>
            )}

            {/* Day of Week Performance */}
            {dailyRates.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Day of Week
                    </h2>
                    <div className="space-y-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                            const stat = dayOfWeekStats[i]
                            const isBest = stat.day === bestDay.day && stat.rate > 0
                            const isWorst = stat.day === worstDay.day && stat.rate > 0 && worstDay.rate < bestDay.rate
                            return (
                                <div key={day} className="flex items-center gap-3">
                                    <span className="w-8 text-xs text-neutral-500">{day}</span>
                                    <div className="flex-1 h-4 bg-neutral-800 rounded-sm overflow-hidden">
                                        <div
                                            className={`h-full rounded-sm transition-all duration-300 ${isBest ? 'bg-emerald-500' : isWorst ? 'bg-amber-500' : 'bg-neutral-600'}`}
                                            style={{ width: `${(stat.rate / maxDayRate) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`font-mono text-xs tabular-nums w-10 text-right ${isBest ? 'text-emerald-400' : isWorst ? 'text-amber-400' : 'text-neutral-400'}`}>
                                        {stat.rate}%
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Personal Records */}
            {personalRecords && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Personal Records
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <RecordCard
                            label="Best day"
                            value={`${personalRecords.best_day_count}`}
                            detail={personalRecords.best_day_date ? formatDate(personalRecords.best_day_date) : undefined}
                        />
                        <RecordCard
                            label="Longest streak"
                            value={`${personalRecords.longest_active_streak}d`}
                        />
                        <RecordCard
                            label="Best week"
                            value={`${personalRecords.best_week_completions}`}
                            detail={personalRecords.best_week_start ? formatWeek(personalRecords.best_week_start) : undefined}
                        />
                        <RecordCard
                            label="Total"
                            value={personalRecords.total_completions.toLocaleString()}
                        />
                    </div>
                </div>
            )}

            {/* Summary Stats (legacy) */}
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
        </div>
    )
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatWeek(dateStr: string): string {
    const date = new Date(dateStr)
    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function RecordCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
    return (
        <div className="bg-neutral-800/50 rounded-lg p-3">
            <div className="font-mono text-lg tabular-nums text-neutral-50">
                {value}
            </div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide">
                {label}
            </div>
            {detail && (
                <div className="text-xs text-neutral-600 mt-1">
                    {detail}
                </div>
            )}
        </div>
    )
}

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
