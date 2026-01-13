'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import type { StepsEntry } from '../page'

interface StepsClientProps {
  initialDate: string
  todayData: StepsEntry | null
  historyData: StepsEntry[]
  currentStreak: number
  userId: string
}

function ProgressRing({
  current,
  target,
}: {
  current: number
  target: number
}) {
  const percentage = Math.min(100, (current / target) * 100)
  const circumference = 2 * Math.PI * 70

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-44 h-44 transform -rotate-90">
        <circle
          cx="88"
          cy="88"
          r="70"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-neutral-800"
        />
        <circle
          cx="88"
          cy="88"
          r="70"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className={percentage >= 100 ? 'text-emerald-500' : 'text-emerald-600/70'}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percentage / 100) * circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono tabular-nums text-neutral-50">
          {current.toLocaleString()}
        </span>
        <span className="text-sm text-neutral-500">
          / {(target / 1000).toFixed(0)}k steps
        </span>
      </div>
    </div>
  )
}

export function StepsClient({
  initialDate,
  todayData,
  historyData,
  currentStreak,
}: StepsClientProps) {
  const [showManualInput, setShowManualInput] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [stepsToday, setStepsToday] = useState<StepsEntry | null>(todayData)

  const todayLabel = format(new Date(initialDate), 'EEEE, MMMM d')
  const target = stepsToday?.target ?? 10000
  const current = stepsToday?.step_count ?? 0
  const percentage = Math.round((current / target) * 100)

  const handleManualSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const steps = parseInt(inputValue.replace(/[^0-9]/g, ''))
      if (isNaN(steps) || steps <= 0) return

      setIsSaving(true)

      try {
        const response = await fetch('/api/health/steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: initialDate,
            step_count: steps,
          }),
        })

        if (!response.ok) throw new Error('Failed to save')

        const { data } = await response.json()
        setStepsToday(data)
        setShowManualInput(false)
        setInputValue('')
      } catch (error) {
        console.error('Error saving steps:', error)
        alert('Failed to save steps')
      } finally {
        setIsSaving(false)
      }
    },
    [inputValue, initialDate]
  )

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto pb-safe">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-lg font-semibold text-neutral-50">Steps</h1>
        <p className="text-sm text-neutral-500">{todayLabel}</p>
      </div>

      {/* Progress Ring */}
      <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-6 mb-4">
        <ProgressRing current={current} target={target} />

        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-neutral-50">{percentage}%</div>
            <div className="text-xs text-neutral-500">of goal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-emerald-500">{currentStreak}</div>
            <div className="text-xs text-neutral-500">day streak</div>
          </div>
        </div>

        {percentage >= 100 && (
          <div className="mt-4 text-center text-emerald-500 text-sm font-medium">
            Goal reached!
          </div>
        )}
      </div>

      {/* Manual Input Toggle */}
      {!showManualInput ? (
        <button
          onClick={() => setShowManualInput(true)}
          className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition-colors mb-4"
        >
          Log Steps Manually
        </button>
      ) : (
        <form onSubmit={handleManualSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter step count"
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-50 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
              autoFocus
            />
            <button
              type="submit"
              disabled={isSaving || !inputValue.trim()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
            >
              {isSaving ? '...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowManualInput(false)}
              className="px-4 py-3 bg-neutral-800 text-neutral-400 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* History */}
      {historyData.length > 0 && (
        <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800/40">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Recent Days
            </h3>
          </div>
          <div className="divide-y divide-neutral-800/40">
            {historyData.slice(0, 7).map((entry) => {
              const pct = Math.round((entry.step_count / entry.target) * 100)
              const atGoal = pct >= 100

              return (
                <div key={entry.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-neutral-400">
                      {format(new Date(entry.entry_date), 'EEE, MMM d')}
                    </div>
                    <div className="font-mono tabular-nums text-neutral-50">
                      {entry.step_count.toLocaleString()}
                      <span className={`ml-2 text-sm ${atGoal ? 'text-emerald-500' : 'text-neutral-500'}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${atGoal ? 'bg-emerald-500' : 'bg-emerald-600/50'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-600">
          Steps are synced via iOS Shortcut in the evening.
          <br />
          Use manual entry as a fallback if needed.
        </p>
      </div>
    </div>
  )
}
