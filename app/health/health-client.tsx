'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import type { HealthData } from './page'

interface HealthDashboardProps {
  initialDate: string
  initialData: HealthData
  userId: string
}

function MetricCard({
  title,
  value,
  subtitle,
  href,
  isEmpty,
}: {
  title: string
  value: string
  subtitle: string
  href: string
  isEmpty?: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        block p-4 rounded-lg border transition-colors
        ${
          isEmpty
            ? 'bg-neutral-900/30 border-neutral-800/40 text-neutral-600'
            : 'bg-neutral-900/50 border-neutral-800/60 hover:border-neutral-700'
        }
      `}
    >
      <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-2">
        {title}
      </div>
      <div
        className={`text-2xl font-semibold font-mono tabular-nums ${
          isEmpty ? 'text-neutral-600' : 'text-neutral-50'
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-neutral-500 mt-1">{subtitle}</div>
    </Link>
  )
}

function formatSleepDuration(minutes: number | null): string {
  if (!minutes) return '--'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function formatWakeTime(wakeTime: string | null): string {
  if (!wakeTime) return 'not logged'
  const date = new Date(wakeTime)
  return `woke ${format(date, 'h:mm a')}`
}

function formatStepsProgress(steps: number | null, target: number): string {
  if (!steps) return '/ 10k'
  const percentage = Math.min(100, Math.round((steps / target) * 100))
  return `${percentage}% of ${(target / 1000).toFixed(0)}k`
}

function formatDietScore(diet: HealthData['diet']): string {
  if (!diet) return '--'
  // Count signals that are > 0
  const signals = [
    diet.no_alcohol,
    diet.no_snacking,
    diet.no_sugar,
    diet.no_junk,
    diet.protein_focus,
    diet.hydration,
    diet.no_late_eating,
    diet.ate_vegetables,
    diet.caffeine_cutoff,
    diet.mindful_portions,
  ]
  const completed = signals.filter((s) => s > 0).length
  return `${completed}/10`
}

function formatWeightTrend(weightHistory: HealthData['weightHistory']): {
  current: string
  trend: string
} {
  if (weightHistory.length === 0) {
    return { current: '--', trend: 'no data' }
  }
  const current = weightHistory[0].weight_kg
  if (weightHistory.length < 2) {
    return { current: `${current}`, trend: 'kg' }
  }
  const oldest = weightHistory[weightHistory.length - 1].weight_kg
  const diff = current - oldest
  const trend = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
  return { current: `${current}`, trend: `${trend} 7d` }
}

function formatScreenTime(events: HealthData['screenTime']): {
  count: string
  total: string
} {
  if (events.length === 0) {
    return { count: '0', total: 'no locks' }
  }
  const totalMinutes = events.reduce((sum, e) => sum + e.duration_minutes, 0)
  return {
    count: `${events.length}`,
    total: `${totalMinutes}m total`,
  }
}

export function HealthDashboard({ initialDate, initialData }: HealthDashboardProps) {
  const { sleep, steps, diet, weightHistory, screenTime, workouts } = initialData

  const weightData = formatWeightTrend(weightHistory)
  const screenData = formatScreenTime(screenTime)

  const todayLabel = format(new Date(initialDate), 'EEEE, MMMM d')

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto pb-safe">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-lg font-semibold text-neutral-50">Health</h1>
        <p className="text-sm text-neutral-500">{todayLabel}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="Sleep"
          value={formatSleepDuration(sleep?.duration_minutes ?? null)}
          subtitle={formatWakeTime(sleep?.wake_time ?? null)}
          href="/health/sleep"
          isEmpty={!sleep}
        />

        <MetricCard
          title="Steps"
          value={steps ? steps.step_count.toLocaleString() : '--'}
          subtitle={formatStepsProgress(steps?.step_count ?? null, steps?.target ?? 10000)}
          href="/health/steps"
          isEmpty={!steps}
        />

        <MetricCard
          title="Diet"
          value={formatDietScore(diet)}
          subtitle={diet ? `${diet.daily_score}% avg` : 'not logged'}
          href="/health/diet"
          isEmpty={!diet}
        />

        <MetricCard
          title="Workout"
          value={workouts.length > 0 ? '1' : '0'}
          subtitle={
            workouts.length > 0
              ? workouts[0].template_name || 'completed'
              : 'none logged'
          }
          href="/health/workouts"
          isEmpty={workouts.length === 0}
        />

        <MetricCard
          title="Weight"
          value={weightData.current}
          subtitle={weightData.trend}
          href="/health/weight"
          isEmpty={weightHistory.length === 0}
        />

        <MetricCard
          title="Screen"
          value={screenData.count}
          subtitle={screenData.total}
          href="/health/screentime"
          isEmpty={screenTime.length === 0}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          href="/health/diet"
          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-center rounded-lg font-medium transition-colors"
        >
          Log Diet
        </Link>
        <Link
          href="/health/weight"
          className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white text-center rounded-lg font-medium transition-colors"
        >
          Log Weight
        </Link>
      </div>

      {/* Settings Link */}
      <div className="mt-8 text-center">
        <Link
          href="/health/settings"
          className="text-sm text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}
