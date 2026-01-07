'use client'

import type { HabitStreak, DailyCompletionRate, EnergyCorrelation, Habit } from '@/types/database'

interface HabitCompletion {
    habit_id: string
    completion_date: string
    completion_percentage: number
    notes: string | null
}

interface InsightsTabProps {
    streaks: HabitStreak[]
    dailyRates: DailyCompletionRate[]
    energyCorrelation: EnergyCorrelation[]
    habits: Habit[]
    recentCompletions: HabitCompletion[]
}

interface PatternAlert {
    type: 'declining' | 'improving' | 'weekend_slump' | 'streak_milestone' | 'low_completion'
    habitName?: string
    message: string
    severity: 'info' | 'warning' | 'success'
}

interface Recommendation {
    title: string
    description: string
    actionType: 'focus' | 'protect' | 'celebrate' | 'investigate'
}

export function InsightsTab({
    streaks,
    dailyRates,
    energyCorrelation,
    habits,
    recentCompletions,
}: InsightsTabProps) {
    // Detect patterns
    const patterns = detectPatterns(streaks, dailyRates, habits, recentCompletions)

    // Generate recommendations based on patterns
    const recommendations = generateRecommendations(patterns, streaks, energyCorrelation)

    const hasEnergyData = energyCorrelation.length > 0
    const hasPatterns = patterns.length > 0
    const hasRecommendations = recommendations.length > 0

    return (
        <div className="space-y-4">
            {/* Energy Impact */}
            {hasEnergyData && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Energy Impact
                    </h2>
                    <div className="space-y-3">
                        {['high', 'medium', 'low'].map(level => {
                            const data = energyCorrelation.find(e => e.energy_level === level)
                            const rate = data?.avg_completion_rate || 0
                            const days = data?.days_count || 0
                            const maxRate = Math.max(...energyCorrelation.map(e => e.avg_completion_rate || 0), 1)

                            return (
                                <div key={level} className="flex items-center gap-3">
                                    <span className={`w-16 text-xs capitalize ${
                                        level === 'high' ? 'text-emerald-400' :
                                        level === 'medium' ? 'text-amber-400' :
                                        'text-neutral-400'
                                    }`}>
                                        {level}
                                    </span>
                                    <div className="flex-1 h-6 bg-neutral-800 rounded-sm overflow-hidden">
                                        <div
                                            className={`h-full rounded-sm transition-all duration-300 ${
                                                level === 'high' ? 'bg-emerald-500' :
                                                level === 'medium' ? 'bg-amber-500' :
                                                'bg-neutral-600'
                                            }`}
                                            style={{ width: `${(rate / maxRate) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-mono text-xs tabular-nums w-12 text-right text-neutral-400">
                                        {rate}%
                                    </span>
                                    <span className="text-xs text-neutral-600 w-12 text-right">
                                        {days}d
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-xs text-neutral-600 mt-3">
                        Completion rate based on energy level logged during daily check-in
                    </p>
                </div>
            )}

            {/* Pattern Alerts */}
            {hasPatterns && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Patterns Detected
                    </h2>
                    <div className="space-y-3">
                        {patterns.map((pattern, i) => (
                            <PatternCard key={i} pattern={pattern} />
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {hasRecommendations && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Recommendations
                    </h2>
                    <div className="space-y-3">
                        {recommendations.map((rec, i) => (
                            <RecommendationCard key={i} recommendation={rec} index={i + 1} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!hasEnergyData && !hasPatterns && !hasRecommendations && (
                <div className="bg-neutral-900/50 border border-neutral-800/50 border-dashed rounded-lg p-6 text-center">
                    <div className="text-neutral-500 text-sm">
                        Not enough data for insights yet
                    </div>
                    <div className="text-neutral-600 text-xs mt-2">
                        Keep tracking habits and logging energy levels to unlock insights
                    </div>
                </div>
            )}
        </div>
    )
}

function PatternCard({ pattern }: { pattern: PatternAlert }) {
    const iconMap = {
        declining: '📉',
        improving: '📈',
        weekend_slump: '📅',
        streak_milestone: '🔥',
        low_completion: '⚠️',
    }

    const bgMap = {
        info: 'bg-neutral-800/50',
        warning: 'bg-amber-950/20 border-amber-800/30',
        success: 'bg-emerald-950/20 border-emerald-800/30',
    }

    const textMap = {
        info: 'text-neutral-300',
        warning: 'text-amber-300',
        success: 'text-emerald-300',
    }

    return (
        <div className={`rounded-lg p-3 border ${bgMap[pattern.severity]}`}>
            <div className="flex items-start gap-2">
                <span className="text-sm">{iconMap[pattern.type]}</span>
                <p className={`text-sm ${textMap[pattern.severity]}`}>
                    {pattern.message}
                </p>
            </div>
        </div>
    )
}

function RecommendationCard({ recommendation, index }: { recommendation: Recommendation; index: number }) {
    const iconMap = {
        focus: '🎯',
        protect: '🛡️',
        celebrate: '🎉',
        investigate: '🔍',
    }

    return (
        <div className="bg-neutral-800/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
                <span className="text-sm">{iconMap[recommendation.actionType]}</span>
                <div>
                    <h4 className="text-sm font-medium text-neutral-200">
                        {index}. {recommendation.title}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1">
                        {recommendation.description}
                    </p>
                </div>
            </div>
        </div>
    )
}

function detectPatterns(
    streaks: HabitStreak[],
    dailyRates: DailyCompletionRate[],
    habits: Habit[],
    recentCompletions: HabitCompletion[]
): PatternAlert[] {
    const patterns: PatternAlert[] = []

    // 1. Streak milestones (7, 14, 21, 30 days)
    const milestones = [7, 14, 21, 30]
    for (const streak of streaks) {
        if (milestones.includes(streak.current_streak)) {
            patterns.push({
                type: 'streak_milestone',
                habitName: streak.habit_name,
                message: `${streak.habit_name} has reached a ${streak.current_streak}-day streak!`,
                severity: 'success',
            })
        }
    }

    // 2. Weekend slump detection
    if (dailyRates.length >= 7) {
        const weekdayRates = dailyRates.filter(d => d.day_of_week >= 1 && d.day_of_week <= 5)
        const weekendRates = dailyRates.filter(d => d.day_of_week === 0 || d.day_of_week === 6)

        if (weekdayRates.length > 0 && weekendRates.length > 0) {
            const avgWeekday = weekdayRates.reduce((sum, d) => sum + d.completion_rate, 0) / weekdayRates.length
            const avgWeekend = weekendRates.reduce((sum, d) => sum + d.completion_rate, 0) / weekendRates.length

            if (avgWeekend < avgWeekday * 0.7) { // Weekend rate is 30%+ lower
                patterns.push({
                    type: 'weekend_slump',
                    message: `Weekend completion is ${Math.round(avgWeekend)}% vs ${Math.round(avgWeekday)}% on weekdays`,
                    severity: 'warning',
                })
            }
        }
    }

    // 3. Habits with declining completion
    for (const habit of habits) {
        const habitCompletions = recentCompletions.filter(c => c.habit_id === habit.id)

        if (habitCompletions.length >= 7) {
            // Split into two halves
            const halfPoint = Math.floor(habitCompletions.length / 2)
            const recentHalf = habitCompletions.slice(0, halfPoint)
            const olderHalf = habitCompletions.slice(halfPoint)

            const recentDays = new Set(recentHalf.map(c => c.completion_date)).size
            const olderDays = new Set(olderHalf.map(c => c.completion_date)).size

            // If recent completion is significantly lower
            if (olderDays > 0 && recentDays < olderDays * 0.6) {
                patterns.push({
                    type: 'declining',
                    habitName: habit.name,
                    message: `${habit.name} completion has dropped recently`,
                    severity: 'warning',
                })
            }
        }
    }

    // 4. Habits with improving completion
    for (const habit of habits) {
        const habitCompletions = recentCompletions.filter(c => c.habit_id === habit.id)

        if (habitCompletions.length >= 7) {
            const halfPoint = Math.floor(habitCompletions.length / 2)
            const recentHalf = habitCompletions.slice(0, halfPoint)
            const olderHalf = habitCompletions.slice(halfPoint)

            const recentDays = new Set(recentHalf.map(c => c.completion_date)).size
            const olderDays = new Set(olderHalf.map(c => c.completion_date)).size

            // If recent completion is significantly higher
            if (olderDays > 0 && recentDays > olderDays * 1.4) {
                patterns.push({
                    type: 'improving',
                    habitName: habit.name,
                    message: `${habit.name} is trending up!`,
                    severity: 'success',
                })
            }
        }
    }

    // 5. Low overall completion warning
    if (dailyRates.length >= 7) {
        const avgRate = dailyRates.reduce((sum, d) => sum + d.completion_rate, 0) / dailyRates.length
        if (avgRate < 40) {
            patterns.push({
                type: 'low_completion',
                message: `Overall completion is at ${Math.round(avgRate)}% - consider reducing habit count`,
                severity: 'warning',
            })
        }
    }

    return patterns.slice(0, 5) // Limit to 5 patterns
}

function generateRecommendations(
    patterns: PatternAlert[],
    streaks: HabitStreak[],
    energyCorrelation: EnergyCorrelation[]
): Recommendation[] {
    const recommendations: Recommendation[] = []

    // 1. If there's a weekend slump, recommend reducing weekend targets
    if (patterns.some(p => p.type === 'weekend_slump')) {
        recommendations.push({
            title: 'Reduce weekend load',
            description: 'Consider making weekends "minimum viable" days with only essential habits.',
            actionType: 'focus',
        })
    }

    // 2. If there are declining habits, recommend focusing on them
    const decliningHabits = patterns.filter(p => p.type === 'declining')
    if (decliningHabits.length > 0) {
        recommendations.push({
            title: 'Address declining habits',
            description: `${decliningHabits[0].habitName} needs attention. Consider breaking it into smaller steps.`,
            actionType: 'investigate',
        })
    }

    // 3. Protect long streaks
    const longStreaks = streaks.filter(s => s.current_streak >= 7).sort((a, b) => b.current_streak - a.current_streak)
    if (longStreaks.length > 0) {
        recommendations.push({
            title: 'Protect your streaks',
            description: `${longStreaks[0].habit_name} has a ${longStreaks[0].current_streak}-day streak. Make it a priority today.`,
            actionType: 'protect',
        })
    }

    // 4. Celebrate improvements
    const improvingHabits = patterns.filter(p => p.type === 'improving')
    if (improvingHabits.length > 0) {
        recommendations.push({
            title: 'Keep the momentum',
            description: `${improvingHabits[0].habitName} is improving. Stay consistent!`,
            actionType: 'celebrate',
        })
    }

    // 5. Energy-based recommendation
    if (energyCorrelation.length > 0) {
        const highEnergy = energyCorrelation.find(e => e.energy_level === 'high')
        const lowEnergy = energyCorrelation.find(e => e.energy_level === 'low')

        if (highEnergy && lowEnergy && highEnergy.avg_completion_rate > lowEnergy.avg_completion_rate * 1.5) {
            recommendations.push({
                title: 'Prioritize sleep and energy',
                description: `You complete ${Math.round(highEnergy.avg_completion_rate - lowEnergy.avg_completion_rate)}% more habits on high energy days.`,
                actionType: 'focus',
            })
        }
    }

    return recommendations.slice(0, 4) // Limit to 4 recommendations
}
