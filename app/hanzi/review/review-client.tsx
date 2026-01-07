'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { WordWithProgress } from '@/lib/hanzi/types'
import { getScoreChange } from '@/lib/hanzi/types'
import Link from 'next/link'

interface ReviewClientProps {
  initialWords: WordWithProgress[]
}

export function ReviewClient({ initialWords }: ReviewClientProps) {
  const [words, setWords] = useState<WordWithProgress[]>(initialWords)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({
    correct: 0,
    incorrect: 0,
  })

  const currentWord = words[currentIndex]
  const hasWords = words.length > 0
  const isComplete = currentIndex >= words.length
  const reviewLimit = Math.min(10, words.length)

  const handleResponse = useCallback(
    async (correct: boolean) => {
      if (!currentWord || isLoading) return

      setIsLoading(true)

      try {
        // Update score in database - review mode has -2 penalty for incorrect
        const scoreChange = getScoreChange('review', correct)
        const newScore = (currentWord.progress?.score ?? 0) + scoreChange

        await supabase
          .from('user_word_progress')
          .update({
            score: newScore,
            attempts: (currentWord.progress?.attempts ?? 0) + 1,
            correct_streak: correct
              ? (currentWord.progress?.correct_streak ?? 0) + 1
              : 0,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentWord.progress?.id)

        // Update local state
        setWords(prev =>
          prev.map((w, i) =>
            i === currentIndex
              ? {
                  ...w,
                  progress: {
                    ...w.progress!,
                    score: newScore,
                    attempts: (w.progress?.attempts ?? 0) + 1,
                    correct_streak: correct
                      ? (w.progress?.correct_streak ?? 0) + 1
                      : 0,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                }
              : w
          )
        )

        setResults(prev => ({
          correct: prev.correct + (correct ? 1 : 0),
          incorrect: prev.incorrect + (correct ? 0 : 1),
        }))

        // Move to next word (only review up to limit)
        const nextIndex = currentIndex + 1
        if (nextIndex >= reviewLimit) {
          setCurrentIndex(reviewLimit) // Trigger complete state
        } else {
          setCurrentIndex(nextIndex)
        }
        setShowAnswer(false)
      } catch (error) {
        console.error('Error updating progress:', error)
      }

      setIsLoading(false)
    },
    [currentWord, currentIndex, isLoading, reviewLimit]
  )

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setResults({ correct: 0, incorrect: 0 })
  }, [])

  // Empty state
  if (!hasWords) {
    return (
      <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="size-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
            <svg
              className="size-8 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            No Mastered Words Yet
          </h2>
          <p className="text-neutral-400 mb-6">
            Keep practicing in Link Mode to master words.
            <br />
            Words with score 6+ will appear here for review.
          </p>
          <Link
            href="/hanzi"
            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-50 hover:bg-neutral-700 transition-colors"
          >
            Back to Link Mode
          </Link>
        </div>
      </div>
    )
  }

  // Complete state
  if (isComplete || currentIndex >= reviewLimit) {
    const accuracy =
      results.correct + results.incorrect > 0
        ? Math.round(
            (results.correct / (results.correct + results.incorrect)) * 100
          )
        : 0

    return (
      <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div
            className={cn(
              'size-16 rounded-full flex items-center justify-center mb-4',
              accuracy >= 80
                ? 'bg-emerald-900/30'
                : accuracy >= 50
                  ? 'bg-yellow-900/30'
                  : 'bg-red-900/30'
            )}
          >
            <span className="text-2xl font-bold text-neutral-50">
              {accuracy}%
            </span>
          </div>
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Review Complete!
          </h2>
          <p className="text-neutral-400 mb-6">
            {results.correct} correct, {results.incorrect} incorrect
            <br />
            {results.incorrect > 0 && (
              <span className="text-red-400">
                Incorrect words lost 2 points each
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-50 hover:bg-neutral-700 transition-colors"
            >
              Review More
            </button>
            <Link
              href="/hanzi"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              Back to Link Mode
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
      {/* Progress header */}
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-neutral-400">
          {currentIndex + 1} of {reviewLimit} to review
        </span>
        <span className="text-sm text-neutral-500">
          Score: {currentWord.progress?.score ?? 0}
        </span>
      </div>

      {/* Card */}
      <div
        className={cn(
          'relative bg-neutral-900 rounded-2xl border border-neutral-800 p-8 min-h-[400px] flex flex-col items-center justify-center transition-all duration-300',
          showAnswer && 'border-neutral-700'
        )}
        onClick={() => !showAnswer && setShowAnswer(true)}
      >
        {/* Show pinyin and ask for hanzi/meaning */}
        <div className="text-center">
          <div className="text-sm text-neutral-500 mb-4">
            What character is this?
          </div>
          <span className="text-4xl sm:text-5xl text-neutral-300">
            {currentWord.pinyin}
          </span>

          {showAnswer && (
            <div className="mt-8 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-7xl">{currentWord.hanzi}</div>
              <div className="text-lg text-neutral-400">{currentWord.english}</div>
            </div>
          )}
        </div>

        {!showAnswer && (
          <p className="absolute bottom-4 text-sm text-neutral-600">
            Tap to reveal
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-3 px-4 rounded-xl bg-neutral-800 text-neutral-50 font-medium transition-colors hover:bg-neutral-700"
          >
            Show Answer
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleResponse(false)}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-red-900/30 border border-red-800/50 text-red-300 font-medium transition-colors hover:bg-red-900/50 disabled:opacity-50"
            >
              Forgot (-2)
            </button>
            <button
              onClick={() => handleResponse(true)}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              Knew It (+1)
            </button>
          </div>
        )}
      </div>

      {/* Unit info */}
      <div className="mt-4 text-center text-xs text-neutral-600">
        Unit {currentWord.unit}: {currentWord.unit_name}
      </div>
    </div>
  )
}
