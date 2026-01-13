'use client'

import Link from 'next/link'
import type { HealthTodayData } from '@/app/habits/page'

interface HealthTodayProps {
  data: HealthTodayData
}

function MetricCard({
  label,
  value,
  target,
  met,
  href,
  icon,
}: {
  label: string
  value: string | number | null
  target: string | number
  met: boolean
  href: string
  icon: React.ReactNode
}) {
  const displayValue = value !== null ? value : '—'
  const isNumeric = typeof value === 'number'

  return (
    <Link
      href={href}
      className="flex flex-col gap-1 p-3 rounded-lg border border-neutral-800/60 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className={`${met ? 'text-emerald-500' : 'text-neutral-500'}`}>
          {icon}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-mono text-lg tabular-nums ${
            met ? 'text-emerald-400' : value !== null ? 'text-neutral-200' : 'text-neutral-600'
          }`}
        >
          {isNumeric ? displayValue.toLocaleString() : displayValue}
        </span>
        <span className="text-xs text-neutral-600">
          / {isNumeric ? target.toLocaleString() : target}
        </span>
      </div>
    </Link>
  )
}

function ActionCard({
  label,
  completed,
  subtitle,
  href,
  icon,
}: {
  label: string
  completed: boolean
  subtitle: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800/60 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors"
    >
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center ${
          completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
        }`}
      >
        {completed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          icon
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${completed ? 'text-neutral-300' : 'text-neutral-400'}`}>
          {label}
        </div>
        <div className="text-xs text-neutral-600 truncate">{subtitle}</div>
      </div>
      <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  )
}

export function HealthToday({ data }: HealthTodayProps) {
  return (
    <div className="space-y-3">
      {/* Sleep & Steps metrics */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label="Wake"
          value={data.wake.value}
          target={data.wake.target}
          met={data.wake.met}
          href="/health/sleep"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Steps"
          value={data.steps.value}
          target={data.steps.target}
          met={data.steps.met}
          href="/health/steps"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
          }
        />
        <MetricCard
          label="Bed"
          value={data.bedtime.value}
          target={data.bedtime.target}
          met={data.bedtime.met}
          href="/health/sleep"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          }
        />
      </div>

      {/* Diet & Workout actions */}
      <div className="grid grid-cols-2 gap-2">
        <ActionCard
          label="Diet"
          completed={data.diet.completed}
          subtitle={data.diet.signalCount > 0 ? `${data.diet.signalCount}/10 signals` : 'Log signals'}
          href="/health/diet"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
            </svg>
          }
        />
        <ActionCard
          label="Workout"
          completed={data.workout.completed}
          subtitle={data.workout.templateName || 'Log workout'}
          href="/health/workouts"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
        />
      </div>
    </div>
  )
}
