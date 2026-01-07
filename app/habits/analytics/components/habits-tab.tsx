'use client'

import { useState } from 'react'
import type { HabitStreak, Habit, CompletionTimePattern } from '@/types/database'
import { subDays, format, eachDayOfInterval } from 'date-fns'

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

interface HabitsTabProps {
    streaks: HabitStreak[]
    habits: Habit[]
    recentCompletions: HabitCompletion[]
    habitGoals: HabitWithGoals[]
    timePatterns: CompletionTimePattern[]
}

type SortOption = 'streak' | 'rate' | 'name' | 'category'

interface EnrichedHabit {
    id: string
    name: string
    category: string | null
    currentStreak: number
    rate7d: number
    last7Days: boolean[]
    typicalHour: number | null
    linkedGoals: Array<{ id: string; title: string }>
    recentNotes: string[]
}

export function HabitsTab({
    streaks,
    habits,
    recentCompletions,
    habitGoals,
    timePatterns,
}: HabitsTabProps) {
    const [sortBy, setSortBy] = useState<SortOption>('streak')
    const [selectedHabit, setSelectedHabit] = useState<EnrichedHabit | null>(null)

    // Build enriched habit data
    const today = new Date()
    const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today,
    }).map(d => format(d, 'yyyy-MM-dd'))

    const enrichedHabits: EnrichedHabit[] = habits.map(habit => {
        // Get streak for this habit
        const streakData = streaks.find(s => s.habit_id === habit.id)
        const currentStreak = streakData?.current_streak || 0

        // Get completions for last 7 days
        const habitCompletions = recentCompletions.filter(c => c.habit_id === habit.id)
        const completionDates = new Set(habitCompletions.map(c => c.completion_date))
        const last7DaysStatus = last7Days.map(date => completionDates.has(date))
        const completedDays = last7DaysStatus.filter(Boolean).length
        const rate7d = Math.round((completedDays / 7) * 100)

        // Get typical completion hour
        const habitTimePatterns = timePatterns.filter(p => p.habit_name === habit.name)
        let typicalHour: number | null = null
        if (habitTimePatterns.length > 0) {
            const maxPattern = habitTimePatterns.reduce((max, p) =>
                p.completion_count > max.completion_count ? p : max
            )
            typicalHour = maxPattern.hour_of_day
        }

        // Get linked goals (handle Supabase nested data - can be array or object)
        const habitGoalData = habitGoals.find(hg => hg.id === habit.id)
        const linkedGoals: Array<{ id: string; title: string }> = []
        if (habitGoalData?.goal_habits) {
            for (const gh of habitGoalData.goal_habits) {
                const goalsData = gh.goals as unknown
                if (Array.isArray(goalsData)) {
                    for (const g of goalsData) {
                        if (g && typeof g === 'object' && 'id' in g && 'title' in g) {
                            linkedGoals.push({ id: g.id as string, title: g.title as string })
                        }
                    }
                } else if (goalsData && typeof goalsData === 'object' && 'id' in goalsData && 'title' in goalsData) {
                    linkedGoals.push({ id: (goalsData as { id: string }).id, title: (goalsData as { title: string }).title })
                }
            }
        }

        // Get recent notes
        const recentNotes = habitCompletions
            .filter(c => c.notes)
            .slice(0, 3)
            .map(c => c.notes!)

        return {
            id: habit.id,
            name: habit.name,
            category: habit.category,
            currentStreak,
            rate7d,
            last7Days: last7DaysStatus,
            typicalHour,
            linkedGoals,
            recentNotes,
        }
    })

    // Sort habits
    const sortedHabits = [...enrichedHabits].sort((a, b) => {
        switch (sortBy) {
            case 'streak':
                return b.currentStreak - a.currentStreak
            case 'rate':
                return b.rate7d - a.rate7d
            case 'name':
                return a.name.localeCompare(b.name)
            case 'category':
                return (a.category || 'zzz').localeCompare(b.category || 'zzz')
            default:
                return 0
        }
    })

    return (
        <div className="space-y-4">
            {/* Sort Options */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {(['streak', 'rate', 'name', 'category'] as SortOption[]).map(option => (
                    <button
                        key={option}
                        onClick={() => setSortBy(option)}
                        className={`
                            px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap
                            transition-colors duration-150
                            ${sortBy === option
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                            }
                        `}
                    >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                ))}
            </div>

            {/* Habits List */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                {sortedHabits.map((habit, index) => (
                    <button
                        key={habit.id}
                        onClick={() => setSelectedHabit(habit)}
                        className={`
                            w-full text-left px-4 py-3 flex items-center gap-3
                            hover:bg-neutral-800/50 transition-colors duration-150
                            ${index < sortedHabits.length - 1 ? 'border-b border-neutral-800/50' : ''}
                        `}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-neutral-200 truncate">
                                {habit.name}
                            </div>
                            {habit.category && (
                                <div className="text-xs text-neutral-500 mt-0.5">
                                    {habit.category}
                                </div>
                            )}
                        </div>

                        {/* Mini Week View */}
                        <div className="flex gap-1">
                            {habit.last7Days.map((completed, i) => (
                                <div
                                    key={i}
                                    className={`
                                        w-2 h-2 rounded-full
                                        ${completed ? 'bg-emerald-500' : 'bg-neutral-700'}
                                    `}
                                    title={last7Days[i]}
                                />
                            ))}
                        </div>

                        {/* Rate */}
                        <span className={`
                            font-mono text-xs tabular-nums w-10 text-right
                            ${habit.rate7d >= 70 ? 'text-emerald-400' : habit.rate7d >= 40 ? 'text-amber-400' : 'text-neutral-500'}
                        `}>
                            {habit.rate7d}%
                        </span>

                        {/* Streak Badge */}
                        {habit.currentStreak > 0 && (
                            <span className="font-mono text-xs tabular-nums text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-1 rounded-md">
                                {habit.currentStreak}d
                            </span>
                        )}
                    </button>
                ))}

                {sortedHabits.length === 0 && (
                    <div className="text-center text-neutral-500 py-8 text-sm">
                        No habits found
                    </div>
                )}
            </div>

            {/* Habit Detail Sheet */}
            {selectedHabit && (
                <HabitDetailSheet
                    habit={selectedHabit}
                    last7Days={last7Days}
                    onClose={() => setSelectedHabit(null)}
                />
            )}
        </div>
    )
}

interface HabitDetailSheetProps {
    habit: EnrichedHabit
    last7Days: string[]
    onClose: () => void
}

function HabitDetailSheet({ habit, last7Days, onClose }: HabitDetailSheetProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-lg bg-neutral-900 border-t border-neutral-800 rounded-t-2xl max-h-[80vh] overflow-y-auto">
                {/* Handle */}
                <div className="sticky top-0 bg-neutral-900 pt-3 pb-2 flex justify-center">
                    <div className="w-10 h-1 bg-neutral-700 rounded-full" />
                </div>

                <div className="px-4 pb-8 space-y-6">
                    {/* Header */}
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-100">
                            {habit.name}
                        </h2>
                        {habit.category && (
                            <span className="text-xs text-neutral-500">{habit.category}</span>
                        )}
                    </div>

                    {/* Streak Comparison */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-neutral-800/50 rounded-lg p-3">
                            <div className="font-mono text-2xl tabular-nums text-emerald-400">
                                {habit.currentStreak}d
                            </div>
                            <div className="text-xs text-neutral-500 uppercase tracking-wide">
                                Current Streak
                            </div>
                        </div>
                        <div className="bg-neutral-800/50 rounded-lg p-3">
                            <div className="font-mono text-2xl tabular-nums text-neutral-200">
                                {habit.rate7d}%
                            </div>
                            <div className="text-xs text-neutral-500 uppercase tracking-wide">
                                7-Day Rate
                            </div>
                        </div>
                    </div>

                    {/* Week Calendar */}
                    <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-3">
                            Last 7 Days
                        </h3>
                        <div className="flex gap-2 justify-between">
                            {last7Days.map((date, i) => {
                                const completed = habit.last7Days[i]
                                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
                                const dayNum = new Date(date).getDate()
                                return (
                                    <div key={date} className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] text-neutral-600">{dayName}</span>
                                        <div className={`
                                            w-8 h-8 rounded-md flex items-center justify-center
                                            font-mono text-xs tabular-nums
                                            ${completed
                                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                                : 'bg-neutral-800 text-neutral-500'
                                            }
                                        `}>
                                            {dayNum}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Typical Time */}
                    {habit.typicalHour !== null && (
                        <div className="bg-neutral-800/50 rounded-lg p-3">
                            <div className="text-sm text-neutral-300">
                                Usually completed around{' '}
                                <span className="font-mono text-emerald-400">
                                    {formatHour(habit.typicalHour)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Linked Goals */}
                    {habit.linkedGoals.length > 0 && (
                        <div>
                            <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">
                                Linked Goals
                            </h3>
                            <div className="space-y-1">
                                {habit.linkedGoals.map(goal => (
                                    <div
                                        key={goal.id}
                                        className="text-sm text-neutral-400 bg-neutral-800/50 px-3 py-2 rounded-md"
                                    >
                                        {goal.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Notes */}
                    {habit.recentNotes.length > 0 && (
                        <div>
                            <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">
                                Recent Notes
                            </h3>
                            <div className="space-y-2">
                                {habit.recentNotes.map((note, i) => (
                                    <div
                                        key={i}
                                        className="text-sm text-neutral-400 bg-neutral-800/50 px-3 py-2 rounded-md"
                                    >
                                        &ldquo;{note}&rdquo;
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-sm font-medium text-neutral-400 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

function formatHour(hour: number): string {
    if (hour === 0) return '12:00 AM'
    if (hour === 12) return '12:00 PM'
    if (hour < 12) return `${hour}:00 AM`
    return `${hour - 12}:00 PM`
}
