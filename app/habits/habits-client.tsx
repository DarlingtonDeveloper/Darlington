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

    if (habits.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl mb-4">No habits found</div>
                    <div className="text-sm text-white/50">
                        Check that your database is set up correctly and habits are seeded.
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-white/10 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold">Daily Habits</h1>
                    <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>{completedCount} of {totalCount} completed</span>
                            <span className="font-bold">{percentage}%</span>
                        </div>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Habits List */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {categoryOrder.map(categoryKey => {
                    const categoryHabits = groupedHabits[categoryKey]
                    if (!categoryHabits || categoryHabits.length === 0) return null

                    return (
                        <div key={categoryKey} className="mb-8">
                            <h2 className="text-lg font-semibold capitalize mb-3 text-white/70">
                                {categoryKey}
                            </h2>
                            <div className="space-y-2">
                                {categoryHabits.map(habit => (
                                    <button
                                        key={habit.id}
                                        onClick={() => toggleHabit(habit)}
                                        className={`
                      w-full p-4 rounded-lg text-left transition-all
                      ${habit.completed_today
                                                ? 'bg-green-500/20 border-green-500/50'
                                                : 'bg-white/5 border-white/10'
                                            }
                      border hover:border-white/30
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                        flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center
                        ${habit.completed_today
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-white/30'
                                                }
                      `}>
                                                {habit.completed_today && (
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{habit.name}</div>
                                                {habit.completed_at && (
                                                    <div className="text-xs text-white/50 mt-1">
                                                        Completed at {new Date(habit.completed_at).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </div>
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

            {/* Daily Summary Section */}
            <div className="max-w-2xl mx-auto px-4 pb-8">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Daily Summary</h3>

                    {/* Energy Level */}
                    <div className="mb-4">
                        <label className="block text-sm text-white/70 mb-2">Energy Level</label>
                        <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setEnergyLevel(level)}
                                    className={`
                    flex-1 py-2 px-4 rounded-lg capitalize transition-all
                    ${energyLevel === level
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'
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
                        <label className="block text-sm text-white/70 mb-2">Notes</label>
                        <textarea
                            value={contextNotes}
                            onChange={(e) => setContextNotes(e.target.value)}
                            placeholder="How was your day? Any context..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                            rows={3}
                        />
                    </div>

                    <button
                        onClick={saveDailySummary}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all"
                    >
                        Save Daily Summary
                    </button>
                </div>
            </div>
        </div>
    )
}