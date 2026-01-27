'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { WordWithProgress, SentenceWithProgress } from '@/lib/hanzi/types'
import Link from 'next/link'
import { PinyinInput } from '../components/pinyin-input'

interface ReviewClientProps {
  contentMode: 'words' | 'sentences'
  // Word mode props
  initialWords: WordWithProgress[]
  allHanzi: string[]
  // Sentence mode props
  initialSentences: SentenceWithProgress[]
  allEnglish: string[]
  // Common props
  userId: string
  initialLifetimeHighScore: number
  inputMethod: 'tap' | 'type'
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

// Sort items by score (highest first) but shuffle within similar scores
function sortByScoreWithVariation<T extends { progress: { score: number } | null }>(items: T[]): T[] {
  // Group items by score buckets (e.g., 10+, 8-9, 6-7)
  const buckets: Map<number, T[]> = new Map()

  items.forEach(item => {
    const score = item.progress?.score ?? 0
    // Create buckets of 2 points each
    const bucket = Math.floor(score / 2) * 2
    if (!buckets.has(bucket)) {
      buckets.set(bucket, [])
    }
    buckets.get(bucket)!.push(item)
  })

  // Sort buckets by score (highest first), shuffle within each bucket
  const sortedBuckets = Array.from(buckets.entries())
    .sort((a, b) => b[0] - a[0])

  // Flatten with shuffled buckets
  return sortedBuckets.flatMap(([, items]) => shuffle(items))
}

const TIMER_DURATION = 5000 // 5 seconds in ms

export function ReviewClient({
  contentMode,
  initialWords,
  allHanzi,
  initialSentences,
  allEnglish,
  userId,
  initialLifetimeHighScore,
  inputMethod
}: ReviewClientProps) {
  const supabase = createClient()
  const isTypingMode = inputMethod === 'type'
  const isSentenceMode = contentMode === 'sentences'

  // Sort items: highest score first, but randomized within score bands
  const [words] = useState<WordWithProgress[]>(() => sortByScoreWithVariation(initialWords))
  const [sentences] = useState<SentenceWithProgress[]>(() => sortByScoreWithVariation(initialSentences))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Streak tracking (replaces session score)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalAttempted, setTotalAttempted] = useState(0)

  // High score tracking
  const [lifetimeHighScore, setLifetimeHighScore] = useState(initialLifetimeHighScore)

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  // Current item (word or sentence)
  const currentWord = !isSentenceMode ? words[currentIndex] : null
  const currentSentence = isSentenceMode ? sentences[currentIndex] : null
  const hasItems = isSentenceMode ? sentences.length > 0 : words.length > 0
  const itemCount = isSentenceMode ? sentences.length : words.length

  // Generate options for tap mode
  // For words: 12 hanzi options
  // For sentences: 4 English options
  const options = useMemo(() => {
    if (isSentenceMode) {
      if (!currentSentence) return []
      const otherEnglish = allEnglish.filter(e => e !== currentSentence.english)
      const wrongAnswers = shuffle(otherEnglish).slice(0, 3)
      return shuffle([currentSentence.english, ...wrongAnswers])
    } else {
      if (!currentWord) return []
      const otherHanzi = allHanzi.filter(h => h !== currentWord.hanzi)
      const wrongAnswers = shuffle(otherHanzi).slice(0, 11)
      return shuffle([currentWord.hanzi, ...wrongAnswers])
    }
  }, [isSentenceMode, currentWord, currentSentence, allHanzi, allEnglish])

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
      setCurrentIndex((currentIndex + 1) % itemCount)
      setSelectedAnswer(null)
    }, 1500)
  }, [selectedAnswer, isLoading, currentIndex, itemCount])

  // Timer logic
  useEffect(() => {
    if (!hasItems || selectedAnswer) return

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
  }, [currentIndex, hasItems, selectedAnswer, handleTimeUp])

  // Update lifetime high score in database
  const updateLifetimeHighScore = useCallback(
    async (newHighScore: number) => {
      try {
        await supabase
          .from('hanzi_profiles')
          .update({
            review_lifetime_high_score: newHighScore,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
      } catch (error) {
        console.error('Error updating lifetime high score:', error)
      }
    },
    [supabase, userId]
  )

  const updateProgress = useCallback(
    async (wasCorrect: boolean) => {
      if (isLoading) return
      if (isSentenceMode && !currentSentence) return
      if (!isSentenceMode && !currentWord) return

      setIsLoading(true)

      try {
        if (isSentenceMode && currentSentence) {
          // Update sentence progress
          if (currentSentence.progress?.id) {
            await supabase
              .from('user_sentence_progress')
              .update({
                attempts: (currentSentence.progress?.attempts ?? 0) + 1,
                correct_streak: wasCorrect
                  ? (currentSentence.progress?.correct_streak ?? 0) + 1
                  : 0,
                last_seen: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', currentSentence.progress.id)
          } else {
            // Insert new progress record for sentence
            await supabase
              .from('user_sentence_progress')
              .insert({
                user_id: userId,
                sentence_id: currentSentence.id,
                score: 0,
                attempts: 1,
                correct_streak: wasCorrect ? 1 : 0,
                last_seen: new Date().toISOString(),
                introduced_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
          }
        } else if (currentWord?.progress?.id) {
          // Update word progress
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
            .eq('id', currentWord.progress.id)
        }
      } catch (error) {
        console.error('Error updating progress:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [isSentenceMode, currentWord, currentSentence, isLoading, supabase, userId]
  )

  const handleSelectAnswer = useCallback(
    async (answer: string) => {
      if (selectedAnswer || isLoading) return
      if (isSentenceMode && !currentSentence) return
      if (!isSentenceMode && !currentWord) return

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      setSelectedAnswer(answer)

      // Check correctness based on mode
      const isCorrect = isSentenceMode
        ? answer === currentSentence!.english
        : answer === currentWord!.hanzi

      // Update streak
      setTotalAttempted(prev => prev + 1)
      if (isCorrect) {
        setTotalCorrect(prev => prev + 1)
        setCurrentStreak(prev => {
          const newStreak = prev + 1
          // Update session best
          setBestStreak(best => Math.max(best, newStreak))
          // Check and update lifetime high score
          if (newStreak > lifetimeHighScore) {
            setLifetimeHighScore(newStreak)
            updateLifetimeHighScore(newStreak)
          }
          return newStreak
        })
      } else {
        setCurrentStreak(0)
      }

      // Update database (no score changes, just tracking)
      await updateProgress(isCorrect)

      // Move to next after delay (wrap around for infinite play)
      setTimeout(() => {
        setCurrentIndex((currentIndex + 1) % itemCount)
        setSelectedAnswer(null)
      }, 1500)
    },
    [selectedAnswer, isLoading, isSentenceMode, currentWord, currentSentence, currentIndex, itemCount, updateProgress, lifetimeHighScore, updateLifetimeHighScore]
  )

  // Handle typing mode submission (words only - sentences don't use typing mode)
  const handleTypingSubmit = useCallback(
    async (inputPinyin: string) => {
      if (selectedAnswer || isLoading || !currentWord || isSentenceMode) return

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Check if input matches (compare lowercase pinyin_numbered)
      const isCorrect = inputPinyin.toLowerCase() === currentWord.pinyin_numbered.toLowerCase()

      setSelectedAnswer(isCorrect ? 'correct' : 'incorrect')

      // Update streak
      setTotalAttempted(prev => prev + 1)
      if (isCorrect) {
        setTotalCorrect(prev => prev + 1)
        setCurrentStreak(prev => {
          const newStreak = prev + 1
          setBestStreak(best => Math.max(best, newStreak))
          if (newStreak > lifetimeHighScore) {
            setLifetimeHighScore(newStreak)
            updateLifetimeHighScore(newStreak)
          }
          return newStreak
        })
      } else {
        setCurrentStreak(0)
      }

      // Update database
      await updateProgress(isCorrect)

      // Move to next after delay
      setTimeout(() => {
        setCurrentIndex((currentIndex + 1) % itemCount)
        setSelectedAnswer(null)
      }, 1500)
    },
    [selectedAnswer, isLoading, currentWord, isSentenceMode, currentIndex, itemCount, updateProgress, lifetimeHighScore, updateLifetimeHighScore]
  )

  // Timer progress (0 to 1)
  const timerProgress = timeRemaining / TIMER_DURATION

  // Empty state
  if (!hasItems) {
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
            {isSentenceMode ? 'No Sentences Available' : 'No Mastered Words Yet'}
          </h2>
          <p className="text-neutral-400 mb-6">
            {isSentenceMode ? (
              <>
                Run the sentence seed migration to add HSK 1 sentences.
              </>
            ) : (
              <>
                Keep practicing in Link Mode to master words.
                <br />
                Words with score 6+ will appear here for review.
              </>
            )}
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
              'text-sm font-medium font-mono tabular-nums',
              currentStreak > 0 ? 'text-amber-400' : 'text-neutral-500'
            )}>
              {currentStreak}
            </span>
          </div>
          {/* Session best */}
          {bestStreak > 0 && (
            <span className="text-xs text-neutral-500 font-mono tabular-nums">
              Session: {bestStreak}
            </span>
          )}
          {/* Lifetime high score */}
          {lifetimeHighScore > 0 && (
            <span className={cn(
              'text-xs font-mono tabular-nums',
              currentStreak >= lifetimeHighScore ? 'text-emerald-400' : 'text-neutral-500'
            )}>
              Record: {lifetimeHighScore}
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
        <div className="text-center w-full">
          {isSentenceMode && currentSentence ? (
            // Sentence mode
            <>
              <div className="text-sm text-neutral-500 mb-4">
                What does this mean?
              </div>
              <div className="text-2xl sm:text-3xl text-neutral-100 mb-2">
                {currentSentence.chinese}
              </div>
              <div className="text-lg text-neutral-400">
                {currentSentence.pinyin}
              </div>

              {/* Show answer on selection or timeout */}
              {selectedAnswer && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="text-xl text-neutral-200">{currentSentence.english}</div>
                  {selectedAnswer === 'timeout' && (
                    <div className="text-red-400 text-sm mt-2">Time&apos;s up!</div>
                  )}
                  {selectedAnswer === currentSentence.english && (
                    <div className="text-emerald-400 text-sm mt-2">Correct!</div>
                  )}
                  {selectedAnswer !== 'timeout' && selectedAnswer !== currentSentence.english && (
                    <div className="text-red-400 text-sm mt-2">Incorrect</div>
                  )}
                </div>
              )}
            </>
          ) : currentWord ? (
            // Word mode
            <>
              <div className="text-sm text-neutral-500 mb-4">
                {isTypingMode ? 'Type the pinyin:' : 'What character is this?'}
              </div>
              {isTypingMode ? (
                // Typing mode: show hanzi, user types pinyin
                <>
                  <span className="text-6xl sm:text-7xl">{currentWord.hanzi}</span>
                  <div className="text-lg text-neutral-500 mt-2">
                    {currentWord.english}
                  </div>
                </>
              ) : (
                // Tap mode: show pinyin, user selects hanzi
                <>
                  <span className="text-4xl sm:text-5xl text-neutral-300">
                    {currentWord.pinyin}
                  </span>
                  <div className="text-lg text-neutral-500 mt-2">
                    {currentWord.english}
                  </div>
                </>
              )}

              {/* Show answer on selection or timeout */}
              {selectedAnswer && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {isTypingMode ? (
                    // Typing mode: show pinyin as answer
                    <>
                      <div className="text-3xl text-neutral-200">{currentWord.pinyin}</div>
                      <div className="text-sm text-neutral-500 mt-1">{currentWord.pinyin_numbered}</div>
                    </>
                  ) : (
                    // Tap mode: show hanzi as answer
                    <div className="text-7xl">{currentWord.hanzi}</div>
                  )}
                  {selectedAnswer === 'timeout' && (
                    <div className="text-red-400 text-sm mt-2">Time&apos;s up!</div>
                  )}
                  {selectedAnswer === 'correct' && (
                    <div className="text-emerald-400 text-sm mt-2">Correct!</div>
                  )}
                  {selectedAnswer === 'incorrect' && (
                    <div className="text-red-400 text-sm mt-2">Incorrect</div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Input area */}
      <div className="mt-6">
        {isSentenceMode ? (
          // Sentence mode: show 4 English options
          <div className="grid grid-cols-1 gap-3">
            {options.map((english, i) => {
              const isCorrect = english === currentSentence?.english
              const isSelected = selectedAnswer === english
              const showResult = !!selectedAnswer

              return (
                <button
                  key={`${english}-${i}`}
                  onClick={() => handleSelectAnswer(english)}
                  disabled={!!selectedAnswer || isLoading}
                  className={cn(
                    'py-4 px-4 rounded-xl border text-base text-left transition-all duration-150',
                    !showResult && 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700',
                    showResult && isCorrect && 'bg-emerald-500/20 border-emerald-500 text-emerald-50',
                    showResult && isSelected && !isCorrect && 'bg-red-500/20 border-red-500 text-red-50',
                    showResult && !isCorrect && !isSelected && 'bg-neutral-900 border-neutral-800 opacity-50',
                    (!!selectedAnswer || isLoading) && 'pointer-events-none'
                  )}
                >
                  {english}
                </button>
              )
            })}
          </div>
        ) : isTypingMode && currentWord ? (
          // Word typing mode: show text input
          <PinyinInput
            onSubmit={handleTypingSubmit}
            disabled={!!selectedAnswer || isLoading}
            autoFocus
            placeholder="Type pinyin with tone number..."
          />
        ) : (
          // Word tap mode: show hanzi grid
          <div className="grid grid-cols-4 gap-3">
            {options.map((hanzi, i) => {
              const isCorrect = hanzi === currentWord?.hanzi
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
        )}
      </div>

      {/* Info hint */}
      <div className="mt-4 text-center text-xs text-neutral-600">
        {isSentenceMode
          ? 'Select the correct translation'
          : isTypingMode
            ? 'Use tone numbers (1-5) after the syllable'
            : 'Answer quickly to build your streak!'}
      </div>

      {/* Item info */}
      <div className="mt-2 text-center text-xs text-neutral-600">
        {isSentenceMode && currentSentence ? (
          <>Difficulty: {currentSentence.difficulty} · {currentSentence.category}</>
        ) : currentWord ? (
          <>Unit {currentWord.unit}: {currentWord.unit_name}</>
        ) : null}
      </div>
    </div>
  )
}