'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { WordWithProgress, HanziProfile } from '@/lib/hanzi/types'
import { SCORE_THRESHOLDS } from '@/lib/hanzi/types'
import { getSectionProgress } from '@/lib/hanzi/progression'
import Link from 'next/link'

interface StatsClientProps {
  words: WordWithProgress[]
  profile: HanziProfile | null
}

export function StatsClient({ words, profile }: StatsClientProps) {
  const currentUnit = profile?.current_unit ?? 1

  const stats = useMemo(() => {
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

    const totalAttempts = words.reduce(
      (sum, w) => sum + (w.progress?.attempts ?? 0),
      0
    )
    const totalCorrect = words.reduce((sum, w) => {
      const attempts = w.progress?.attempts ?? 0
      const score = w.progress?.score ?? 0
      // Estimate correct from score and attempts
      return sum + Math.max(0, Math.floor((attempts + score) / 2))
    }, 0)
    const accuracy =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

    return {
      totalWords: words.length,
      wordsSeen,
      mastered,
      familiar,
      learning,
      struggling,
      accuracy,
      totalAttempts,
    }
  }, [words])

  const unitProgress = useMemo(
    () => getSectionProgress(words, 1, currentUnit),
    [words, currentUnit]
  )

  const overallProgress = Math.round((stats.wordsSeen / stats.totalWords) * 100)

  return (
    <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto py-4">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
          <div className="text-3xl font-bold text-neutral-50">
            {stats.wordsSeen}
          </div>
          <div className="text-sm text-neutral-500">Words Learned</div>
          <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="text-xs text-neutral-600 mt-1">
            {overallProgress}% of {stats.totalWords}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4">
          <div className="text-3xl font-bold text-emerald-400">
            {profile?.current_streak ?? 0}
          </div>
          <div className="text-sm text-neutral-500">Day Streak</div>
          <div className="text-xs text-neutral-600 mt-4">
            Best: {profile?.longest_streak ?? 0} days
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
            count={stats.mastered}
            total={stats.totalWords}
            color="emerald"
          />
          <StatusRow
            label="Familiar"
            count={stats.familiar}
            total={stats.totalWords}
            color="blue"
          />
          <StatusRow
            label="Learning"
            count={stats.learning}
            total={stats.totalWords}
            color="neutral"
          />
          <StatusRow
            label="Struggling"
            count={stats.struggling}
            total={stats.totalWords}
            color="red"
          />
        </div>
      </div>

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
        {stats.struggling > 0 && (
          <Link
            href="/hanzi/lesson"
            className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 hover:bg-red-900/30 transition-colors"
          >
            <div className="text-lg font-semibold text-red-400">
              {stats.struggling}
            </div>
            <div className="text-sm text-red-300">Struggling Words</div>
            <div className="text-xs text-red-400/60 mt-1">Tap to practice</div>
          </Link>
        )}
        {stats.mastered > 0 && (
          <Link
            href="/hanzi/review"
            className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-4 hover:bg-emerald-900/30 transition-colors"
          >
            <div className="text-lg font-semibold text-emerald-400">
              {stats.mastered}
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
