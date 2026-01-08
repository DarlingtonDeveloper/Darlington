'use client'

import { useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { WordWithProgress } from '@/lib/hanzi/types'
import Link from 'next/link'

interface ReviewClientProps {
  initialWords: WordWithProgress[]
  allHanzi: string[]
}

// Shuffle array helper
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function ReviewClient({ initialWords, allHanzi }: ReviewClientProps) {
  const [words, setWords] = useState<WordWithProgress[]>(initialWords)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionScore, setSessionScore] = useState(0)
  const [results, setResults] = useState<{ correct: number; incorrect: number; revealed: number }>({
    correct: 0,
    incorrect: 0,
    revealed: 0,
  })

  const currentWord = words[currentIndex]
  const hasWords = words.length > 0
  const isComplete = currentIndex >= words.length
  const reviewLimit = Math.min(10, words.length)

  // Generate 12 hanzi options (1 correct + 11 random wrong)
  const hanziOptions = useMemo(() => {
    if (!currentWord) return []

    // Get other hanzi characters (not the current one) from full pool
    const otherHanzi = allHanzi.filter(h => h !== currentWord.hanzi)

    // Pick 11 random wrong answers
    const wrongAnswers = shuffle(otherHanzi).slice(0, 11)

    // Combine with correct answer and shuffle
    return shuffle([currentWord.hanzi, ...wrongAnswers])
  }, [currentWord, allHanzi])

  const updateScore = useCallback(
    async (scoreChange: number, wasCorrect: boolean | null) => {
      if (!currentWord || isLoading) return

      setIsLoading(true)

      try {
        const currentScore = currentWord.progress?.score ?? 0
        const newScore = currentScore + scoreChange

        await supabase
          .from('user_word_progress')
          .update({
            score: newScore,
            attempts: (currentWord.progress?.attempts ?? 0) + 1,
            correct_streak: wasCorrect === true
              ? (currentWord.progress?.correct_streak ?? 0) + 1
              : wasCorrect === false
                ? 0
                : currentWord.progress?.correct_streak ?? 0,
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
                    correct_streak: wasCorrect === true
                      ? (w.progress?.correct_streak ?? 0) + 1
                      : wasCorrect === false
                        ? 0
                        : w.progress?.correct_streak ?? 0,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                }
              : w
          )
        )

        setSessionScore(prev => prev + scoreChange)
      } catch (error) {
        console.error('Error updating progress:', error)
      }

      setIsLoading(false)
    },
    [currentWord, currentIndex, isLoading]
  )

  const handleReveal = useCallback(async () => {
    if (revealed || !currentWord) return

    setRevealed(true)
    setResults(prev => ({ ...prev, revealed: prev.revealed + 1 }))
    await updateScore(-1, null) // -1 for revealing
  }, [revealed, currentWord, updateScore])

  const handleSelectAnswer = useCallback(
    async (hanzi: string) => {
      if (revealed || selectedAnswer || !currentWord) return

      setSelectedAnswer(hanzi)
      const isCorrect = hanzi === currentWord.hanzi

      if (isCorrect) {
        setResults(prev => ({ ...prev, correct: prev.correct + 1 }))
        await updateScore(1, true) // +1 for correct
      } else {
        setResults(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
        await updateScore(-3, false) // -3 for incorrect
      }

      // Show the answer briefly then move on
      setRevealed(true)
      setTimeout(() => {
        const nextIndex = currentIndex + 1
        if (nextIndex >= reviewLimit) {
          setCurrentIndex(reviewLimit)
        } else {
          setCurrentIndex(nextIndex)
        }
        setRevealed(false)
        setSelectedAnswer(null)
      }, 1500)
    },
    [revealed, selectedAnswer, currentWord, currentIndex, reviewLimit, updateScore]
  )

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= reviewLimit) {
      setCurrentIndex(reviewLimit)
    } else {
      setCurrentIndex(nextIndex)
    }
    setRevealed(false)
    setSelectedAnswer(null)
  }, [currentIndex, reviewLimit])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setRevealed(false)
    setSelectedAnswer(null)
    setResults({ correct: 0, incorrect: 0, revealed: 0 })
    setSessionScore(0)
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
    const totalAttempts = results.correct + results.incorrect + results.revealed
    const accuracy = totalAttempts > 0
      ? Math.round((results.correct / totalAttempts) * 100)
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
          <div className="text-neutral-400 mb-2 space-y-1">
            <p className="text-emerald-400">{results.correct} correct (+1 each)</p>
            {results.incorrect > 0 && (
              <p className="text-red-400">{results.incorrect} incorrect (-3 each)</p>
            )}
            {results.revealed > 0 && (
              <p className="text-yellow-400">{results.revealed} revealed (-1 each)</p>
            )}
          </div>
          <p className={cn(
            'text-lg font-medium mb-6',
            sessionScore >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            Session: {sessionScore > 0 ? '+' : ''}{sessionScore}
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
          {currentIndex + 1} of {reviewLimit}
        </span>
        <span className={cn(
          'text-sm font-medium',
          sessionScore >= 0 ? 'text-emerald-400' : 'text-red-400'
        )}>
          {sessionScore > 0 ? '+' : ''}{sessionScore}
        </span>
      </div>

      {/* Card */}
      <div
        className={cn(
          'relative bg-neutral-900 rounded-2xl border border-neutral-800 p-8 min-h-[280px] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer',
          revealed && 'border-neutral-700'
        )}
        onClick={handleReveal}
      >
        <div className="text-center">
          <div className="text-sm text-neutral-500 mb-4">
            What character is this?
          </div>
          <span className="text-4xl sm:text-5xl text-neutral-300">
            {currentWord.pinyin}
          </span>
          <div className="text-lg text-neutral-500 mt-2">
            {currentWord.english}
          </div>

          {revealed && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-7xl">{currentWord.hanzi}</div>
            </div>
          )}
        </div>

        {!revealed && !selectedAnswer && (
          <p className="absolute bottom-4 text-sm text-neutral-600">
            Tap to reveal (-1)
          </p>
        )}
      </div>

      {/* Hanzi options */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        {hanziOptions.map((hanzi, i) => {
          const isCorrect = hanzi === currentWord.hanzi
          const isSelected = selectedAnswer === hanzi
          const showResult = revealed || selectedAnswer

          return (
            <button
              key={`${hanzi}-${i}`}
              onClick={() => handleSelectAnswer(hanzi)}
              disabled={revealed || !!selectedAnswer || isLoading}
              className={cn(
                'py-4 rounded-xl border text-3xl font-normal transition-all duration-150',
                !showResult && 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700',
                showResult && isCorrect && 'bg-emerald-500/20 border-emerald-500 text-emerald-50',
                showResult && isSelected && !isCorrect && 'bg-red-500/20 border-red-500 text-red-50',
                showResult && !isCorrect && !isSelected && 'bg-neutral-900 border-neutral-800 opacity-50',
                (revealed || !!selectedAnswer || isLoading) && 'pointer-events-none'
              )}
            >
              {hanzi}
            </button>
          )
        })}
      </div>

      {/* Scoring hint */}
      <div className="mt-4 text-center text-xs text-neutral-600">
        Correct: +1 · Wrong: -3 · Reveal: -1
      </div>

      {/* Next button when revealed via tap */}
      {revealed && !selectedAnswer && (
        <button
          onClick={handleNext}
          className="mt-4 w-full py-3 px-4 rounded-xl bg-neutral-800 text-neutral-50 font-medium transition-colors hover:bg-neutral-700"
        >
          Next
        </button>
      )}

      {/* Unit info */}
      <div className="mt-4 text-center text-xs text-neutral-600">
        Unit {currentWord.unit}: {currentWord.unit_name}
      </div>
    </div>
  )
}
