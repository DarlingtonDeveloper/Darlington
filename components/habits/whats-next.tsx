'use client'

import { useState, useCallback, useMemo } from 'react'

// Base habit properties needed for the What's Next feature
interface BaseHabit {
    id: string
    name: string
    category: string | null
    display_order: number
    completed_today: boolean
}

interface WhatsNextProps<T extends BaseHabit> {
    habits: T[]
    focusHabitIds: string[]
    onComplete: (habit: T) => void
    skippedIds: string[]
    onSkip: (habitId: string) => void
}

interface ScoredHabit<T extends BaseHabit> {
    habit: T
    score: number
    reason: string
}

function getNextHabit<T extends BaseHabit>(
    habits: T[],
    focusHabitIds: string[],
    skippedIds: string[],
    currentHour: number
): ScoredHabit<T> | null {
    // Filter to incomplete, non-skipped habits
    const incomplete = habits.filter(h =>
        !h.completed_today && !skippedIds.includes(h.id)
    )

    if (incomplete.length === 0) return null

    // Determine time bucket
    const timeBucket = currentHour < 12 ? 'morning' : currentHour < 17 ? 'anytime' : 'evening'

    // Score each habit
    const scored = incomplete.map(habit => {
        let score = 0
        let reason = ''

        // Focus habits get highest priority (+100)
        if (focusHabitIds.includes(habit.id)) {
            score += 100
            reason = "Today's focus"
        }

        // Time-appropriate category (+50)
        if (habit.category === timeBucket) {
            score += 50
            if (!reason) {
                reason = timeBucket === 'morning'
                    ? 'Morning habit'
                    : timeBucket === 'evening'
                        ? 'Evening habit'
                        : 'Good time for this'
            }
        }

        // Anytime category gets partial boost (+25)
        if (habit.category === 'anytime') {
            score += 25
            if (!reason) reason = 'Anytime habit'
        }

        // Display order as tiebreaker
        score -= habit.display_order * 0.1

        return { habit, score, reason: reason || 'Next up' }
    })

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)
    return scored[0] || null
}

export function WhatsNext<T extends BaseHabit>({
    habits,
    focusHabitIds,
    onComplete,
    skippedIds,
    onSkip,
}: WhatsNextProps<T>) {
    const currentHour = new Date().getHours()

    // Get the suggested habit
    const suggestion = useMemo(() =>
        getNextHabit(habits, focusHabitIds, skippedIds, currentHour),
        [habits, focusHabitIds, skippedIds, currentHour]
    )

    // Get the next habit after the current suggestion (for preview)
    const nextUp = useMemo(() => {
        if (!suggestion) return null
        const tempSkipped = [...skippedIds, suggestion.habit.id]
        return getNextHabit(habits, focusHabitIds, tempSkipped, currentHour)
    }, [habits, focusHabitIds, skippedIds, currentHour, suggestion])

    // Don't render if no suggestion
    if (!suggestion) {
        return null
    }

    const isFocusHabit = focusHabitIds.includes(suggestion.habit.id)

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    What&apos;s next?
                </h3>
            </div>

            {/* Suggested Habit */}
            <div className="mb-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isFocusHabit
                            ? 'bg-emerald-900/50 border border-emerald-800/50'
                            : 'bg-neutral-800 border border-neutral-700'
                        }
                    `}>
                        {isFocusHabit ? (
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                        )}
                    </div>

                    {/* Habit Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-neutral-100 truncate">
                            {suggestion.habit.name}
                        </h4>
                        <p className={`text-xs mt-0.5 ${isFocusHabit ? 'text-emerald-400' : 'text-neutral-500'}`}>
                            {suggestion.reason}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => onComplete(suggestion.habit)}
                    className="
                        flex-1 min-h-[44px]
                        bg-emerald-600 active:bg-emerald-700
                        text-white text-sm font-medium
                        rounded-lg
                        transition-colors duration-150
                        active:scale-[0.98] active:transition-transform
                    "
                >
                    Complete
                </button>
                <button
                    onClick={() => onSkip(suggestion.habit.id)}
                    className="
                        flex-1 min-h-[44px]
                        border border-neutral-700 active:bg-neutral-800
                        text-neutral-400 active:text-neutral-300 text-sm font-medium
                        rounded-lg
                        transition-colors duration-150
                        active:scale-[0.98] active:transition-transform
                    "
                >
                    Skip for now
                </button>
            </div>

            {/* Next Up Preview */}
            {nextUp && (
                <div className="mt-3 pt-3 border-t border-neutral-800">
                    <p className="text-xs text-neutral-500">
                        <span className="text-neutral-600">Up next:</span>{' '}
                        <span className="text-neutral-400">{nextUp.habit.name}</span>
                    </p>
                </div>
            )}
        </div>
    )
}

// Hook for managing skip state
export function useWhatsNext() {
    const [skippedIds, setSkippedIds] = useState<string[]>([])

    const skip = useCallback((id: string) => {
        setSkippedIds(prev => [...prev, id])
    }, [])

    const resetSkips = useCallback(() => {
        setSkippedIds([])
    }, [])

    return { skippedIds, skip, resetSkips }
}
