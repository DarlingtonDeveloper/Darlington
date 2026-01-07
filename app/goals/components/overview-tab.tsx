'use client'

import type { GoalWithProgress } from '../page'

interface OverviewTabProps {
    goals: GoalWithProgress[]
}

export function OverviewTab({ goals }: OverviewTabProps) {
    // Calculate overall progress (average across all goals)
    const overallProgress = goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
        : 0

    // Goals at risk (below 40% progress)
    const goalsAtRisk = goals
        .filter(g => g.progress < 40)
        .sort((a, b) => a.progress - b.progress)

    // Top performing habits across all goals
    const allHabits = goals.flatMap(g => g.habits)
    const topHabits = [...allHabits]
        .sort((a, b) => b.completion_rate - a.completion_rate)
        .slice(0, 5)

    // Weak habits (dragging down progress)
    const weakHabits = [...allHabits]
        .filter(h => h.completion_rate < 40)
        .sort((a, b) => a.completion_rate - b.completion_rate)
        .slice(0, 3)

    const hasGoals = goals.length > 0

    return (
        <div className="space-y-4">
            {/* Overall Progress */}
            {hasGoals && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Overall Goal Progress
                        </h2>
                        <span className="text-xs text-neutral-500">
                            {goals.length} active goal{goals.length !== 1 ? 's' : ''}
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
                                    strokeDasharray={`${(overallProgress / 100) * 176} 176`}
                                    className={
                                        overallProgress >= 70 ? 'text-emerald-500' :
                                        overallProgress >= 40 ? 'text-amber-500' :
                                        'text-neutral-600'
                                    }
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center font-mono text-sm tabular-nums text-neutral-50">
                                {overallProgress}%
                            </span>
                        </div>
                        <div>
                            <div className="font-mono text-2xl tabular-nums text-neutral-50">
                                {overallProgress}%
                            </div>
                            <div className="text-xs text-neutral-500">average progress</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Goals at Risk */}
            {goalsAtRisk.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-amber-500 mb-3">
                        Goals at Risk
                    </h2>
                    <div className="space-y-2">
                        {goalsAtRisk.map((goal) => (
                            <div key={goal.id} className="flex items-center justify-between py-1">
                                <span className="text-sm text-neutral-300 truncate flex-1 mr-3">
                                    {goal.title}
                                </span>
                                <span className="font-mono text-xs tabular-nums text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2 py-1 rounded-md">
                                    {goal.progress}%
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-amber-600 mt-3">
                        Focus on linked habits to improve these goals
                    </p>
                </div>
            )}

            {/* Goal Progress Chart */}
            {hasGoals && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                        Progress by Goal
                    </h2>
                    <div className="space-y-3">
                        {goals.map((goal) => (
                            <div key={goal.id} className="flex items-center gap-3">
                                <span className="w-24 text-xs text-neutral-400 truncate">
                                    {goal.title}
                                </span>
                                <div className="flex-1 h-5 bg-neutral-800 rounded-sm overflow-hidden">
                                    <div
                                        className={`h-full rounded-sm transition-all duration-300 ${
                                            goal.progress >= 70 ? 'bg-emerald-500' :
                                            goal.progress >= 40 ? 'bg-amber-500' :
                                            'bg-neutral-600'
                                        }`}
                                        style={{ width: `${goal.progress}%` }}
                                    />
                                </div>
                                <span className={`font-mono text-xs tabular-nums w-10 text-right ${
                                    goal.progress >= 70 ? 'text-emerald-400' :
                                    goal.progress >= 40 ? 'text-amber-400' :
                                    'text-neutral-400'
                                }`}>
                                    {goal.progress}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Performing Habits */}
            {topHabits.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-3">
                        Top Performing Habits
                    </h2>
                    <div className="space-y-2">
                        {topHabits.map((habit, i) => (
                            <div key={`${habit.habit_id}-${i}`} className="flex items-center justify-between py-1">
                                <span className="text-sm text-neutral-300 truncate flex-1 mr-3">
                                    {habit.habit_name}
                                </span>
                                <span className={`font-mono text-xs tabular-nums ${
                                    habit.completion_rate >= 70 ? 'text-emerald-400' :
                                    habit.completion_rate >= 40 ? 'text-amber-400' :
                                    'text-neutral-400'
                                }`}>
                                    {habit.completion_rate}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weak Habits */}
            {weakHabits.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-3">
                        Needs Attention
                    </h2>
                    <div className="space-y-2">
                        {weakHabits.map((habit, i) => (
                            <div key={`${habit.habit_id}-${i}`} className="flex items-center justify-between py-1">
                                <span className="text-sm text-neutral-400 truncate flex-1 mr-3">
                                    {habit.habit_name}
                                </span>
                                <span className="font-mono text-xs tabular-nums text-neutral-500">
                                    {habit.completion_rate}%
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-600 mt-3">
                        These habits are dragging down your goal progress
                    </p>
                </div>
            )}

            {/* Empty State */}
            {!hasGoals && (
                <div className="bg-neutral-900/50 border border-neutral-800/50 border-dashed rounded-lg p-6 text-center">
                    <div className="text-neutral-500 text-sm">
                        No goals to track
                    </div>
                    <div className="text-neutral-600 text-xs mt-2">
                        Add goals to see your progress here
                    </div>
                </div>
            )}
        </div>
    )
}
