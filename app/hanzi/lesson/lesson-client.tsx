'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Word, WordWithProgress } from '@/lib/hanzi/types'
import Link from 'next/link'

interface LessonClientProps {
  initialWords: WordWithProgress[]
  unseenWords: Word[]
  userId: string
}

export function LessonClient({ initialWords, unseenWords, userId }: LessonClientProps) {
  const supabase = createClient()
  // Queue of word IDs to practice (words repeat until "Got It")
  const [queue, setQueue] = useState<string[]>(initialWords.map(w => w.id))
  // Map of words by ID for quick lookup
  const [wordsMap, setWordsMap] = useState<Map<string, WordWithProgress>>(
    new Map(initialWords.map(w => [w.id, w]))
  )
  // Track which unseen words are still available
  const [availableNewWords, setAvailableNewWords] = useState<Word[]>(unseenWords)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [sessionScore, setSessionScore] = useState(0)

  // New word introduction overlay
  const [introducingWords, setIntroducingWords] = useState<Word[]>([])
  const [currentIntroIndex, setCurrentIntroIndex] = useState(0)
  const isIntroducing = introducingWords.length > 0

  const currentWordId = queue[0]
  const currentWord = currentWordId ? wordsMap.get(currentWordId) : undefined
  const hasWords = initialWords.length > 0 || queue.length > 0
  const isComplete = queue.length === 0 && !isIntroducing

  const handleResponse = useCallback(
    async (gotIt: boolean) => {
      if (!currentWord || isLoading) return

      setIsLoading(true)
      setTotalAttempts(prev => prev + 1)

      try {
        // Scoring: Got It = +1, Still Hard = -1
        const scoreChange = gotIt ? 1 : -1
        const currentScore = currentWord.progress?.score ?? 0
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

        // Update words map with new score
        setWordsMap(prev => {
          const next = new Map(prev)
          next.set(currentWord.id, {
            ...currentWord,
            progress: {
              ...currentWord.progress!,
              score: newScore,
              attempts: (currentWord.progress?.attempts ?? 0) + 1,
              correct_streak: gotIt
                ? (currentWord.progress?.correct_streak ?? 0) + 1
                : 0,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          })
          return next
        })

        setSessionScore(prev => prev + scoreChange)

        if (gotIt) {
          // Remove from queue (graduated for this session)
          setQueue(prev => prev.slice(1))
          setCompletedCount(prev => prev + 1)
        } else {
          // Move to back of queue (will see again)
          setQueue(prev => [...prev.slice(1), prev[0]])
        }

        setShowAnswer(false)
      } catch (error) {
        console.error('Error updating progress:', error)
      }

      setIsLoading(false)
    },
    [supabase, currentWord, isLoading]
  )

  const handleRestart = useCallback(() => {
    // Reset queue with all words that still need work (score < 3)
    const wordsNeedingWork = Array.from(wordsMap.values())
      .filter(w => (w.progress?.score ?? 0) < 3)
      .sort((a, b) => (a.progress?.score ?? 0) - (b.progress?.score ?? 0))
    setQueue(wordsNeedingWork.map(w => w.id))
    setShowAnswer(false)
    setCompletedCount(0)
    setTotalAttempts(0)
    setSessionScore(0)
  }, [wordsMap])

  // Introduce new words with animation sequence
  const handleIntroduceNewWords = useCallback(async () => {
    if (availableNewWords.length === 0) return

    // Pick up to 3 random new words
    const shuffled = [...availableNewWords].sort(() => Math.random() - 0.5)
    const wordsToIntroduce = shuffled.slice(0, 3)

    // Start the introduction sequence
    setIntroducingWords(wordsToIntroduce)
    setCurrentIntroIndex(0)

    // Remove these from available pool
    setAvailableNewWords(prev =>
      prev.filter(w => !wordsToIntroduce.find(intro => intro.id === w.id))
    )
  }, [availableNewWords])

  // Handle tapping through the introduction sequence
  const handleNextIntro = useCallback(async () => {
    const currentIntroWord = introducingWords[currentIntroIndex]

    // Create progress record for this word
    if (currentIntroWord) {
      try {
        const { data } = await supabase
          .from('user_word_progress')
          .insert({
            user_id: userId,
            word_id: currentIntroWord.id,
            score: 0,
            attempts: 0,
            correct_streak: 0,
            last_seen: new Date().toISOString(),
          })
          .select()
          .single()

        // Add to words map
        const wordWithProgress: WordWithProgress = {
          ...currentIntroWord,
          progress: data,
          status: 'learning',
        }
        setWordsMap(prev => new Map(prev).set(currentIntroWord.id, wordWithProgress))

        // Add to queue
        setQueue(prev => [...prev, currentIntroWord.id])
      } catch (error) {
        console.error('Error creating progress:', error)
      }
    }

    // Move to next word or finish
    if (currentIntroIndex < introducingWords.length - 1) {
      setCurrentIntroIndex(prev => prev + 1)
    } else {
      // Finished all introductions
      setIntroducingWords([])
      setCurrentIntroIndex(0)
    }
  }, [supabase, userId, introducingWords, currentIntroIndex])

  // Empty state (no words to practice, but may have new words to introduce)
  if (!hasWords && !isIntroducing) {
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
            No Words Need Practice
          </h2>
          <p className="text-neutral-400 mb-6">
            All your words are familiar or mastered.
          </p>
          <div className="flex flex-col gap-3">
            {availableNewWords.length > 0 && (
              <button
                onClick={handleIntroduceNewWords}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
              >
                Learn {Math.min(3, availableNewWords.length)} New Words
              </button>
            )}
            <Link
              href="/hanzi"
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-50 hover:bg-neutral-700 transition-colors"
            >
              Back to Link Mode
            </Link>
          </div>
          {availableNewWords.length > 0 && (
            <p className="mt-4 text-xs text-neutral-600">
              {availableNewWords.length} new words available
            </p>
          )}
        </div>
      </div>
    )
  }

  // Complete state
  if (isComplete) {
    // Check if there are still words needing work
    const wordsStillNeedingWork = Array.from(wordsMap.values())
      .filter(w => (w.progress?.score ?? 0) < 3).length

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
            Session Complete!
          </h2>
          <div className="text-neutral-400 mb-2 space-y-1">
            <p>{completedCount} words graduated this session</p>
            <p className="text-neutral-500">{totalAttempts} total attempts</p>
          </div>
          <p className={cn(
            'text-lg font-medium mb-6',
            sessionScore >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            Session: {sessionScore > 0 ? '+' : ''}{sessionScore}
          </p>
          <div className="flex flex-col gap-3">
            {availableNewWords.length > 0 && (
              <button
                onClick={handleIntroduceNewWords}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
              >
                Learn {Math.min(3, availableNewWords.length)} New Words
              </button>
            )}
            <div className="flex gap-3">
              {wordsStillNeedingWork > 0 && (
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-50 hover:bg-neutral-700 transition-colors"
                >
                  Practice More ({wordsStillNeedingWork})
                </button>
              )}
              <Link
                href="/hanzi"
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-50 hover:bg-neutral-700 transition-colors"
              >
                Back to Link Mode
              </Link>
            </div>
          </div>
          {availableNewWords.length > 0 && (
            <p className="mt-4 text-xs text-neutral-600">
              {availableNewWords.length} new words available
            </p>
          )}
        </div>
      </div>
    )
  }

  // Get status label based on score
  const getStatusLabel = (score: number) => {
    if (score < 0) return 'struggling'
    if (score < 3) return 'learning'
    return 'familiar'
  }

  return (
    <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
      {/* Progress header */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">
            {queue.length} remaining
          </span>
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            (currentWord?.progress?.score ?? 0) < 0
              ? 'bg-red-900/50 text-red-400'
              : 'bg-yellow-900/50 text-yellow-400'
          )}>
            {getStatusLabel(currentWord?.progress?.score ?? 0)}
          </span>
        </div>
        <span className={cn(
          'text-sm font-medium',
          sessionScore >= 0 ? 'text-emerald-400' : 'text-red-400'
        )}>
          {sessionScore > 0 ? '+' : ''}{sessionScore}
        </span>
      </div>

      {/* Card */}
      {currentWord ? (
        <>
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
                  className="flex-1 py-3 px-4 rounded-xl bg-red-900/50 border border-red-800 text-red-300 font-medium transition-colors hover:bg-red-900/70 disabled:opacity-50"
                >
                  Still Hard (-1)
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
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-neutral-500">Loading...</p>
        </div>
      )}

      {/* Unit info */}
      {currentWord && (
        <div className="mt-4 text-center text-xs text-neutral-600">
          Unit {currentWord.unit}: {currentWord.unit_name}
        </div>
      )}

      {/* Introduction overlay */}
      {isIntroducing && introducingWords[currentIntroIndex] && (
        <button
          onClick={handleNextIntro}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 cursor-pointer animate-overlay-in"
        >
          <div className="text-center px-8">
            <div className="text-xs uppercase tracking-wider text-emerald-400 mb-2">
              New Word {currentIntroIndex + 1} of {introducingWords.length}
            </div>
            <div className="text-8xl sm:text-9xl animate-hanzi-reveal">
              {introducingWords[currentIntroIndex].hanzi}
            </div>
            <div className="mt-6 space-y-2 animate-hanzi-reveal" style={{ animationDelay: '200ms' }}>
              <div className="text-2xl text-neutral-300">
                {introducingWords[currentIntroIndex].pinyin}
              </div>
              <div className="text-lg text-neutral-500">
                {introducingWords[currentIntroIndex].english}
              </div>
              {introducingWords[currentIntroIndex].mnemonic && (
                <div className="mt-4 p-4 rounded-lg bg-neutral-800/50 text-sm text-neutral-400 max-w-sm mx-auto">
                  <span className="text-neutral-500">Hint: </span>
                  {introducingWords[currentIntroIndex].mnemonic}
                </div>
              )}
            </div>
            <div className="mt-8 text-sm text-neutral-600 animate-hanzi-reveal" style={{ animationDelay: '400ms' }}>
              Tap to continue
            </div>
          </div>
        </button>
      )}
    </div>
  )
}
