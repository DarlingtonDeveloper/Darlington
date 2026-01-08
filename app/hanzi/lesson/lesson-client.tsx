'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { WordWithProgress } from '@/lib/hanzi/types'
import { getScoreChange } from '@/lib/hanzi/types'
import Link from 'next/link'

interface LessonClientProps {
  initialWords: WordWithProgress[]
}

export function LessonClient({ initialWords }: LessonClientProps) {
  const [words, setWords] = useState<WordWithProgress[]>(initialWords)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)

  const currentWord = words[currentIndex]
  const hasWords = words.length > 0
  const isComplete = currentIndex >= words.length

  const handleResponse = useCallback(
    async (gotIt: boolean) => {
      if (!currentWord || isLoading) return

      setIsLoading(true)

      try {
        // Update score in database
        const currentScore = currentWord.progress?.score ?? 0
        const scoreChange = getScoreChange('lesson', gotIt, currentScore)
        const newScore = currentScore + scoreChange

        await supabase
          .from('user_word_progress')
          .update({
            score: newScore,
            attempts: (currentWord.progress?.attempts ?? 0) + 1,
            correct_streak: gotIt
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
                    correct_streak: gotIt
                      ? (w.progress?.correct_streak ?? 0) + 1
                      : 0,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                }
              : w
          )
        )

        if (gotIt) {
          setCompletedCount(prev => prev + 1)
        }

        // Move to next word
        setCurrentIndex(prev => prev + 1)
        setShowAnswer(false)
      } catch (error) {
        console.error('Error updating progress:', error)
      }

      setIsLoading(false)
    },
    [currentWord, currentIndex, isLoading]
  )

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setCompletedCount(0)
  }, [])

  // Empty state
  if (!hasWords) {
    return (
      <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="size-16 rounded-full bg-emerald-900/30 flex items-center justify-center mb-4">
            <svg
              className="size-8 text-emerald-400"
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
          </div>
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            No Struggling Words
          </h2>
          <p className="text-neutral-400 mb-6">
            Great job! You don&apos;t have any words that need extra practice.
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
  if (isComplete) {
    return (
      <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="size-16 rounded-full bg-emerald-900/30 flex items-center justify-center mb-4">
            <svg
              className="size-8 text-emerald-400"
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
          </div>
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Lesson Complete!
          </h2>
          <p className="text-neutral-400 mb-6">
            You reviewed {words.length} struggling words.
            <br />
            {completedCount} marked as understood.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-50 hover:bg-neutral-700 transition-colors"
            >
              Practice Again
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
          {currentIndex + 1} of {words.length} struggling
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
        {/* Front: Hanzi only */}
        <div className="text-center">
          <span className="text-7xl sm:text-8xl font-normal">
            {currentWord.hanzi}
          </span>

          {showAnswer && (
            <div className="mt-8 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-2xl text-neutral-300">{currentWord.pinyin}</div>
              <div className="text-lg text-neutral-400">{currentWord.english}</div>

              {currentWord.mnemonic && (
                <div className="mt-6 p-4 rounded-lg bg-neutral-800/50 text-sm text-neutral-400">
                  <span className="text-neutral-500">Hint: </span>
                  {currentWord.mnemonic}
                </div>
              )}
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
              className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-medium transition-colors hover:bg-neutral-700 disabled:opacity-50"
            >
              Still Hard
            </button>
            <button
              onClick={() => handleResponse(true)}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              Got It (+1)
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
