'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface YesterdayData {
    completionRate: number
    completedCount: number
    totalHabits: number
    missedHabits: { id: string; name: string; category: string }[]
    notesFromYesterday: { habitName: string; note: string }[]
}

interface ExistingCheckin {
    id: string
    yesterday_reflection: string | null
    today_intention: string | null
    focus_habit_ids: string[] | null
}

interface HabitWithStats {
    id: string
    name: string
    category: string | null
    completionRate7d: number
    missedYesterday: boolean
}

interface CheckinClientProps {
    yesterdayData: YesterdayData
    existingCheckin: ExistingCheckin | null
    habitsWithStats: HabitWithStats[]
    serverDate: string
    userId: string
}

type Step = 'review' | 'reflection' | 'focus' | 'intention'

const STEPS: Step[] = ['review', 'reflection', 'focus', 'intention']

const STEP_TITLES: Record<Step, string> = {
    review: 'Yesterday',
    reflection: 'Reflect',
    focus: 'Focus',
    intention: 'Intention',
}

export function CheckinClient({
    yesterdayData,
    existingCheckin,
    habitsWithStats,
    serverDate,
    userId,
}: CheckinClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [currentStep, setCurrentStep] = useState<Step>('review')
    const [reflection, setReflection] = useState(existingCheckin?.yesterday_reflection || '')
    const [intention, setIntention] = useState(existingCheckin?.today_intention || '')
    const [focusHabitIds, setFocusHabitIds] = useState<string[]>(
        existingCheckin?.focus_habit_ids || []
    )
    const [isSaving, setIsSaving] = useState(false)

    const currentStepIndex = STEPS.indexOf(currentStep)
    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === STEPS.length - 1

    const goNext = useCallback(() => {
        if (!isLastStep) {
            setCurrentStep(STEPS[currentStepIndex + 1])
        }
    }, [currentStepIndex, isLastStep])

    const goBack = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep(STEPS[currentStepIndex - 1])
        }
    }, [currentStepIndex, isFirstStep])

    const toggleFocusHabit = useCallback((habitId: string) => {
        setFocusHabitIds(prev => {
            if (prev.includes(habitId)) {
                return prev.filter(id => id !== habitId)
            }
            if (prev.length >= 3) {
                return prev
            }
            return [...prev, habitId]
        })
    }, [])

    const handleSave = useCallback(async () => {
        setIsSaving(true)

        try {
            const checkinData = {
                user_id: userId,
                checkin_date: serverDate,
                yesterday_reflection: reflection || null,
                today_intention: intention || null,
                focus_habit_ids: focusHabitIds.length > 0 ? focusHabitIds : null,
                updated_at: new Date().toISOString(),
            }

            let error
            if (existingCheckin) {
                const result = await supabase
                    .from('daily_checkins')
                    .update(checkinData)
                    .eq('id', existingCheckin.id)
                error = result.error
            } else {
                const result = await supabase
                    .from('daily_checkins')
                    .insert(checkinData)
                error = result.error
            }

            if (error) {
                console.error('Failed to save check-in:', error)
                alert('Failed to save check-in. Make sure to run the database migration.')
                setIsSaving(false)
                return
            }

            // Full page reload to ensure fresh server data
            window.location.href = '/habits'
        } catch (error) {
            console.error('Failed to save check-in:', error)
            alert('Failed to save check-in.')
            setIsSaving(false)
        }
    }, [reflection, intention, focusHabitIds, existingCheckin, serverDate, userId, supabase])

    // Build suggested focus habits: missed yesterday first, then low completion rate
    const suggestedHabits = [...habitsWithStats]
        .sort((a, b) => {
            // Missed yesterday comes first
            if (a.missedYesterday && !b.missedYesterday) return -1
            if (!a.missedYesterday && b.missedYesterday) return 1
            // Then sort by lowest completion rate
            return a.completionRate7d - b.completionRate7d
        })
        .slice(0, 10)

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800">
                <div className="px-4 pt-safe">
                    <div className="h-14 flex items-center justify-between">
                        <button
                            onClick={() => router.push('/habits')}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-3 text-neutral-400"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-neutral-400">Daily Check-in</span>
                        <div className="w-11" />
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2 pb-3">
                        {STEPS.map((step, index) => (
                            <button
                                key={step}
                                onClick={() => setCurrentStep(step)}
                                className={`
                                    flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                                    transition-colors duration-150
                                    ${currentStep === step
                                        ? 'bg-neutral-800 text-neutral-50'
                                        : index < currentStepIndex
                                            ? 'text-emerald-500'
                                            : 'text-neutral-600'
                                    }
                                `}
                            >
                                {index < currentStepIndex && (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {STEP_TITLES[step]}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto">
                {currentStep === 'review' && (
                    <ReviewStep yesterdayData={yesterdayData} />
                )}

                {currentStep === 'reflection' && (
                    <ReflectionStep
                        reflection={reflection}
                        setReflection={setReflection}
                        completionRate={yesterdayData.completionRate}
                    />
                )}

                {currentStep === 'focus' && (
                    <FocusStep
                        suggestedHabits={suggestedHabits}
                        focusHabitIds={focusHabitIds}
                        toggleFocusHabit={toggleFocusHabit}
                    />
                )}

                {currentStep === 'intention' && (
                    <IntentionStep
                        intention={intention}
                        setIntention={setIntention}
                        focusHabitIds={focusHabitIds}
                        habitsWithStats={habitsWithStats}
                    />
                )}
            </main>

            {/* Footer navigation */}
            <footer className="sticky bottom-0 bg-neutral-950/95 backdrop-blur-sm border-t border-neutral-800">
                <div className="px-4 pb-safe">
                    <div className="h-16 flex items-center gap-3">
                        {!isFirstStep && (
                            <button
                                onClick={goBack}
                                className="
                                    min-h-[44px] px-4
                                    rounded-lg border border-neutral-800
                                    text-sm font-medium text-neutral-400
                                    active:bg-neutral-800 transition-colors
                                "
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={isLastStep ? handleSave : goNext}
                            disabled={isSaving}
                            className={`
                                flex-1 min-h-[44px] px-4
                                rounded-lg text-sm font-medium
                                transition-colors
                                ${isLastStep
                                    ? 'bg-emerald-600 text-white active:bg-emerald-700'
                                    : 'bg-neutral-800 text-neutral-50 active:bg-neutral-700'
                                }
                                disabled:opacity-50
                            `}
                        >
                            {isSaving ? 'Saving...' : isLastStep ? 'Complete Check-in' : 'Continue'}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

// Step Components

function ReviewStep({ yesterdayData }: { yesterdayData: YesterdayData }) {
    const { completionRate, completedCount, totalHabits, missedHabits, notesFromYesterday } = yesterdayData

    return (
        <div className="space-y-6">
            {/* Big summary */}
            <div className="text-center">
                <div className="text-6xl font-semibold text-neutral-50 font-mono tabular-nums">
                    {completionRate}%
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                    {completedCount} of {totalHabits} habits completed yesterday
                </p>
            </div>

            {/* Notes from yesterday (if any) */}
            {notesFromYesterday.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                        Your notes
                    </h3>
                    <div className="space-y-3">
                        {notesFromYesterday.map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <svg className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                <div>
                                    <span className="text-xs text-neutral-500">{item.habitName}:</span>
                                    <p className="text-sm text-neutral-300 italic">{item.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Missed habits summary */}
            {missedHabits.length > 0 && (
                <div>
                    <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                        Missed ({missedHabits.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {missedHabits.slice(0, 8).map(habit => (
                            <span
                                key={habit.id}
                                className="px-2.5 py-1 rounded-full text-xs bg-neutral-900 border border-neutral-800 text-neutral-400"
                            >
                                {habit.name}
                            </span>
                        ))}
                        {missedHabits.length > 8 && (
                            <span className="px-2.5 py-1 rounded-full text-xs text-neutral-600">
                                +{missedHabits.length - 8} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function ReflectionStep({
    reflection,
    setReflection,
    completionRate,
}: {
    reflection: string
    setReflection: (value: string) => void
    completionRate: number
}) {
    const prompt = completionRate >= 80
        ? "What helped you stay on track yesterday?"
        : completionRate >= 50
            ? "What got in the way of completing your habits?"
            : "What made yesterday challenging?"

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-neutral-50">
                    {prompt}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                    A brief reflection helps identify patterns.
                </p>
            </div>

            <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What went well? What could be better?"
                className="
                    w-full h-40 px-4 py-3
                    bg-neutral-900 border border-neutral-800 rounded-lg
                    text-sm text-neutral-50 placeholder-neutral-600
                    resize-none
                    focus:outline-none focus:border-neutral-700
                "
            />

            <p className="text-xs text-neutral-600 text-right">
                Optional - skip if you prefer
            </p>
        </div>
    )
}

function FocusStep({
    suggestedHabits,
    focusHabitIds,
    toggleFocusHabit,
}: {
    suggestedHabits: HabitWithStats[]
    focusHabitIds: string[]
    toggleFocusHabit: (id: string) => void
}) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-neutral-50">
                    Choose up to 3 focus habits
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                    Prioritizing missed habits and those needing attention.
                </p>
            </div>

            <div className="space-y-2">
                {suggestedHabits.map(habit => {
                    const isSelected = focusHabitIds.includes(habit.id)
                    const isDisabled = !isSelected && focusHabitIds.length >= 3

                    return (
                        <button
                            key={habit.id}
                            onClick={() => toggleFocusHabit(habit.id)}
                            disabled={isDisabled}
                            className={`
                                w-full min-h-[52px] px-4 py-3
                                flex items-center justify-between
                                rounded-lg border
                                transition-colors duration-150
                                ${isSelected
                                    ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-400'
                                    : isDisabled
                                        ? 'bg-neutral-900/50 border-neutral-800/50 text-neutral-600'
                                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 active:bg-neutral-800'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{habit.name}</span>
                                {habit.missedYesterday && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500/80">
                                        missed
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-neutral-600">
                                    {habit.completionRate7d}% 7d
                                </span>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            <p className="text-xs text-neutral-600 text-center">
                {focusHabitIds.length}/3 selected
            </p>
        </div>
    )
}

function IntentionStep({
    intention,
    setIntention,
    focusHabitIds,
    habitsWithStats,
}: {
    intention: string
    setIntention: (value: string) => void
    focusHabitIds: string[]
    habitsWithStats: HabitWithStats[]
}) {
    const focusHabits = habitsWithStats.filter(h => focusHabitIds.includes(h.id))

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-neutral-50">
                    Set your intention for today
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                    How will you show up for your habits?
                </p>
            </div>

            {focusHabits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {focusHabits.map(habit => (
                        <span
                            key={habit.id}
                            className="
                                px-2.5 py-1 rounded-full
                                text-xs font-medium
                                bg-emerald-950/50 border border-emerald-800/50 text-emerald-400
                            "
                        >
                            {habit.name}
                        </span>
                    ))}
                </div>
            )}

            <textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="I will complete my habits by..."
                className="
                    w-full h-32 px-4 py-3
                    bg-neutral-900 border border-neutral-800 rounded-lg
                    text-sm text-neutral-50 placeholder-neutral-600
                    resize-none
                    focus:outline-none focus:border-neutral-700
                "
            />

            <p className="text-xs text-neutral-600 text-right">
                Optional - skip if you prefer
            </p>
        </div>
    )
}
