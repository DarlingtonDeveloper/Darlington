'use client'

import type { GoalWithProgress } from '../page'
import type { EnergyCorrelation } from '@/types/database'

interface InsightsTabProps {
    goals: GoalWithProgress[]
    energyCorrelation: EnergyCorrelation[]
}

interface WeakLink {
    goalTitle: string
    habitName: string
    completionRate: number
    impact: 'high' | 'medium' | 'low'
}

interface Recommendation {
    title: string
    description: string
    actionType: 'focus' | 'protect' | 'celebrate' | 'investigate'
}

export function InsightsTab({ goals, energyCorrelation }: InsightsTabProps) {
    // Find weak links (habits dragging down goals)
    const weakLinks = detectWeakLinks(goals)

    // Generate recommendations
    const recommendations = generateRecommendations(goals, weakLinks, energyCorrelation)

    const hasEnergyData = energyCorrelation.length > 0
    const hasWeakLinks = weakLinks.length > 0
    const hasRecommendations = recommendations.length > 0

    return (
        <div className="space-y-4">
            {/* Weak Links */}
            {hasWeakLinks && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Weak Links
                    </h2>
                    <div className="space-y-3">
                        {weakLinks.map((link, i) => (
                            <WeakLinkCard key={i} link={link} />
                        ))}
                    </div>
                    <p className="text-xs text-neutral-600 mt-3">
                        These habits are underperforming and affecting your goals
                    </p>
                </div>
            )}

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
                        Completion rate based on energy level from daily check-in
                    </p>
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
            {!hasWeakLinks && !hasEnergyData && !hasRecommendations && (
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

function WeakLinkCard({ link }: { link: WeakLink }) {
    const impactColors = {
        high: 'bg-red-950/20 border-red-800/30 text-red-400',
        medium: 'bg-amber-950/20 border-amber-800/30 text-amber-400',
        low: 'bg-neutral-800/50 border-neutral-700/30 text-neutral-400',
    }

    return (
        <div className={`rounded-lg p-3 border ${impactColors[link.impact]}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="text-sm text-neutral-300 truncate">
                        {link.habitName}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                        affects {link.goalTitle}
                    </div>
                </div>
                <span className="font-mono text-xs tabular-nums ml-3">
                    {link.completionRate}%
                </span>
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

function detectWeakLinks(goals: GoalWithProgress[]): WeakLink[] {
    const weakLinks: WeakLink[] = []

    for (const goal of goals) {
        for (const habit of goal.habits) {
            if (habit.completion_rate < 40) {
                // Determine impact based on weight and goal importance
                const impact = habit.contribution_weight > 1 ? 'high' :
                               habit.completion_rate < 20 ? 'high' :
                               habit.completion_rate < 30 ? 'medium' : 'low'

                weakLinks.push({
                    goalTitle: goal.title,
                    habitName: habit.habit_name,
                    completionRate: habit.completion_rate,
                    impact,
                })
            }
        }
    }

    // Sort by impact and completion rate
    return weakLinks
        .sort((a, b) => {
            const impactOrder = { high: 0, medium: 1, low: 2 }
            if (impactOrder[a.impact] !== impactOrder[b.impact]) {
                return impactOrder[a.impact] - impactOrder[b.impact]
            }
            return a.completionRate - b.completionRate
        })
        .slice(0, 5)
}

function generateRecommendations(
    goals: GoalWithProgress[],
    weakLinks: WeakLink[],
    energyCorrelation: EnergyCorrelation[]
): Recommendation[] {
    const recommendations: Recommendation[] = []

    // 1. If there are weak links, recommend focusing on them
    if (weakLinks.length > 0) {
        const topWeakLink = weakLinks[0]
        recommendations.push({
            title: 'Address weak links',
            description: `${topWeakLink.habitName} is at ${topWeakLink.completionRate}% and affecting ${topWeakLink.goalTitle}. Consider breaking it into smaller steps.`,
            actionType: 'focus',
        })
    }

    // 2. Protect high-performing goals
    const strongGoals = goals.filter(g => g.progress >= 70)
    if (strongGoals.length > 0) {
        recommendations.push({
            title: 'Protect your progress',
            description: `${strongGoals[0].title} is at ${strongGoals[0].progress}%. Keep the momentum going!`,
            actionType: 'protect',
        })
    }

    // 3. Celebrate achievements
    const perfectHabits = goals
        .flatMap(g => g.habits)
        .filter(h => h.completion_rate === 100)
    if (perfectHabits.length > 0) {
        recommendations.push({
            title: 'Perfect streak',
            description: `${perfectHabits[0].habit_name} has 100% completion this week!`,
            actionType: 'celebrate',
        })
    }

    // 4. Energy-based recommendation
    if (energyCorrelation.length > 0) {
        const highEnergy = energyCorrelation.find(e => e.energy_level === 'high')
        const lowEnergy = energyCorrelation.find(e => e.energy_level === 'low')

        if (highEnergy && lowEnergy && highEnergy.avg_completion_rate > lowEnergy.avg_completion_rate * 1.3) {
            recommendations.push({
                title: 'Prioritize energy',
                description: `You complete ${Math.round(highEnergy.avg_completion_rate - lowEnergy.avg_completion_rate)}% more habits on high energy days. Sleep and recovery matter.`,
                actionType: 'investigate',
            })
        }
    }

    // 5. Goal balance check
    const avgProgress = goals.length > 0
        ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
        : 0
    const lowGoals = goals.filter(g => g.progress < avgProgress - 20)
    if (lowGoals.length > 0 && goals.length > 1) {
        recommendations.push({
            title: 'Rebalance focus',
            description: `${lowGoals[0].title} is behind other goals. Consider adjusting your daily priorities.`,
            actionType: 'investigate',
        })
    }

    return recommendations.slice(0, 4)
}
