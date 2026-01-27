'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { WordWithProgress, WordType } from '@/lib/hanzi/types'
import { WORD_TYPE_LABELS, getWordStatus } from '@/lib/hanzi/types'

interface WordTypeSelectorProps {
  words: WordWithProgress[]
  selectedType: WordType | 'all'
  onSelectType: (type: WordType | 'all') => void
  onClose: () => void
}

// Get progress for each word type
function getWordTypeProgress(words: WordWithProgress[]) {
  const typeProgress: Map<
    WordType,
    {
      type: WordType
      label: string
      totalWords: number
      wordsSeen: number
      mastered: number
      familiar: number
      learning: number
      struggling: number
    }
  > = new Map()

  // Initialize all word types
  const wordTypes = Object.keys(WORD_TYPE_LABELS) as WordType[]
  wordTypes.forEach(type => {
    typeProgress.set(type, {
      type,
      label: WORD_TYPE_LABELS[type],
      totalWords: 0,
      wordsSeen: 0,
      mastered: 0,
      familiar: 0,
      learning: 0,
      struggling: 0,
    })
  })

  // Count words by type
  words.forEach(word => {
    const type = word.word_type
    if (!type) return

    const progress = typeProgress.get(type)
    if (!progress) return

    progress.totalWords++

    if (word.progress) {
      progress.wordsSeen++
      const status = getWordStatus(word.progress.score)
      if (status === 'mastered') progress.mastered++
      else if (status === 'familiar') progress.familiar++
      else if (status === 'learning') progress.learning++
      else if (status === 'struggling') progress.struggling++
    }
  })

  // Filter to only types with words and sort by word count
  return Array.from(typeProgress.values())
    .filter(p => p.totalWords > 0)
    .sort((a, b) => b.totalWords - a.totalWords)
}

export function WordTypeSelector({
  words,
  selectedType,
  onSelectType,
  onClose,
}: WordTypeSelectorProps) {
  const typeProgress = useMemo(() => getWordTypeProgress(words), [words])

  // Calculate "All" totals
  const allTotals = useMemo(() => {
    return typeProgress.reduce(
      (acc, p) => ({
        totalWords: acc.totalWords + p.totalWords,
        wordsSeen: acc.wordsSeen + p.wordsSeen,
        mastered: acc.mastered + p.mastered,
        familiar: acc.familiar + p.familiar,
        learning: acc.learning + p.learning,
        struggling: acc.struggling + p.struggling,
      }),
      { totalWords: 0, wordsSeen: 0, mastered: 0, familiar: 0, learning: 0, struggling: 0 }
    )
  }, [typeProgress])

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-50">
          Word Types
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

      {/* Type list */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {/* All Types option */}
        <button
          onClick={() => onSelectType('all')}
          className={cn(
            'w-full p-4 rounded-xl border text-left transition-all',
            selectedType === 'all'
              ? 'bg-neutral-800 border-neutral-600'
              : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
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
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium text-neutral-50">
                All Types
              </span>
              {selectedType === 'all' && (
                <span className="text-xs text-emerald-400">Selected</span>
              )}
            </div>
            <span className="text-xs text-neutral-500">
              {allTotals.totalWords} words
            </span>
          </div>

          {/* Progress bar */}
          {allTotals.totalWords > 0 && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{
                      width: `${Math.round(((allTotals.mastered + allTotals.familiar) / allTotals.totalWords) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {Math.round(((allTotals.mastered + allTotals.familiar) / allTotals.totalWords) * 100)}%
                </span>
              </div>

              {allTotals.wordsSeen > 0 && (
                <div className="flex items-center gap-4 mt-3 text-xs">
                  {allTotals.mastered > 0 && (
                    <span className="text-emerald-400">{allTotals.mastered} mastered</span>
                  )}
                  {allTotals.familiar > 0 && (
                    <span className="text-blue-400">{allTotals.familiar} familiar</span>
                  )}
                </div>
              )}
            </>
          )}
        </button>

        {/* Individual types */}
        {typeProgress.map(type => {
          const progressPercent =
            type.totalWords > 0
              ? Math.round(((type.mastered + type.familiar) / type.totalWords) * 100)
              : 0

          const isSelected = selectedType === type.type

          return (
            <button
              key={type.type}
              onClick={() => onSelectType(type.type)}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                isSelected
                  ? 'bg-neutral-800 border-neutral-600'
                  : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-400">
                    {type.totalWords}
                  </span>
                  <span className="text-sm font-medium text-neutral-50">
                    {type.label}
                  </span>
                  {isSelected && (
                    <span className="text-xs text-emerald-400">Selected</span>
                  )}
                </div>
                <span className="text-xs text-neutral-500">
                  {type.totalWords} words
                </span>
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
              {type.wordsSeen > 0 && (
                <div className="flex items-center gap-4 mt-3 text-xs">
                  {type.mastered > 0 && (
                    <span className="text-emerald-400">{type.mastered} mastered</span>
                  )}
                  {type.familiar > 0 && (
                    <span className="text-blue-400">{type.familiar} familiar</span>
                  )}
                  {type.learning > 0 && (
                    <span className="text-neutral-400">{type.learning} learning</span>
                  )}
                  {type.struggling > 0 && (
                    <span className="text-red-400">{type.struggling} struggling</span>
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
