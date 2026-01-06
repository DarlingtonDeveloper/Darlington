'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import { isToday, isYesterday, startOfDay, differenceInHours, format } from 'date-fns'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { DayNavigator } from '@/components/habits/day-navigator'
import { PartialComplete, usePartialComplete } from '@/components/habits/partial-complete'

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
    completion_percentage?: number
    notes?: string | null
}

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

interface HabitsClientProps {
    initialHabits: HabitWithStatus[]
    initialDate?: string
    hasCheckedInToday?: boolean
}

export function HabitsClient({ initialHabits, initialDate, hasCheckedInToday = false }: HabitsClientProps) {
    // Always use browser's local date for "today"
    const browserToday = format(new Date(), 'yyyy-MM-dd')
    const serverDateMatches = initialDate === browserToday

    const [habits, setHabits] = useState<HabitWithStatus[]>(serverDateMatches ? initialHabits : [])
    const [viewingDate, setViewingDate] = useState<Date>(new Date())
    const [isLoading, setIsLoading] = useState(!serverDateMatches)
    const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium')
    const [contextNotes, setContextNotes] = useState('')
    const [hasMounted, setHasMounted] = useState(false)

    // Partial completion modal state
    const { isOpen: isPartialOpen, targetHabitId, open: openPartial, close: closePartial } = usePartialComplete()

    // Determine edit permissions
    const now = new Date()
    const viewingIsToday = isToday(viewingDate)
    const viewingIsYesterday = isYesterday(viewingDate)
    const hoursSinceMidnight = differenceInHours(now, startOfDay(now))
    const canBackfill = viewingIsYesterday && hoursSinceMidnight < 24
    const canEdit = viewingIsToday || canBackfill

    // Format date for queries
    const dateString = format(viewingDate, 'yyyy-MM-dd')

    // Load habits for a specific date
    const loadHabitsForDate = useCallback(async (date: Date) => {
        setIsLoading(true)
        try {
            const targetDate = format(date, 'yyyy-MM-dd')

            // Get all active habits (don't filter by created_at since migrated data may predate habit creation)
            const { data: habitsData, error: habitsError } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', USER_ID)
                .eq('is_active', true)
                .order('display_order')

            if (habitsError) throw habitsError

            // Get completions for this date
            const { data: completionsData, error: completionsError } = await supabase
                .from('habit_completions')
                .select('*')
                .eq('user_id', USER_ID)
                .eq('completion_date', targetDate)

            if (completionsError) throw completionsError

            // Merge habits with completion status
            const habitsWithStatus: HabitWithStatus[] = (habitsData || []).map(habit => {
                const completion = completionsData?.find(c => c.habit_id === habit.id)
                return {
                    ...habit,
                    completed_today: !!completion,
                    completion_id: completion?.id,
                    completed_at: completion?.completed_at,
                    completion_percentage: completion?.completion_percentage ?? (completion ? 100 : 0),
                    notes: completion?.notes ?? null,
                }
            })

            setHabits(habitsWithStatus)
        } catch (error) {
            console.error('Error loading habits for date:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Re-fetch on mount if server date doesn't match browser date (timezone mismatch)
    useEffect(() => {
        if (!hasMounted) {
            setHasMounted(true)
            if (!serverDateMatches) {
                loadHabitsForDate(new Date())
            }
        }
    }, [hasMounted, serverDateMatches, loadHabitsForDate])

    // Handle date change
    const handleDateChange = useCallback((newDate: Date) => {
        setViewingDate(newDate)
        loadHabitsForDate(newDate)
    }, [loadHabitsForDate])

    // Navigation helpers
    const goToPrevDay = useCallback(() => {
        const prevDay = new Date(viewingDate)
        prevDay.setDate(prevDay.getDate() - 1)
        handleDateChange(prevDay)
    }, [viewingDate, handleDateChange])

    const goToNextDay = useCallback(() => {
        if (isToday(viewingDate)) return
        const nextDay = new Date(viewingDate)
        nextDay.setDate(nextDay.getDate() + 1)
        handleDateChange(nextDay)
    }, [viewingDate, handleDateChange])

    // Swipe handlers
    const swipeHandlers = useSwipeable({
        onSwipedLeft: goToNextDay,
        onSwipedRight: goToPrevDay,
        trackMouse: false,
        preventScrollOnSwipe: true,
        delta: 50,
    })

    async function toggleHabit(habit: HabitWithStatus) {
        if (!canEdit) return

        try {
            if (habit.completed_today && habit.completion_id) {
                // Uncomplete - delete the completion
                const { error } = await supabase
                    .from('habit_completions')
                    .delete()
                    .eq('id', habit.completion_id)

                if (error) throw error

                setHabits(habits.map(h =>
                    h.id === habit.id
                        ? { ...h, completed_today: false, completion_id: undefined, completed_at: undefined }
                        : h
                ))
            } else {
                // Complete - insert new completion
                const completedAt = viewingIsToday
                    ? new Date().toISOString()
                    : `${dateString}T12:00:00.000Z` // Noon for backfilled entries

                const { data, error } = await supabase
                    .from('habit_completions')
                    .insert({
                        habit_id: habit.id,
                        user_id: USER_ID,
                        completed_at: completedAt,
                        completion_date: dateString,
                    })
                    .select()
                    .single()

                if (error) throw error
                if (!data) throw new Error('No data returned from insert')

                setHabits(habits.map(h =>
                    h.id === habit.id
                        ? { ...h, completed_today: true, completion_id: data.id, completed_at: data.completed_at }
                        : h
                ))
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error('Error toggling habit:', error)
            alert(`Failed to update habit: ${errorMessage}`)
        }
    }

    // Handle partial completion with optional note
    async function handlePartialComplete(habitId: string, percentage: number, note?: string) {
        if (!canEdit) return

        const habit = habits.find(h => h.id === habitId)
        if (!habit) return

        try {
            if (percentage === 0) {
                // Clear completion
                if (habit.completion_id) {
                    const { error } = await supabase
                        .from('habit_completions')
                        .delete()
                        .eq('id', habit.completion_id)

                    if (error) throw error

                    setHabits(habits.map(h =>
                        h.id === habitId
                            ? { ...h, completed_today: false, completion_id: undefined, completed_at: undefined, completion_percentage: 0, notes: null }
                            : h
                    ))
                }
            } else if (habit.completion_id) {
                // Update existing completion
                const { error } = await supabase
                    .from('habit_completions')
                    .update({ completion_percentage: percentage, notes: note ?? null })
                    .eq('id', habit.completion_id)

                if (error) throw error

                setHabits(habits.map(h =>
                    h.id === habitId
                        ? { ...h, completion_percentage: percentage, notes: note ?? null }
                        : h
                ))
            } else {
                // Create new completion with percentage
                const completedAt = viewingIsToday
                    ? new Date().toISOString()
                    : `${dateString}T12:00:00.000Z`

                const { data, error } = await supabase
                    .from('habit_completions')
                    .insert({
                        habit_id: habitId,
                        user_id: USER_ID,
                        completed_at: completedAt,
                        completion_date: dateString,
                        completion_percentage: percentage,
                        notes: note ?? null,
                    })
                    .select()
                    .single()

                if (error) throw error
                if (!data) throw new Error('No data returned from insert')

                setHabits(habits.map(h =>
                    h.id === habitId
                        ? { ...h, completed_today: true, completion_id: data.id, completed_at: data.completed_at, completion_percentage: percentage, notes: note ?? null }
                        : h
                ))
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error('Error setting partial completion:', error)
            alert(`Failed to update habit: ${errorMessage}`)
        }
    }

    async function saveDailySummary() {
        if (!canEdit) return

        try {
            const completedCount = habits.filter(h => h.completed_today).length

            const { error } = await supabase
                .from('daily_summaries')
                .upsert({
                    user_id: USER_ID,
                    summary_date: dateString,
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

    // Calculate progress with partial completions
    const completionSum = habits.reduce((sum, h) => {
        if (!h.completed_today) return sum
        return sum + ((h.completion_percentage ?? 100) / 100)
    }, 0)
    const completedCount = habits.filter(h => h.completed_today).length
    const totalCount = habits.length
    const percentage = totalCount > 0 ? Math.round((completionSum / totalCount) * 100) : 0

    // Group habits by category
    const groupedHabits = habits.reduce((acc, habit) => {
        const category = habit.category || 'uncategorized'
        if (!acc[category]) acc[category] = []
        acc[category].push(habit)
        return acc
    }, {} as Record<string, HabitWithStatus[]>)

    const categoryOrder = ['morning', 'anytime', 'productivity', 'social', 'evening']

    const getCategoryStats = (categoryKey: string) => {
        const categoryHabits = groupedHabits[categoryKey] || []
        const completed = categoryHabits.filter(h => h.completed_today).length
        return { completed, total: categoryHabits.length }
    }

    if (habits.length === 0 && !isLoading) {
        return (
            <div className="min-h-full bg-neutral-950 text-neutral-50">
                {/* Header with date navigator */}
                <div className="bg-neutral-950 border-b border-neutral-800">
                    <div className="px-4 sm:px-6 py-4 sm:max-w-2xl sm:mx-auto">
                        <DayNavigator
                            currentDate={viewingDate}
                            onDateChange={handleDateChange}
                            canEdit={canEdit}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-center px-4 py-16 pb-safe">
                    <div className="text-center">
                        <div className="text-base font-medium mb-2 text-neutral-300">
                            No habits for this day
                        </div>
                        <div className="text-sm text-neutral-500">
                            {viewingIsToday
                                ? 'Check that your database is set up correctly.'
                                : 'No habits were tracked on this date.'}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div {...swipeHandlers} className="min-h-full bg-neutral-950 text-neutral-50">
            {/* Header with date navigator */}
            <div className="bg-neutral-950 border-b border-neutral-800">
                <div className="px-4 sm:px-6 py-4 sm:max-w-2xl sm:mx-auto">
                    <DayNavigator
                        currentDate={viewingDate}
                        onDateChange={handleDateChange}
                        canEdit={canEdit}
                    />
                    {/* Progress bar */}
                    <div className="mt-4 flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-base sm:text-sm tabular-nums text-neutral-400">
                                {completedCount}/{totalCount}
                            </span>
                            <span className="text-neutral-600">·</span>
                            <span className="font-mono text-base sm:text-sm tabular-nums text-neutral-300">
                                {percentage}%
                            </span>
                        </div>
                        {canBackfill && !viewingIsToday && (
                            <span className="text-xs text-amber-500/80 bg-amber-500/10 px-2 py-1 rounded">
                                Backfill
                            </span>
                        )}
                    </div>
                    <div className="h-1.5 sm:h-1 bg-neutral-800 rounded-sm overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${canEdit ? 'bg-emerald-500' : 'bg-neutral-600'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Check-in prompt - only show for today when not checked in */}
            {viewingIsToday && !hasCheckedInToday && !isLoading && (
                <div className="px-4 sm:px-6 pt-4 sm:max-w-2xl sm:mx-auto">
                    <Link
                        href="/habits/checkin"
                        className="
                            block w-full p-4 rounded-lg
                            bg-emerald-950/40 border border-emerald-800/50
                            active:bg-emerald-950/60 transition-colors duration-150
                            active:scale-[0.99] active:transition-transform
                        "
                    >
                        <div className="flex items-center gap-3">
                            <div className="
                                w-10 h-10 rounded-lg
                                bg-emerald-900/50 border border-emerald-800/50
                                flex items-center justify-center flex-shrink-0
                            ">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-emerald-300">
                                    Morning check-in
                                </div>
                                <div className="text-xs text-emerald-500/70 mt-0.5">
                                    Reflect on yesterday, set today&apos;s focus
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="px-4 sm:px-6 py-8 sm:max-w-2xl sm:mx-auto">
                    <div className="flex items-center justify-center">
                        <div className="text-neutral-500 text-sm">Loading...</div>
                    </div>
                </div>
            )}

            {/* Habits List */}
            {!isLoading && (
                <div className="px-4 sm:px-6 py-4 sm:max-w-2xl sm:mx-auto">
                    {categoryOrder.map(categoryKey => {
                        const categoryHabits = groupedHabits[categoryKey]
                        if (!categoryHabits || categoryHabits.length === 0) return null
                        const stats = getCategoryStats(categoryKey)

                        return (
                            <div key={categoryKey} className="mb-6 sm:mb-4">
                                <div className="flex items-center justify-between mb-3 sm:mb-2">
                                    <h2 className={`text-xs font-medium uppercase tracking-wide ${canEdit ? 'text-neutral-500' : 'text-neutral-600'}`}>
                                        {categoryKey}
                                    </h2>
                                    <span className={`font-mono text-xs tabular-nums ${canEdit ? 'text-neutral-600' : 'text-neutral-700'}`}>
                                        {stats.completed}/{stats.total}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {categoryHabits.map(habit => (
                                        <button
                                            key={habit.id}
                                            onClick={() => {
                                                if (habit.completed_today) {
                                                    // Open partial complete to adjust or clear
                                                    openPartial(habit.id)
                                                } else {
                                                    // Quick complete at 100%
                                                    toggleHabit(habit)
                                                }
                                            }}
                                            disabled={!canEdit}
                                            className={`
                                                w-full min-h-[52px] sm:min-h-0 px-4 py-3.5 sm:p-3 rounded-lg sm:rounded-md text-left
                                                transition-colors duration-150
                                                ${canEdit ? 'active:scale-[0.98] active:transition-transform' : 'cursor-default'}
                                                ${habit.completed_today
                                                    ? canEdit
                                                        ? 'bg-emerald-950/50 border-emerald-800/50'
                                                        : 'bg-neutral-900/50 border-neutral-800/50'
                                                    : canEdit
                                                        ? 'bg-neutral-900 border-neutral-800 active:bg-neutral-800'
                                                        : 'bg-neutral-900/50 border-neutral-800/50'
                                                }
                                                border
                                            `}
                                        >
                                            <div className="flex items-center gap-4 sm:gap-3">
                                                {/* Checkbox with progress indicator */}
                                                {habit.completed_today && (habit.completion_percentage ?? 100) < 100 ? (
                                                    // Partial completion - show circular progress
                                                    <div className="flex-shrink-0 w-6 h-6 sm:w-5 sm:h-5 relative">
                                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                                                            <circle
                                                                cx="12" cy="12" r="10"
                                                                fill="none"
                                                                className="stroke-neutral-700"
                                                                strokeWidth="2"
                                                            />
                                                            <circle
                                                                cx="12" cy="12" r="10"
                                                                fill="none"
                                                                className={canEdit ? 'stroke-emerald-500' : 'stroke-neutral-500'}
                                                                strokeWidth="2"
                                                                strokeDasharray={`${(habit.completion_percentage ?? 0) * 0.628} 100`}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    // Full completion or not completed - show checkbox
                                                    <div className={`
                                                        flex-shrink-0 w-6 h-6 sm:w-5 sm:h-5 rounded-md sm:rounded border-2 sm:border
                                                        flex items-center justify-center transition-colors duration-150
                                                        ${habit.completed_today
                                                            ? canEdit
                                                                ? 'bg-emerald-500 border-emerald-500'
                                                                : 'bg-neutral-600 border-neutral-600'
                                                            : canEdit
                                                                ? 'border-neutral-600'
                                                                : 'border-neutral-700'
                                                        }
                                                    `}>
                                                        {habit.completed_today && (
                                                            <svg className="w-4 h-4 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex-1 flex items-center justify-between min-w-0">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className={`text-base sm:text-sm font-medium truncate ${
                                                            canEdit
                                                                ? habit.completed_today ? 'text-neutral-300' : 'text-neutral-200'
                                                                : 'text-neutral-500'
                                                        }`}>
                                                            {habit.name}
                                                        </span>
                                                        {/* Note indicator */}
                                                        {habit.notes && (
                                                            <svg
                                                                className="w-3.5 h-3.5 flex-shrink-0 text-neutral-600"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={1.5}
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    {habit.completed_at && (
                                                        <span className={`font-mono text-sm sm:text-xs tabular-nums ml-3 flex-shrink-0 ${canEdit ? 'text-neutral-500' : 'text-neutral-600'}`}>
                                                            {(habit.completion_percentage ?? 100) < 100 && (
                                                                <span className="text-amber-500/80 mr-1">{habit.completion_percentage}%</span>
                                                            )}
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
            )}

            {/* Daily Summary Section - only show for editable days */}
            {canEdit && !isLoading && (
                <div className="px-4 sm:px-6 pb-safe sm:max-w-2xl sm:mx-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg sm:rounded-md p-4 mb-4">
                        <h3 className="text-base sm:text-sm font-medium text-neutral-300 mb-4 sm:mb-3">
                            Daily Summary
                            {canBackfill && !viewingIsToday && (
                                <span className="ml-2 text-xs text-amber-500/80">(Backfill)</span>
                            )}
                        </h3>

                        {/* Energy Level */}
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

                        {/* Save button */}
                        <button
                            onClick={saveDailySummary}
                            className="w-full min-h-[44px] sm:min-h-0 bg-neutral-800 active:bg-neutral-700 sm:hover:bg-neutral-700 text-neutral-200 text-base sm:text-sm font-medium py-3 sm:py-2.5 px-4 rounded-lg sm:rounded-md transition-colors duration-150 active:scale-[0.98]"
                        >
                            Save Summary
                        </button>
                    </div>
                </div>
            )}

            {/* Read-only notice for past days */}
            {!canEdit && !isLoading && (
                <div className="px-4 sm:px-6 pb-safe sm:max-w-2xl sm:mx-auto">
                    <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-lg p-4 text-center">
                        <span className="text-sm text-neutral-500">
                            This day is read-only. You can only edit today or yesterday (within 24 hours).
                        </span>
                    </div>
                </div>
            )}

            {/* Partial completion modal */}
            <PartialComplete
                isOpen={isPartialOpen}
                onClose={closePartial}
                onSelect={(percentage, note) => {
                    if (targetHabitId) {
                        handlePartialComplete(targetHabitId, percentage, note)
                    }
                }}
                currentPercentage={habits.find(h => h.id === targetHabitId)?.completion_percentage ?? 0}
                currentNote={habits.find(h => h.id === targetHabitId)?.notes}
                habitName={habits.find(h => h.id === targetHabitId)?.name}
            />
        </div>
    )
}
