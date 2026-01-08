'use client'

import { useRef } from 'react'

export interface HabitStep {
    id: string
    habit_id: string
    name: string
    display_order: number
    duration_seconds: number | null
    description: string | null
}

export interface HabitStepWithStatus extends HabitStep {
    completed: boolean
}

interface HabitStepsProps {
    habitName: string
    steps: HabitStepWithStatus[]
    isExpanded: boolean
    onToggleExpand: () => void
    onToggleStep: (stepId: string, currentlyCompleted: boolean) => void
    onCompleteAll: () => void
    onOpenDetails?: () => void
    disabled?: boolean
    canEdit?: boolean
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return ''
    const minutes = Math.round(seconds / 60)
    return `${minutes} min`
}

export function HabitSteps({
    habitName,
    steps,
    isExpanded,
    onToggleExpand,
    onToggleStep,
    onCompleteAll,
    onOpenDetails,
    disabled = false,
    canEdit = true,
}: HabitStepsProps) {
    // Double-click detection
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    function handleHeaderClick() {
        if (!canEdit) return

        if (clickTimeoutRef.current) {
            // Double-click: open details modal
            clearTimeout(clickTimeoutRef.current)
            clickTimeoutRef.current = null
            onOpenDetails?.()
        } else {
            // First click: set timeout for expand/collapse
            clickTimeoutRef.current = setTimeout(() => {
                onToggleExpand()
                clickTimeoutRef.current = null
            }, 300)
        }
    }

    const completedCount = steps.filter(s => s.completed).length
    const totalCount = steps.length
    const allCompleted = completedCount === totalCount
    const someCompleted = completedCount > 0 && !allCompleted

    // Get last completed step for collapsed view
    const lastCompletedStep = [...steps]
        .filter(s => s.completed)
        .sort((a, b) => b.display_order - a.display_order)[0]

    return (
        <div className={`
            rounded-lg sm:rounded-md overflow-hidden
            transition-colors duration-150
            ${allCompleted
                ? canEdit
                    ? 'bg-emerald-950/50 border-emerald-800/50'
                    : 'bg-neutral-900/50 border-neutral-800/50'
                : canEdit
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-neutral-900/50 border-neutral-800/50'
            }
            border
        `}>
            {/* Header - always visible */}
            <button
                onClick={handleHeaderClick}
                disabled={disabled}
                className={`
                    w-full min-h-[52px] sm:min-h-0 px-4 py-3.5 sm:p-3 text-left
                    flex items-center gap-4 sm:gap-3
                    transition-colors duration-150
                    ${canEdit ? 'active:bg-neutral-800/50' : 'cursor-default'}
                `}
            >
                {/* Progress indicator */}
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
                            className={allCompleted && canEdit ? 'stroke-emerald-500' : someCompleted && canEdit ? 'stroke-amber-500' : 'stroke-neutral-500'}
                            strokeWidth="2"
                            strokeDasharray={`${(completedCount / totalCount) * 62.8} 100`}
                            strokeLinecap="round"
                        />
                    </svg>
                    {allCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className={`w-3 h-3 ${canEdit ? 'text-emerald-500' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Habit name and step info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-base sm:text-sm font-medium truncate ${
                            canEdit
                                ? allCompleted ? 'text-neutral-300' : 'text-neutral-200'
                                : 'text-neutral-500'
                        }`}>
                            {habitName}
                        </span>
                    </div>
                    {!isExpanded && lastCompletedStep && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-neutral-600 text-xs">└</span>
                            <span className={`text-xs truncate ${canEdit ? 'text-neutral-500' : 'text-neutral-600'}`}>
                                {lastCompletedStep.name}
                            </span>
                            <svg className={`w-3 h-3 flex-shrink-0 ${canEdit ? 'text-emerald-500' : 'text-neutral-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Step counter and chevron */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`font-mono text-sm sm:text-xs tabular-nums ${canEdit ? 'text-neutral-500' : 'text-neutral-600'}`}>
                        {completedCount}/{totalCount}
                    </span>
                    <svg
                        className={`w-4 h-4 transition-transform duration-200 ${canEdit ? 'text-neutral-500' : 'text-neutral-600'} ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Expanded steps list */}
            {isExpanded && (
                <div className="border-t border-neutral-800">
                    <div className="bg-neutral-950/50">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => onToggleStep(step.id, step.completed)}
                                disabled={disabled || !canEdit}
                                className={`
                                    w-full px-4 py-3 sm:py-2.5 text-left
                                    flex items-center gap-3
                                    border-b border-neutral-800/50 last:border-b-0
                                    transition-colors duration-150
                                    ${canEdit ? 'active:bg-neutral-800/30' : 'cursor-default'}
                                `}
                            >
                                {/* Step checkbox */}
                                <div className={`
                                    flex-shrink-0 w-5 h-5 sm:w-4 sm:h-4 rounded-md sm:rounded border
                                    flex items-center justify-center transition-colors duration-150
                                    ${step.completed
                                        ? canEdit
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'bg-neutral-600 border-neutral-600'
                                        : canEdit
                                            ? 'border-neutral-600'
                                            : 'border-neutral-700'
                                    }
                                `}>
                                    {step.completed && (
                                        <svg className="w-3 h-3 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>

                                {/* Step name */}
                                <span className={`flex-1 text-sm truncate ${
                                    canEdit
                                        ? step.completed ? 'text-neutral-400' : 'text-neutral-300'
                                        : 'text-neutral-500'
                                }`}>
                                    {step.name}
                                </span>

                                {/* Duration */}
                                {step.duration_seconds && (
                                    <span className={`font-mono text-xs tabular-nums flex-shrink-0 ${canEdit ? 'text-neutral-600' : 'text-neutral-700'}`}>
                                        {formatDuration(step.duration_seconds)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Complete All button */}
                    {canEdit && !allCompleted && (
                        <div className="p-3 border-t border-neutral-800">
                            <button
                                onClick={onCompleteAll}
                                disabled={disabled}
                                className="
                                    w-full min-h-[44px] sm:min-h-[40px]
                                    px-4 py-2.5
                                    bg-neutral-800 active:bg-neutral-700
                                    text-neutral-300 text-sm font-medium
                                    rounded-lg sm:rounded-md
                                    transition-colors duration-150
                                    active:scale-[0.98]
                                "
                            >
                                Complete All
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
