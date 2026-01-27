'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { WordWithProgress, HanziProfile, SentenceWithProgress } from '@/lib/hanzi/types'
import { SCORE_THRESHOLDS } from '@/lib/hanzi/types'
import { getSectionProgress } from '@/lib/hanzi/progression'
import Link from 'next/link'

interface HighScores {
  wordsTap: number
  wordsType: number
  sentencesTap: number
  sentencesType: number
}

interface StatsClientProps {
  words: WordWithProgress[]
  sentences: SentenceWithProgress[]
  profile: HanziProfile | null
  highScores: HighScores
}

export function StatsClient({ words, sentences, profile, highScores }: StatsClientProps) {
  const currentUnit = profile?.current_unit ?? 1

  // Word stats
  const wordStats = useMemo(() => {
    const wordsSeen = words.filter(w => w.progress !== null).length
    const mastered = words.filter(
      w => w.progress && w.progress.score >= SCORE_THRESHOLDS.MASTERED_MIN
    ).length
    const familiar = words.filter(w => {
      const score = w.progress?.score ?? 0
      return (
        w.progress !== null &&
        score >= SCORE_THRESHOLDS.FAMILIAR_MIN &&
        score <= SCORE_THRESHOLDS.FAMILIAR_MAX
      )
    }).length
    const learning = words.filter(w => {
      const score = w.progress?.score ?? 0
      return (
        w.progress !== null &&
        score >= SCORE_THRESHOLDS.LEARNING_MIN &&
        score <= SCORE_THRESHOLDS.LEARNING_MAX
      )
    }).length
    const struggling = words.filter(
      w => w.progress && w.progress.score < SCORE_THRESHOLDS.LEARNING_MIN
    ).length

    return {
      total: words.length,
      seen: wordsSeen,
      mastered,
      familiar,
      learning,
      struggling,
    }
  }, [words])

  // Sentence stats
  const sentenceStats = useMemo(() => {
    const sentencesSeen = sentences.filter(s => s.progress !== null).length
    const mastered = sentences.filter(
      s => s.progress && s.progress.score >= SCORE_THRESHOLDS.MASTERED_MIN
    ).length
    const familiar = sentences.filter(s => {
      const score = s.progress?.score ?? 0
      return (
        s.progress !== null &&
        score >= SCORE_THRESHOLDS.FAMILIAR_MIN &&
        score <= SCORE_THRESHOLDS.FAMILIAR_MAX
      )
    }).length
    const learning = sentences.filter(s => {
      const score = s.progress?.score ?? 0
      return (
        s.progress !== null &&
        score >= SCORE_THRESHOLDS.LEARNING_MIN &&
        score <= SCORE_THRESHOLDS.LEARNING_MAX
      )
    }).length
    const struggling = sentences.filter(
      s => s.progress && s.progress.score < SCORE_THRESHOLDS.LEARNING_MIN
    ).length

    return {
      total: sentences.length,
      seen: sentencesSeen,
      mastered,
      familiar,
      learning,
      struggling,
    }
  }, [sentences])

  const unitProgress = useMemo(
    () => getSectionProgress(words, 1, currentUnit),
    [words, currentUnit]
  )

  const wordProgress = wordStats.total > 0
    ? Math.round((wordStats.seen / wordStats.total) * 100)
    : 0
  const sentenceProgress = sentenceStats.total > 0
    ? Math.round((sentenceStats.seen / sentenceStats.total) * 100)
    : 0

  return (
    <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto py-4">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
          <div className="text-3xl font-bold text-neutral-50">
            {wordStats.seen}
          </div>
          <div className="text-sm text-neutral-500">Words Learned</div>
          <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${wordProgress}%` }}
            />
          </div>
          <div className="text-xs text-neutral-600 mt-1">
            {wordProgress}% of {wordStats.total}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
          <div className="text-3xl font-bold text-neutral-50">
            {sentenceStats.seen}
          </div>
          <div className="text-sm text-neutral-500">Sentences Learned</div>
          <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${sentenceProgress}%` }}
            />
          </div>
          <div className="text-xs text-neutral-600 mt-1">
            {sentenceProgress}% of {sentenceStats.total}
          </div>
        </div>
      </div>

      {/* High Scores */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-6">
        <h3 className="text-sm font-medium text-neutral-50 mb-4">
          Review High Scores
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Words (Tap)</span>
            <span className="text-sm font-mono tabular-nums text-amber-400">
              {highScores.wordsTap}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Words (Type)</span>
            <span className="text-sm font-mono tabular-nums text-amber-400">
              {highScores.wordsType}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Sentences (Tap)</span>
            <span className="text-sm font-mono tabular-nums text-amber-400">
              {highScores.sentencesTap}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Sentences (Type)</span>
            <span className="text-sm font-mono tabular-nums text-amber-400">
              {highScores.sentencesType}
            </span>
          </div>
        </div>
      </div>

      {/* Word status breakdown */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-6">
        <h3 className="text-sm font-medium text-neutral-50 mb-4">
          Word Status
        </h3>
        <div className="space-y-3">
          <StatusRow
            label="Mastered"
            count={wordStats.mastered}
            total={wordStats.total}
            color="emerald"
          />
          <StatusRow
            label="Familiar"
            count={wordStats.familiar}
            total={wordStats.total}
            color="blue"
          />
          <StatusRow
            label="Learning"
            count={wordStats.learning}
            total={wordStats.total}
            color="neutral"
          />
          <StatusRow
            label="Struggling"
            count={wordStats.struggling}
            total={wordStats.total}
            color="red"
          />
        </div>
      </div>

      {/* Sentence status breakdown */}
      {sentenceStats.total > 0 && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-6">
          <h3 className="text-sm font-medium text-neutral-50 mb-4">
            Sentence Status
          </h3>
          <div className="space-y-3">
            <StatusRow
              label="Mastered"
              count={sentenceStats.mastered}
              total={sentenceStats.total}
              color="emerald"
            />
            <StatusRow
              label="Familiar"
              count={sentenceStats.familiar}
              total={sentenceStats.total}
              color="blue"
            />
            <StatusRow
              label="Learning"
              count={sentenceStats.learning}
              total={sentenceStats.total}
              color="neutral"
            />
            <StatusRow
              label="Struggling"
              count={sentenceStats.struggling}
              total={sentenceStats.total}
              color="red"
            />
          </div>
        </div>
      )}

      {/* Unit breakdown */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-6">
        <h3 className="text-sm font-medium text-neutral-50 mb-4">
          Section 1 Progress
        </h3>
        <div className="space-y-2">
          {unitProgress.map(unit => {
            const progressPercent =
              unit.totalWords > 0
                ? Math.round(
                    ((unit.mastered + unit.familiar) / unit.totalWords) * 100
                  )
                : 0

            return (
              <div
                key={`${unit.section}-${unit.unit}`}
                className="flex items-center gap-3"
              >
                <div
                  className={cn(
                    'size-6 rounded-full flex items-center justify-center text-xs font-medium',
                    unit.isComplete
                      ? 'bg-emerald-600 text-white'
                      : unit.isUnlocked
                        ? 'bg-neutral-700 text-neutral-300'
                        : 'bg-neutral-800 text-neutral-500'
                  )}
                >
                  {unit.isComplete ? (
                    <svg
                      className="size-3"
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
                  ) : (
                    unit.unit
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-400 truncate">
                      {unit.unitName}
                    </span>
                    <span className="text-neutral-500 tabular-nums">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        unit.isComplete ? 'bg-emerald-600' : 'bg-neutral-600'
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {wordStats.struggling > 0 && (
          <Link
            href="/hanzi/lesson"
            className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 hover:bg-red-900/30 transition-colors"
          >
            <div className="text-lg font-semibold text-red-400">
              {wordStats.struggling}
            </div>
            <div className="text-sm text-red-300">Struggling Words</div>
            <div className="text-xs text-red-400/60 mt-1">Tap to practice</div>
          </Link>
        )}
        {wordStats.mastered > 0 && (
          <Link
            href="/hanzi/review"
            className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-4 hover:bg-emerald-900/30 transition-colors"
          >
            <div className="text-lg font-semibold text-emerald-400">
              {wordStats.mastered}
            </div>
            <div className="text-sm text-emerald-300">Mastered Words</div>
            <div className="text-xs text-emerald-400/60 mt-1">
              Tap to review
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

function StatusRow({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: 'emerald' | 'blue' | 'neutral' | 'red'
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0

  const colors = {
    emerald: 'bg-emerald-600',
    blue: 'bg-blue-600',
    neutral: 'bg-neutral-600',
    red: 'bg-red-600',
  }

  const textColors = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    neutral: 'text-neutral-400',
    red: 'text-red-400',
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-neutral-400">{label}</span>
        <span className={cn('tabular-nums', textColors[color])}>
          {count}{' '}
          <span className="text-neutral-600">({percent}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', colors[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
