'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Habit {
    id: string
    user_id: string
    name: string
    description: string | null
    category: string | null
    target_frequency: string
    display_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

interface HabitWithStatus extends Habit {
    completed_today: boolean
    completion_id?: string
    completed_at?: string
}

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

interface HabitsClientProps {
    initialHabits: HabitWithStatus[]
}

export function HabitsClient({ initialHabits }: HabitsClientProps) {
    const [habits, setHabits] = useState<HabitWithStatus[]>(initialHabits)
    const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium')
    const [contextNotes, setContextNotes] = useState('')

    async function toggleHabit(habit: HabitWithStatus) {
        try {
            if (habit.completed_today && habit.completion_id) {
                // Uncomplete - delete the completion
                const { error } = await supabase
                    .from('habit_completions')
                    .delete()
                    .eq('id', habit.completion_id)

                if (error) {
                    console.error('DELETE error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    })
                    throw error
                }

                // Update local state
                setHabits(habits.map(h =>
                    h.id === habit.id
                        ? { ...h, completed_today: false, completion_id: undefined, completed_at: undefined }
                        : h
                ))
            } else {
                // Complete - insert new completion
                const { data, error } = await supabase
                    .from('habit_completions')
                    .insert({
                        habit_id: habit.id,
                        user_id: USER_ID,
                        completed_at: new Date().toISOString(),
                        completion_date: new Date().toISOString().split('T')[0],
                    })
                    .select()
                    .single()

                if (error) {
                    console.error('INSERT error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    })
                    throw error
                }

                if (!data) {
                    throw new Error('No data returned from insert')
                }

                // Update local state
                setHabits(habits.map(h =>
                    h.id === habit.id
                        ? { ...h, completed_today: true, completion_id: data.id, completed_at: data.completed_at }
                        : h
                ))
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error('Error toggling habit:', error)
            console.error('Full error object:', JSON.stringify(error, null, 2))
            alert(`Failed to update habit: ${errorMessage}`)
        }
    }

    async function saveDailySummary() {
        try {
            const today = new Date().toISOString().split('T')[0]
            const completedCount = habits.filter(h => h.completed_today).length

            const { error } = await supabase
                .from('daily_summaries')
                .upsert({
                    user_id: USER_ID,
                    summary_date: today,
                    total_habits: habits.length,
                    completed_count: completedCount,
                    energy_level: energyLevel,
                    context_notes: contextNotes,
                })

            if (error) throw error

            alert('Daily summary saved!')
        } catch (error) {
            console.error('Error saving summary:', error)
            alert('Failed to save summary. Check console for details.')
        }
    }

    const completedCount = habits.filter(h => h.completed_today).length
    const totalCount = habits.length
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    // Group habits by category
    const groupedHabits = habits.reduce((acc, habit) => {
        const category = habit.category || 'uncategorized'
        if (!acc[category]) acc[category] = []
        acc[category].push(habit)
        return acc
    }, {} as Record<string, HabitWithStatus[]>)

    const categoryOrder = ['morning', 'anytime', 'productivity', 'social', 'evening']

    // Calculate category completion counts
    const getCategoryStats = (categoryKey: string) => {
        const categoryHabits = groupedHabits[categoryKey] || []
        const completed = categoryHabits.filter(h => h.completed_today).length
        return { completed, total: categoryHabits.length }
    }

    if (habits.length === 0) {
        return (
            <div className="min-h-full bg-neutral-950 text-neutral-50 flex items-center justify-center px-4 pb-safe">
                <div className="text-center">
                    <div className="text-base font-medium mb-2 text-neutral-300">No habits found</div>
                    <div className="text-sm text-neutral-500">
                        Check that your database is set up correctly and habits are seeded.
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
                    <div className="flex items-baseline justify-between">
                        <h1 className="text-xl sm:text-lg font-semibold tracking-tight">Daily Habits</h1>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-base sm:text-sm tabular-nums text-neutral-400">
                                {completedCount}/{totalCount}
                            </span>
                            <span className="text-neutral-600">·</span>
                            <span className="font-mono text-base sm:text-sm tabular-nums text-neutral-300">
                                {percentage}%
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 sm:h-1 bg-neutral-800 rounded-sm overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Habits List */}
            <div className="px-4 sm:px-6 py-4 sm:max-w-2xl sm:mx-auto">
                {categoryOrder.map(categoryKey => {
                    const categoryHabits = groupedHabits[categoryKey]
                    if (!categoryHabits || categoryHabits.length === 0) return null
                    const stats = getCategoryStats(categoryKey)

                    return (
                        <div key={categoryKey} className="mb-6 sm:mb-4">
                            <div className="flex items-center justify-between mb-3 sm:mb-2">
                                <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                    {categoryKey}
                                </h2>
                                <span className="font-mono text-xs tabular-nums text-neutral-600">
                                    {stats.completed}/{stats.total}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {categoryHabits.map(habit => (
                                    <button
                                        key={habit.id}
                                        onClick={() => toggleHabit(habit)}
                                        className={`
                                            w-full min-h-[52px] sm:min-h-0 px-4 py-3.5 sm:p-3 rounded-lg sm:rounded-md text-left
                                            transition-colors duration-150
                                            active:scale-[0.98] active:transition-transform
                                            ${habit.completed_today
                                                ? 'bg-emerald-950/50 border-emerald-800/50'
                                                : 'bg-neutral-900 border-neutral-800 active:bg-neutral-800'
                                            }
                                            border
                                        `}
                                    >
                                        <div className="flex items-center gap-4 sm:gap-3">
                                            {/* Checkbox - 24px on mobile for touch, 20px on desktop */}
                                            <div className={`
                                                flex-shrink-0 w-6 h-6 sm:w-5 sm:h-5 rounded-md sm:rounded border-2 sm:border
                                                flex items-center justify-center transition-colors duration-150
                                                ${habit.completed_today
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-neutral-600'
                                                }
                                            `}>
                                                {habit.completed_today && (
                                                    <svg className="w-4 h-4 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 flex items-center justify-between min-w-0">
                                                <span className={`text-base sm:text-sm font-medium truncate ${habit.completed_today ? 'text-neutral-300' : 'text-neutral-200'}`}>
                                                    {habit.name}
                                                </span>
                                                {habit.completed_at && (
                                                    <span className="font-mono text-sm sm:text-xs tabular-nums text-neutral-500 ml-3 flex-shrink-0">
                                                        {new Date(habit.completed_at).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Daily Summary Section - with safe area for home indicator */}
            <div className="px-4 sm:px-6 pb-safe sm:max-w-2xl sm:mx-auto">
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg sm:rounded-md p-4 mb-4">
                    <h3 className="text-base sm:text-sm font-medium text-neutral-300 mb-4 sm:mb-3">Daily Summary</h3>

                    {/* Energy Level - 44px min touch targets */}
                    <div className="mb-4">
                        <label className="block text-xs text-neutral-500 mb-2">Energy Level</label>
                        <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setEnergyLevel(level)}
                                    className={`
                                        flex-1 min-h-[44px] sm:min-h-0 py-3 sm:py-2 px-3 rounded-lg sm:rounded-md
                                        text-base sm:text-sm font-medium capitalize
                                        transition-colors duration-150 active:scale-[0.98]
                                        ${energyLevel === level
                                            ? 'bg-neutral-800 text-neutral-200'
                                            : 'bg-neutral-900 text-neutral-500 border border-neutral-800 active:bg-neutral-800'
                                        }
                                    `}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Context Notes */}
                    <div className="mb-4">
                        <label className="block text-xs text-neutral-500 mb-2">Notes</label>
                        <textarea
                            value={contextNotes}
                            onChange={(e) => setContextNotes(e.target.value)}
                            placeholder="How was your day? Any context..."
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg sm:rounded-md p-4 sm:p-3 text-base sm:text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-150 resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Save button - 44px min height for touch */}
                    <button
                        onClick={saveDailySummary}
                        className="w-full min-h-[44px] sm:min-h-0 bg-neutral-800 active:bg-neutral-700 sm:hover:bg-neutral-700 text-neutral-200 text-base sm:text-sm font-medium py-3 sm:py-2.5 px-4 rounded-lg sm:rounded-md transition-colors duration-150 active:scale-[0.98]"
                    >
                        Save Summary
                    </button>
                </div>
            </div>
        </div>
    )
}