'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { RoundResult, Word } from '@/lib/hanzi/types'

interface ResultModalProps {
  results: RoundResult[]
  words: Word[]
  score: number
  onClose: () => void
  onNextRound: () => void
}

export function ResultModal({
  results,
  words,
  score,
  onClose,
  onNextRound,
}: ResultModalProps) {
  const correctCount = results.filter(r => r.wasCorrect).length
  const totalCount = results.length
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-neutral-900 rounded-t-2xl sm:rounded-2xl border border-neutral-800 shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className={cn(
                'text-4xl font-bold mb-2',
                score > 0
                  ? 'text-emerald-400'
                  : score < 0
                    ? 'text-red-400'
                    : 'text-neutral-400'
              )}
            >
              {score > 0 ? '+' : ''}
              {score}
            </div>
            <div className="text-neutral-400 text-sm">
              {correctCount}/{totalCount} correct ({percentage}%)
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
            {results.map(result => {
              const word = words.find(w => w.id === result.wordId)
              if (!word) return null

              return (
                <div
                  key={result.wordId}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    result.wasCorrect
                      ? 'bg-emerald-950/30 border border-emerald-800/30'
                      : 'bg-red-950/30 border border-red-800/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{word.hanzi}</span>
                    <div>
                      <div className="text-sm text-neutral-300">
                        {word.pinyin}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {word.english}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      result.wasCorrect ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {result.wasCorrect ? '+1' : '-1'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-medium transition-colors hover:bg-neutral-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose()
                onNextRound()
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium transition-colors hover:bg-emerald-500"
            >
              Next Round
            </button>
          </div>
        </div>

        {/* Safe area padding for iOS */}
        <div className="pb-safe" />
      </div>
    </div>
  )
}
