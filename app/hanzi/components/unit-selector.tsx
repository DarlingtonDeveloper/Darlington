'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { WordWithProgress } from '@/lib/hanzi/types'
import { getSectionProgress, canUnlockNextUnit } from '@/lib/hanzi/progression'

interface UnitSelectorProps {
  words: WordWithProgress[]
  currentUnit: number
  onSelectUnit: (unit: number) => void
  onClose: () => void
}

export function UnitSelector({
  words,
  currentUnit,
  onSelectUnit,
  onClose,
}: UnitSelectorProps) {
  const unitProgress = useMemo(
    () => getSectionProgress(words, 1, currentUnit),
    [words, currentUnit]
  )

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-50">
          Section 1 Units
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <svg
            className="size-5 text-neutral-400"
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
        </button>
      </div>

      {/* Unit list */}
      <div className="space-y-3">
        {unitProgress.map(unit => {
          const progressPercent =
            unit.totalWords > 0
              ? Math.round(
                  ((unit.mastered + unit.familiar) / unit.totalWords) * 100
                )
              : 0

          const isActive = unit.unit === currentUnit

          // Check if this unit can be selected
          // A unit is selectable if it's unlocked (unit <= currentUnit)
          // or if the previous unit is complete (80% familiar)
          let canSelect = unit.isUnlocked
          if (!canSelect && unit.unit === currentUnit + 1) {
            // Check if previous unit allows unlock
            const prevUnitWords = words.filter(
              w => w.section === 1 && w.unit === currentUnit
            )
            canSelect = canUnlockNextUnit(prevUnitWords)
          }

          return (
            <button
              key={`${unit.section}-${unit.unit}`}
              onClick={() => canSelect && onSelectUnit(unit.unit)}
              disabled={!canSelect}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                isActive
                  ? 'bg-neutral-800 border-neutral-600'
                  : canSelect
                    ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
                    : 'bg-neutral-900/50 border-neutral-800/50 opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {unit.isComplete ? (
                    <span className="size-5 rounded-full bg-emerald-600 flex items-center justify-center">
                      <svg
                        className="size-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : !canSelect ? (
                    <span className="size-5 rounded-full bg-neutral-700 flex items-center justify-center">
                      <svg
                        className="size-3 text-neutral-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-7V9a4 4 0 00-8 0v1"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="size-5 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-400">
                      {unit.unit}
                    </span>
                  )}
                  <span className="text-sm font-medium text-neutral-50">
                    Unit {unit.unit}
                  </span>
                  {isActive && (
                    <span className="text-xs text-emerald-400">Current</span>
                  )}
                </div>
                <span className="text-xs text-neutral-500">
                  {unit.totalWords} words
                </span>
              </div>

              <div className="text-sm text-neutral-400 mb-3">
                {unit.unitName}
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              {/* Stats row */}
              {unit.wordsSeen > 0 && (
                <div className="flex items-center gap-4 mt-3 text-xs">
                  {unit.mastered > 0 && (
                    <span className="text-emerald-400">
                      {unit.mastered} mastered
                    </span>
                  )}
                  {unit.familiar > 0 && (
                    <span className="text-blue-400">
                      {unit.familiar} familiar
                    </span>
                  )}
                  {unit.learning > 0 && (
                    <span className="text-neutral-400">
                      {unit.learning} learning
                    </span>
                  )}
                  {unit.struggling > 0 && (
                    <span className="text-red-400">
                      {unit.struggling} struggling
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
