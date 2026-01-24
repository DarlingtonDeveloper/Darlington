'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { WordWithProgress } from '@/lib/hanzi/types'
import Link from 'next/link'

interface ReviewClientProps {
  initialWords: WordWithProgress[]
  allHanzi: string[]
  userId: string
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

// Sort words by score (highest first) but shuffle within similar scores
function sortByScoreWithVariation(words: WordWithProgress[]): WordWithProgress[] {
  // Group words by score buckets (e.g., 10+, 8-9, 6-7)
  const buckets: Map<number, WordWithProgress[]> = new Map()

  words.forEach(word => {
    const score = word.progress?.score ?? 0
    // Create buckets of 2 points each
    const bucket = Math.floor(score / 2) * 2
    if (!buckets.has(bucket)) {
      buckets.set(bucket, [])
    }
    buckets.get(bucket)!.push(word)
  })

  // Sort buckets by score (highest first), shuffle within each bucket
  const sortedBuckets = Array.from(buckets.entries())
    .sort((a, b) => b[0] - a[0])

  // Flatten with shuffled buckets
  return sortedBuckets.flatMap(([, words]) => shuffle(words))
}

const TIMER_DURATION = 5000 // 5 seconds in ms

export function ReviewClient({ initialWords, allHanzi, userId: _userId }: ReviewClientProps) {
  const supabase = createClient()
  void _userId // Reserved for future RLS enforcement

  // Sort words: highest score first, but randomized within score bands
  const [words] = useState<WordWithProgress[]>(() => sortByScoreWithVariation(initialWords))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Streak tracking (replaces session score)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalAttempted, setTotalAttempted] = useState(0)

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const currentWord = words[currentIndex]
  const hasWords = words.length > 0

  // Generate 12 hanzi options (1 correct + 11 random wrong)
  const hanziOptions = useMemo(() => {
    if (!currentWord) return []
    const otherHanzi = allHanzi.filter(h => h !== currentWord.hanzi)
    const wrongAnswers = shuffle(otherHanzi).slice(0, 11)
    return shuffle([currentWord.hanzi, ...wrongAnswers])
  }, [currentWord, allHanzi])

  // Handle timer expiration
  const handleTimeUp = useCallback(() => {
    if (selectedAnswer || isLoading) return

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Break streak on timeout
    setCurrentStreak(0)
    setTotalAttempted(prev => prev + 1)

    // Show the correct answer briefly
    setSelectedAnswer('timeout')

    // Move to next after delay (wrap around for infinite play)
    setTimeout(() => {
      setCurrentIndex((currentIndex + 1) % words.length)
      setSelectedAnswer(null)
    }, 1500)
  }, [selectedAnswer, isLoading, currentIndex, words.length])

  // Timer logic
  useEffect(() => {
    if (!hasWords || selectedAnswer) return

    startTimeRef.current = Date.now()
    setTimeRemaining(TIMER_DURATION)

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, TIMER_DURATION - elapsed)
      setTimeRemaining(remaining)

      if (remaining <= 0) {
        // Time's up - count as miss, break streak
        handleTimeUp()
      }
    }

    timerRef.current = setInterval(tick, 50) // Update frequently for smooth animation

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentIndex, hasWords, selectedAnswer, handleTimeUp])

  const updateProgress = useCallback(
    async (wasCorrect: boolean) => {
      if (!currentWord || isLoading) return

      setIsLoading(true)

      try {
        // Only update last_seen, don't change score (no penalties)
        await supabase
          .from('user_word_progress')
          .update({
            attempts: (currentWord.progress?.attempts ?? 0) + 1,
            correct_streak: wasCorrect
              ? (currentWord.progress?.correct_streak ?? 0) + 1
              : 0,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentWord.progress?.id)
      } catch (error) {
        console.error('Error updating progress:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [currentWord, isLoading, supabase]
  )

  const handleSelectAnswer = useCallback(
    async (hanzi: string) => {
      if (selectedAnswer || isLoading || !currentWord) return

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      setSelectedAnswer(hanzi)
      const isCorrect = hanzi === currentWord.hanzi

      // Update streak
      setTotalAttempted(prev => prev + 1)
      if (isCorrect) {
        setTotalCorrect(prev => prev + 1)
        setCurrentStreak(prev => {
          const newStreak = prev + 1
          setBestStreak(best => Math.max(best, newStreak))
          return newStreak
        })
      } else {
        setCurrentStreak(0)
      }

      // Update database (no score changes, just tracking)
      await updateProgress(isCorrect)

      // Move to next after delay (wrap around for infinite play)
      setTimeout(() => {
        setCurrentIndex((currentIndex + 1) % words.length)
        setSelectedAnswer(null)
      }, 1500)
    },
    [selectedAnswer, isLoading, currentWord, currentIndex, words.length, updateProgress]
  )

  // Timer progress (0 to 1)
  const timerProgress = timeRemaining / TIMER_DURATION

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

  return (
    <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
      {/* Progress header with streak */}
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-neutral-400 font-mono tabular-nums">
          {totalCorrect}/{totalAttempted}
        </span>
        <div className="flex items-center gap-4">
          {/* Current streak */}
          <div className="flex items-center gap-1">
            <span className="text-amber-400">🔥</span>
            <span className={cn(
              'text-sm font-medium',
              currentStreak > 0 ? 'text-amber-400' : 'text-neutral-500'
            )}>
              {currentStreak}
            </span>
          </div>
          {/* Best streak */}
          {bestStreak > 0 && (
            <span className="text-xs text-neutral-500">
              Best: {bestStreak}
            </span>
          )}
        </div>
      </div>

      {/* Timer ring */}
      <div className="flex justify-center mb-4">
        <div className="relative size-16">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-800"
            />
            {/* Progress circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${timerProgress * 100.53} 100.53`}
              className={cn(
                'transition-all duration-100',
                timerProgress > 0.5 ? 'text-emerald-500' :
                  timerProgress > 0.25 ? 'text-amber-500' : 'text-red-500'
              )}
            />
          </svg>
          {/* Time text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'text-sm font-mono font-medium',
              timerProgress > 0.5 ? 'text-emerald-400' :
                timerProgress > 0.25 ? 'text-amber-400' : 'text-red-400'
            )}>
              {(timeRemaining / 1000).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        className={cn(
          'relative bg-neutral-900 rounded-2xl border border-neutral-800 p-8 min-h-[220px] flex flex-col items-center justify-center transition-all duration-300',
          selectedAnswer && 'border-neutral-700'
        )}
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

          {/* Show answer on selection or timeout */}
          {selectedAnswer && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-7xl">{currentWord.hanzi}</div>
              {selectedAnswer === 'timeout' && (
                <div className="text-red-400 text-sm mt-2">Time&apos;s up!</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hanzi options */}
      <div className="mt-6 grid grid-cols-4 gap-3">
        {hanziOptions.map((hanzi, i) => {
          const isCorrect = hanzi === currentWord.hanzi
          const isSelected = selectedAnswer === hanzi
          const showResult = !!selectedAnswer

          return (
            <button
              key={`${hanzi}-${i}`}
              onClick={() => handleSelectAnswer(hanzi)}
              disabled={!!selectedAnswer || isLoading}
              className={cn(
                'py-4 rounded-xl border text-3xl font-normal transition-all duration-150',
                !showResult && 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700',
                showResult && isCorrect && 'bg-emerald-500/20 border-emerald-500 text-emerald-50',
                showResult && isSelected && !isCorrect && 'bg-red-500/20 border-red-500 text-red-50',
                showResult && !isCorrect && !isSelected && 'bg-neutral-900 border-neutral-800 opacity-50',
                (!!selectedAnswer || isLoading) && 'pointer-events-none'
              )}
            >
              {hanzi}
            </button>
          )
        })}
      </div>

      {/* Info hint */}
      <div className="mt-4 text-center text-xs text-neutral-600">
        Answer quickly to build your streak!
      </div>

      {/* Unit info */}
      <div className="mt-2 text-center text-xs text-neutral-600">
        Unit {currentWord.unit}: {currentWord.unit_name}
      </div>
    </div>
  )
}