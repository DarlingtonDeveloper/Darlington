'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface PartialCompleteOption {
    value: number
    label: string
}

const DEFAULT_OPTIONS: PartialCompleteOption[] = [
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' },
]

interface PartialCompleteProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (percentage: number) => void
    currentPercentage?: number
    options?: PartialCompleteOption[]
    habitName?: string
}

export function PartialComplete({
    isOpen,
    onClose,
    onSelect,
    currentPercentage = 0,
    options = DEFAULT_OPTIONS,
    habitName,
}: PartialCompleteProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    // Close when clicking outside
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }, [onClose])

    const handleSelect = useCallback((percentage: number) => {
        onSelect(percentage)
        onClose()
    }, [onSelect, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="
                    relative z-10 w-full sm:max-w-[320px]
                    bg-neutral-900 border border-neutral-800
                    rounded-t-2xl sm:rounded-xl
                    pb-safe sm:pb-0
                    animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95
                    duration-200
                "
            >
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-neutral-800">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base sm:text-sm font-semibold text-neutral-50 truncate">
                                {habitName ? `${habitName}` : 'Completion'}
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                How much did you complete?
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="
                                min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]
                                flex items-center justify-center
                                rounded-lg text-neutral-500
                                active:bg-neutral-800 active:text-neutral-300
                                transition-colors duration-150
                                -mr-2
                            "
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Percentage Options */}
                <div className="p-3 space-y-2">
                    {options.map((option) => {
                        const isSelected = currentPercentage === option.value
                        const isComplete = option.value === 100

                        return (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`
                                    w-full min-h-[52px] sm:min-h-[44px]
                                    px-4 py-3 sm:py-2.5
                                    rounded-lg sm:rounded-md
                                    flex items-center justify-between
                                    transition-colors duration-150
                                    active:scale-[0.98] active:transition-transform
                                    ${isSelected
                                        ? isComplete
                                            ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-400'
                                            : 'bg-neutral-800 border-neutral-700 text-neutral-200'
                                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 active:bg-neutral-800'
                                    }
                                    border
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Progress indicator */}
                                    <div className="w-8 h-8 sm:w-7 sm:h-7 relative flex-shrink-0">
                                        {/* Background circle */}
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="15"
                                                fill="none"
                                                className="stroke-neutral-800"
                                                strokeWidth="3"
                                            />
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="15"
                                                fill="none"
                                                className={isSelected && isComplete ? 'stroke-emerald-500' : isSelected ? 'stroke-neutral-400' : 'stroke-neutral-600'}
                                                strokeWidth="3"
                                                strokeDasharray={`${option.value * 0.94} 100`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-base sm:text-sm font-medium">
                                        {option.label}
                                    </span>
                                </div>

                                {/* Checkmark for selected */}
                                {isSelected && (
                                    <div className={`
                                        w-6 h-6 sm:w-5 sm:h-5 rounded-full
                                        flex items-center justify-center
                                        ${isComplete ? 'bg-emerald-500' : 'bg-neutral-600'}
                                    `}>
                                        <svg className="w-4 h-4 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Clear completion option */}
                {currentPercentage > 0 && (
                    <div className="px-3 pb-3">
                        <button
                            onClick={() => handleSelect(0)}
                            className="
                                w-full min-h-[44px] sm:min-h-[40px]
                                px-4 py-2.5
                                rounded-lg sm:rounded-md
                                text-base sm:text-sm font-medium
                                text-neutral-500
                                border border-neutral-800
                                active:bg-neutral-800 active:text-neutral-300
                                transition-colors duration-150
                                active:scale-[0.98]
                            "
                        >
                            Clear completion
                        </button>
                    </div>
                )}

                {/* Handle for mobile bottom sheet */}
                <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2">
                    <div className="w-10 h-1 rounded-full bg-neutral-700" />
                </div>
            </div>
        </div>
    )
}

// Hook for managing partial complete state
export function usePartialComplete() {
    const [isOpen, setIsOpen] = useState(false)
    const [targetHabitId, setTargetHabitId] = useState<string | null>(null)

    const open = useCallback((habitId: string) => {
        setTargetHabitId(habitId)
        setIsOpen(true)
    }, [])

    const close = useCallback(() => {
        setIsOpen(false)
        // Delay clearing target to allow for animation
        setTimeout(() => setTargetHabitId(null), 200)
    }, [])

    return {
        isOpen,
        targetHabitId,
        open,
        close,
    }
}

// Utility component for triggering partial complete via long press
interface LongPressWrapperProps {
    onLongPress: () => void
    onTap: () => void
    disabled?: boolean
    children: React.ReactNode
    className?: string
}

export function LongPressWrapper({
    onLongPress,
    onTap,
    disabled = false,
    children,
    className,
}: LongPressWrapperProps) {
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const isLongPressRef = useRef(false)

    const handleTouchStart = useCallback(() => {
        if (disabled) return
        isLongPressRef.current = false
        timerRef.current = setTimeout(() => {
            isLongPressRef.current = true
            onLongPress()
        }, 500) // 500ms for long press
    }, [disabled, onLongPress])

    const handleTouchEnd = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        if (!isLongPressRef.current && !disabled) {
            onTap()
        }
        isLongPressRef.current = false
    }, [disabled, onTap])

    const handleTouchCancel = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        isLongPressRef.current = false
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchCancel}
            className={className}
        >
            {children}
        </div>
    )
}
