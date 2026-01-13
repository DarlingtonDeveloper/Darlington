'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import type { WeightEntry } from '../page'

interface WeightClientProps {
  initialData: WeightEntry[]
  userId: string
}

function TrendChart({ data }: { data: WeightEntry[] }) {
  if (data.length === 0) return null

  // Get last 7 entries for the chart
  const chartData = [...data].reverse().slice(-7)

  if (chartData.length === 0) return null

  const weights = chartData.map((d) => d.weight_kg)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const range = maxWeight - minWeight || 1

  return (
    <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-4">
        7-Day Trend
      </div>

      <div className="flex items-end justify-between gap-2 h-24">
        {chartData.map((entry) => {
          const height = ((entry.weight_kg - minWeight) / range) * 100
          const normalizedHeight = Math.max(10, Math.min(100, 10 + height * 0.9))

          return (
            <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-emerald-600/80 rounded-t transition-all duration-300"
                style={{ height: `${normalizedHeight}%` }}
              />
              <div className="text-[10px] font-mono text-neutral-500">
                {format(new Date(entry.recorded_at), 'EEE').charAt(0)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between mt-2 text-xs font-mono text-neutral-500">
        <span>{minWeight.toFixed(1)} kg</span>
        <span>{maxWeight.toFixed(1)} kg</span>
      </div>
    </div>
  )
}

export function WeightClient({ initialData }: WeightClientProps) {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(initialData)
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const latestWeight = weightHistory[0]?.weight_kg ?? null
  const oldestInRange = weightHistory[weightHistory.length - 1]?.weight_kg ?? null

  // Calculate 7-day trend
  let trendDirection: 'up' | 'down' | 'stable' = 'stable'
  let trendValue = 0

  if (weightHistory.length >= 2 && latestWeight && oldestInRange) {
    trendValue = latestWeight - oldestInRange
    if (trendValue > 0.1) trendDirection = 'up'
    else if (trendValue < -0.1) trendDirection = 'down'
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!inputValue.trim()) return

      setIsSaving(true)

      try {
        // Parse input - support kg or lbs
        let weightKg: number
        const normalized = inputValue.toLowerCase().trim()

        if (normalized.includes('lb') || normalized.includes('pound')) {
          const num = parseFloat(normalized.replace(/[^0-9.]/g, ''))
          weightKg = num * 0.453592
        } else {
          weightKg = parseFloat(normalized.replace(/[^0-9.]/g, ''))
        }

        if (isNaN(weightKg) || weightKg <= 0) {
          throw new Error('Invalid weight')
        }

        const response = await fetch('/api/health/weight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight_kg: weightKg }),
        })

        if (!response.ok) {
          throw new Error('Failed to save')
        }

        const { data } = await response.json()

        // Add to history
        setWeightHistory((prev) => [data, ...prev].slice(0, 30))
        setInputValue('')
      } catch (error) {
        console.error('Error saving weight:', error)
        alert('Failed to save weight. Please check the value and try again.')
      } finally {
        setIsSaving(false)
      }
    },
    [inputValue]
  )

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto pb-safe">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-lg font-semibold text-neutral-50">Weight</h1>
        <p className="text-sm text-neutral-500">Track your weight over time</p>
      </div>

      {/* Current Weight Display */}
      <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-6 mb-4">
        <div className="text-center">
          <div className="text-4xl font-bold font-mono tabular-nums text-neutral-50">
            {latestWeight ? `${latestWeight.toFixed(1)}` : '--'}
            <span className="text-2xl text-neutral-500 ml-1">kg</span>
          </div>

          {trendDirection !== 'stable' && (
            <div
              className={`mt-2 text-sm font-mono ${
                trendDirection === 'down' ? 'text-emerald-500' : 'text-red-400'
              }`}
            >
              {trendDirection === 'down' ? '↓' : '↑'} {Math.abs(trendValue).toFixed(1)} kg
              <span className="text-neutral-500 ml-1">over {weightHistory.length} days</span>
            </div>
          )}

          {latestWeight && (
            <div className="mt-1 text-xs text-neutral-500">
              Last logged: {format(new Date(weightHistory[0].recorded_at), 'MMM d, h:mm a')}
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      {weightHistory.length > 1 && (
        <div className="mb-4">
          <TrendChart data={weightHistory} />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter weight (e.g., 75.5 or 165 lbs)"
            className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-50 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
          />
          <button
            type="submit"
            disabled={isSaving || !inputValue.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-lg font-medium transition-colors"
          >
            {isSaving ? '...' : 'Log'}
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-600">Supports kg or lbs (e.g., &quot;75.5&quot; or &quot;165 lbs&quot;)</p>
      </form>

      {/* History */}
      {weightHistory.length > 0 && (
        <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800/40">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              History
            </h3>
          </div>
          <div className="divide-y divide-neutral-800/40">
            {weightHistory.slice(0, 10).map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-neutral-400">
                  {format(new Date(entry.recorded_at), 'EEE, MMM d')}
                </div>
                <div className="font-mono tabular-nums text-neutral-50">
                  {entry.weight_kg.toFixed(1)} kg
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
