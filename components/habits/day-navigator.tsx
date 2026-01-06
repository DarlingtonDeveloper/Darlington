'use client'

import { format, isToday, isYesterday, differenceInDays } from 'date-fns'

interface DayNavigatorProps {
    currentDate: Date
    onDateChange: (date: Date) => void
    oldestDate?: Date
    canEdit: boolean
}

function getRelativeLabel(date: Date): string {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'

    const daysAgo = differenceInDays(new Date(), date)
    if (daysAgo <= 6) return `${daysAgo} days ago`

    return format(date, 'EEE, MMM d')
}

export function DayNavigator({
    currentDate,
    onDateChange,
    oldestDate,
    canEdit,
}: DayNavigatorProps) {
    const isViewingToday = isToday(currentDate)
    const canGoForward = !isViewingToday
    const canGoBack = !oldestDate || currentDate > oldestDate

    const goToPrevDay = () => {
        if (!canGoBack) return
        const prevDay = new Date(currentDate)
        prevDay.setDate(prevDay.getDate() - 1)
        onDateChange(prevDay)
    }

    const goToNextDay = () => {
        if (!canGoForward) return
        const nextDay = new Date(currentDate)
        nextDay.setDate(nextDay.getDate() + 1)
        onDateChange(nextDay)
    }

    return (
        <div className="flex items-center justify-between">
            {/* Left arrow */}
            <button
                onClick={goToPrevDay}
                disabled={!canGoBack}
                className={`
                    min-h-[44px] min-w-[44px] flex items-center justify-center
                    rounded-lg transition-colors duration-150
                    ${canGoBack
                        ? 'text-neutral-400 active:bg-neutral-800 active:text-neutral-200'
                        : 'text-neutral-700 cursor-not-allowed'
                    }
                `}
                aria-label="Previous day"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Date display */}
            <div className="flex flex-col items-center">
                <span className="text-base sm:text-sm font-semibold text-neutral-50">
                    {getRelativeLabel(currentDate)}
                </span>
                {!isToday(currentDate) && (
                    <span className="font-mono text-xs tabular-nums text-neutral-500">
                        {format(currentDate, 'MMM d, yyyy')}
                    </span>
                )}
                {!canEdit && (
                    <span className="text-[10px] uppercase tracking-wide text-neutral-600 mt-1">
                        Read-only
                    </span>
                )}
            </div>

            {/* Right arrow */}
            <button
                onClick={goToNextDay}
                disabled={!canGoForward}
                className={`
                    min-h-[44px] min-w-[44px] flex items-center justify-center
                    rounded-lg transition-colors duration-150
                    ${canGoForward
                        ? 'text-neutral-400 active:bg-neutral-800 active:text-neutral-200'
                        : 'text-neutral-700 cursor-not-allowed'
                    }
                `}
                aria-label="Next day"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    )
}
