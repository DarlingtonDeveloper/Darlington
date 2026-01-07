'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { LinkItem } from '@/lib/hanzi/types'

interface LinkItemCardProps {
  item: LinkItem
  isSelected: boolean
  isConnected: boolean
  isComplete: boolean
  isCorrect: boolean | null
  isSubmitted: boolean
  onSelect: (item: LinkItem) => void
  onLongPress: (item: LinkItem) => void
}

export function LinkItemCard({
  item,
  isSelected,
  isConnected,
  isComplete,
  isCorrect,
  isSubmitted,
  onSelect,
  onLongPress,
}: LinkItemCardProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true
      onLongPress(item)
    }, 500)
  }, [item, onLongPress])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    if (!isLongPress.current) {
      onSelect(item)
    }
  }, [item, onSelect])

  const handleClick = useCallback(() => {
    onSelect(item)
  }, [item, onSelect])

  // Determine styling based on state
  const getStyles = () => {
    if (isSubmitted && isCorrect === true) {
      return 'bg-emerald-950/50 border-emerald-500/50 text-emerald-50'
    }
    if (isSubmitted && isCorrect === false) {
      return 'bg-red-950/50 border-red-500/50 text-red-50'
    }
    if (isComplete) {
      return 'bg-violet-950/50 border-violet-500/50 text-violet-50'
    }
    if (isConnected) {
      return 'bg-blue-950/50 border-blue-500/50 text-blue-50'
    }
    if (isSelected) {
      return 'bg-neutral-800 border-neutral-500 text-neutral-50'
    }
    return 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-700'
  }

  return (
    <button
      id={item.id}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
      }}
      className={cn(
        'relative flex items-center justify-center',
        'min-h-[52px] px-2 py-3 rounded-xl',
        'border transition-all duration-150',
        'select-none touch-manipulation',
        getStyles(),
        isSubmitted && 'pointer-events-none'
      )}
    >
      <span
        className={cn(
          'text-center leading-tight',
          item.type === 'hanzi'
            ? 'text-2xl sm:text-3xl font-normal'
            : item.type === 'pinyin'
              ? 'text-base sm:text-lg'
              : 'text-sm sm:text-base'
        )}
      >
        {item.content}
      </span>

      {/* Connection indicator dot */}
      {isConnected && !isSubmitted && (
        <span
          className={cn(
            'absolute top-1 right-1 size-2 rounded-full',
            isComplete ? 'bg-violet-400' : 'bg-blue-400'
          )}
        />
      )}

      {/* Result indicator */}
      {isSubmitted && isCorrect !== null && (
        <span className="absolute top-1 right-1">
          {isCorrect ? (
            <svg
              className="size-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="size-4 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </span>
      )}
    </button>
  )
}
