'use client'

import type { GoalWithProgress } from '../page'

interface GoalsTabProps {
    goals: GoalWithProgress[]
}

export function GoalsTab({ goals }: GoalsTabProps) {
    if (goals.length === 0) {
        return (
            <div className="py-12 text-center text-neutral-500">
                <p className="text-sm">No goals found.</p>
                <p className="text-xs mt-1">Goals can be added via the database.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
            ))}
        </div>
    )
}

function GoalCard({ goal }: { goal: GoalWithProgress }) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800/50">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-neutral-100 uppercase tracking-wide">
                            {goal.title}
                        </h2>
                        {goal.description && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {goal.description}
                            </p>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        <span className={`
                            text-lg font-semibold font-mono tabular-nums
                            ${goal.progress >= 70 ? 'text-emerald-400' : goal.progress >= 40 ? 'text-amber-400' : 'text-neutral-400'}
                        `}>
                            {goal.progress}%
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className={`
                            h-full rounded-full transition-all duration-300
                            ${goal.progress >= 70 ? 'bg-emerald-500' : goal.progress >= 40 ? 'bg-amber-500' : 'bg-neutral-600'}
                        `}
                        style={{ width: `${goal.progress}%` }}
                    />
                </div>
            </div>

            {/* Habits list */}
            <div className="bg-neutral-950/50">
                {goal.habits.map((habit, index) => (
                    <div
                        key={habit.habit_id}
                        className={`
                            flex items-center gap-3 px-4 py-2.5
                            ${index < goal.habits.length - 1 ? 'border-b border-neutral-800/30' : ''}
                        `}
                    >
                        {/* Tree connector */}
                        <span className="text-neutral-700 text-xs w-3 flex-shrink-0">
                            {index === goal.habits.length - 1 ? '└' : '├'}
                        </span>

                        {/* Weight indicator */}
                        {habit.contribution_weight > 1 && (
                            <span className="text-amber-500 text-xs flex-shrink-0" title="Higher weight">
                                ★
                            </span>
                        )}

                        {/* Habit name */}
                        <span className="flex-1 text-sm text-neutral-400 truncate">
                            {habit.habit_name}
                            {habit.contribution_weight > 1 && (
                                <span className="text-neutral-600 text-xs ml-1">
                                    ({habit.contribution_weight}x)
                                </span>
                            )}
                        </span>

                        {/* Completions count */}
                        <span className="text-xs text-neutral-600 font-mono tabular-nums flex-shrink-0">
                            {habit.completions_7d}/7
                        </span>

                        {/* Completion rate */}
                        <span className={`
                            text-xs font-mono tabular-nums w-10 text-right flex-shrink-0
                            ${habit.completion_rate >= 70 ? 'text-emerald-500' : habit.completion_rate >= 40 ? 'text-amber-500' : 'text-neutral-500'}
                        `}>
                            {habit.completion_rate}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
