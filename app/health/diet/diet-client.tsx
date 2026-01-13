'use client'

import { useState, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import type { DietEntry } from '../page'

interface DietClientProps {
  initialDate: string
  initialData: DietEntry | null
  yesterdayData: DietEntry | null
  userId: string
}

const DIET_SIGNALS = [
  { key: 'no_alcohol', label: 'No Alcohol', description: 'Avoided alcoholic drinks' },
  { key: 'no_snacking', label: 'No Snacking', description: 'No unplanned snacks between meals' },
  { key: 'no_sugar', label: 'No Sugar', description: 'Avoided added sugars' },
  { key: 'no_junk', label: 'No Junk', description: 'No fast food or processed junk' },
  { key: 'protein_focus', label: 'Protein Focus', description: 'Prioritized protein at meals' },
  { key: 'hydration', label: 'Hydration', description: 'Drank enough water' },
  { key: 'no_late_eating', label: 'No Late Eating', description: 'Stopped eating 3h before bed' },
  { key: 'ate_vegetables', label: 'Ate Vegetables', description: 'Had vegetables with meals' },
  { key: 'caffeine_cutoff', label: 'Caffeine Cutoff', description: 'No caffeine after 2pm' },
  { key: 'mindful_portions', label: 'Mindful Portions', description: 'Ate appropriate portions' },
] as const

type SignalKey = (typeof DIET_SIGNALS)[number]['key']

function SignalToggle({
  signal,
  value,
  onToggle,
  onCustomValue,
}: {
  signal: (typeof DIET_SIGNALS)[number]
  value: number
  onToggle: () => void
  onCustomValue: (value: number) => void
}) {
  const [showInput, setShowInput] = useState(false)
  const lastTapRef = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleTap = () => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < 300) {
      // Double tap - show custom input
      setShowInput(true)
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      // Single tap - toggle
      onToggle()
    }

    lastTapRef.current = now
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const num = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
    onCustomValue(num)
    setShowInput(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const num = Math.min(100, Math.max(0, parseInt((e.target as HTMLInputElement).value) || 0))
      onCustomValue(num)
      setShowInput(false)
    }
    if (e.key === 'Escape') {
      setShowInput(false)
    }
  }

  const isComplete = value === 100
  const isPartial = value > 0 && value < 100
  const isEmpty = value === 0

  return (
    <div
      className={`
        flex items-center justify-between p-4
        border-b border-neutral-800/40
        cursor-pointer active:bg-neutral-800/30
        transition-colors
      `}
      onClick={handleTap}
    >
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${isEmpty ? 'text-neutral-400' : 'text-neutral-50'}`}>
          {signal.label}
        </div>
        <div className="text-sm text-neutral-500 truncate">{signal.description}</div>
      </div>

      {showInput ? (
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={100}
          defaultValue={value}
          className="w-16 p-2 bg-neutral-800 border border-neutral-700 rounded text-center font-mono text-neutral-50"
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            font-mono font-semibold text-sm
            ${isComplete ? 'bg-emerald-600 text-white' : ''}
            ${isPartial ? 'bg-amber-600 text-white' : ''}
            ${isEmpty ? 'bg-neutral-800 text-neutral-500' : ''}
          `}
        >
          {value}
        </div>
      )}
    </div>
  )
}

export function DietClient({ initialDate, initialData, yesterdayData }: DietClientProps) {
  const [signals, setSignals] = useState<Record<SignalKey, number>>(() => {
    if (initialData) {
      return {
        no_alcohol: initialData.no_alcohol,
        no_snacking: initialData.no_snacking,
        no_sugar: initialData.no_sugar,
        no_junk: initialData.no_junk,
        protein_focus: initialData.protein_focus,
        hydration: initialData.hydration,
        no_late_eating: initialData.no_late_eating,
        ate_vegetables: initialData.ate_vegetables,
        caffeine_cutoff: initialData.caffeine_cutoff,
        mindful_portions: initialData.mindful_portions,
      }
    }
    return {
      no_alcohol: 0,
      no_snacking: 0,
      no_sugar: 0,
      no_junk: 0,
      protein_focus: 0,
      hydration: 0,
      no_late_eating: 0,
      ate_vegetables: 0,
      caffeine_cutoff: 0,
      mindful_portions: 0,
    }
  })
  const [isSaving, setIsSaving] = useState(false)

  const saveSignals = useCallback(
    async (newSignals: Record<SignalKey, number>) => {
      setIsSaving(true)

      try {
        const response = await fetch('/api/health/diet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: initialDate,
            ...newSignals,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save')
        }
      } catch (error) {
        console.error('Error saving diet entry:', error)
      } finally {
        setIsSaving(false)
      }
    },
    [initialDate]
  )

  const handleToggle = useCallback(
    (key: SignalKey) => {
      setSignals((prev) => {
        const newValue = prev[key] === 0 ? 100 : 0
        const newSignals = { ...prev, [key]: newValue }
        saveSignals(newSignals)
        return newSignals
      })
    },
    [saveSignals]
  )

  const handleCustomValue = useCallback(
    (key: SignalKey, value: number) => {
      setSignals((prev) => {
        const newSignals = { ...prev, [key]: value }
        saveSignals(newSignals)
        return newSignals
      })
    },
    [saveSignals]
  )

  // Calculate scores
  const completedCount = Object.values(signals).filter((v) => v > 0).length
  const averageScore = Math.round(
    Object.values(signals).reduce((sum, v) => sum + v, 0) / 10
  )
  const yesterdayScore = yesterdayData?.daily_score ?? null

  const todayLabel = format(new Date(initialDate), 'EEEE, MMMM d')

  return (
    <div className="pb-safe">
      {/* Header */}
      <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto py-6">
        <h1 className="text-lg font-semibold text-neutral-50">Diet Signals</h1>
        <p className="text-sm text-neutral-500">{todayLabel}</p>
      </div>

      {/* Score Summary */}
      <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto mb-4">
        <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold font-mono tabular-nums text-neutral-50">
                {completedCount}/10
              </div>
              <div className="text-sm text-neutral-500">signals logged</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold font-mono tabular-nums text-neutral-50">
                {averageScore}%
              </div>
              <div className="text-sm text-neutral-500">
                {yesterdayScore !== null ? (
                  averageScore > yesterdayScore ? (
                    <span className="text-emerald-500">+{averageScore - yesterdayScore} vs yesterday</span>
                  ) : averageScore < yesterdayScore ? (
                    <span className="text-red-400">{averageScore - yesterdayScore} vs yesterday</span>
                  ) : (
                    'same as yesterday'
                  )
                ) : (
                  'average score'
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${averageScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div className="sm:max-w-2xl sm:mx-auto">
        <div className="bg-neutral-900/30 border-y border-neutral-800/40">
          {DIET_SIGNALS.map((signal) => (
            <SignalToggle
              key={signal.key}
              signal={signal}
              value={signals[signal.key]}
              onToggle={() => handleToggle(signal.key)}
              onCustomValue={(value) => handleCustomValue(signal.key, value)}
            />
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto mt-6">
        <p className="text-xs text-neutral-600 text-center">
          Tap to toggle (0 ↔ 100) · Double-tap for custom value
        </p>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-800 text-neutral-300 text-sm px-4 py-2 rounded-full">
          Saving...
        </div>
      )}
    </div>
  )
}
