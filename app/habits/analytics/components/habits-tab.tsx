'use client'

import type { HabitStreak } from '@/types/database'

interface HabitsTabProps {
    streaks: HabitStreak[]
}

export function HabitsTab({ streaks }: HabitsTabProps) {
    const sortedStreaks = [...streaks].sort((a, b) => b.current_streak - a.current_streak)

    return (
        <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-4">
                    All Habits
                </h2>
                <div className="space-y-3">
                    {sortedStreaks.map((habit) => (
                        <div
                            key={habit.habit_id}
                            className="flex items-center justify-between py-2 border-b border-neutral-800/50 last:border-0"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-neutral-200 truncate">
                                    {habit.habit_name}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 ml-3">
                                <span className="font-mono text-xs tabular-nums text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-1 rounded-md">
                                    {habit.current_streak}d
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                {sortedStreaks.length === 0 && (
                    <div className="text-center text-neutral-500 py-8 text-sm">
                        No habit data yet
                    </div>
                )}
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800/50 border-dashed rounded-lg p-6 text-center">
                <div className="text-neutral-500 text-sm">
                    Detailed habit analytics coming soon
                </div>
                <div className="text-neutral-600 text-xs mt-1">
                    Sort by streak, rate, trend + calendar heatmap
                </div>
            </div>
        </div>
    )
}
