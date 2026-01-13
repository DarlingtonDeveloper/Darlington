'use client'

import { useState, useCallback } from 'react'
import { format, startOfWeek, subWeeks, addWeeks, isAfter } from 'date-fns'
import type { WeeklySummary as WeeklySummaryType } from '../types'
import { CategoryBreakdown } from './CategoryBreakdown'
import { TopMerchants } from './TopMerchants'
import { DailyBreakdown } from './DailyBreakdown'
import { ImportModal } from './ImportModal'
import { getWeeklySummaryClient } from '../lib/queries.client'
import { useUser } from '@/hooks/use-user'

interface WeeklySummaryProps {
  initialData: WeeklySummaryType
}

export function WeeklySummary({ initialData }: WeeklySummaryProps) {
  const { userId } = useUser()
  const [data, setData] = useState<WeeklySummaryType>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const loadWeek = useCallback(async (weekStart: Date) => {
    if (!userId) return
    setIsLoading(true)
    try {
      const newData = await getWeeklySummaryClient(weekStart, userId)
      setData(newData)
    } catch (error) {
      console.error('Error loading week:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const goToPrevWeek = useCallback(() => {
    const prevWeek = subWeeks(data.weekStart, 1)
    loadWeek(prevWeek)
  }, [data.weekStart, loadWeek])

  const goToNextWeek = useCallback(() => {
    const nextWeek = addWeeks(data.weekStart, 1)
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    if (!isAfter(nextWeek, thisWeekStart)) {
      loadWeek(nextWeek)
    }
  }, [data.weekStart, loadWeek])

  const handleImportComplete = useCallback(() => {
    loadWeek(data.weekStart)
  }, [data.weekStart, loadWeek])

  const isCurrentWeek = format(data.weekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekLabel = `${format(data.weekStart, 'MMM d')} – ${format(data.weekEnd, 'd, yyyy')}`

  const trendUp = data.percentChange > 0
  const trendColor = trendUp ? 'text-red-400' : data.percentChange < 0 ? 'text-emerald-400' : 'text-neutral-500'

  return (
    <div className="min-h-full pb-safe">
      {/* Week selector - tight, functional */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/60">
        <button
          onClick={goToPrevWeek}
          disabled={isLoading}
          className="w-8 h-8 flex items-center justify-center rounded text-neutral-500 active:bg-neutral-800 transition-colors duration-150 disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-neutral-300 tracking-tight">
            {weekLabel}
          </span>
          {isCurrentWeek && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">Now</span>
          )}
        </div>
        <button
          onClick={goToNextWeek}
          disabled={isLoading || isCurrentWeek}
          className="w-8 h-8 flex items-center justify-center rounded text-neutral-500 active:bg-neutral-800 transition-colors duration-150 disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-[1.5px] border-neutral-600 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          {/* Hero metric - total spent */}
          <div className="py-6 text-center">
            <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-2">
              Total Spent
            </div>
            <div className="text-4xl font-mono tabular-nums font-semibold text-neutral-100 tracking-tight">
              £{data.totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
              {data.previousWeekSpent > 0 && (
                <span className={`text-[12px] font-mono tabular-nums ${trendColor}`}>
                  {trendUp ? '+' : ''}{data.percentChange.toFixed(0)}%
                </span>
              )}
              <span className="text-[12px] text-neutral-600 font-mono tabular-nums">
                {data.transactionCount} txns
              </span>
            </div>
          </div>

          {/* Category breakdown */}
          <section className="bg-neutral-900/50 border border-neutral-800/60 rounded-md">
            <div className="px-4 py-3 border-b border-neutral-800/40">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Categories
              </h3>
            </div>
            <div className="p-4">
              <CategoryBreakdown categories={data.categoryBreakdown} totalSpent={data.totalSpent} />
            </div>
          </section>

          {/* Top merchants */}
          <section className="bg-neutral-900/50 border border-neutral-800/60 rounded-md">
            <div className="px-4 py-3 border-b border-neutral-800/40">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Top Merchants
              </h3>
            </div>
            <div className="p-4">
              <TopMerchants merchants={data.topMerchants} />
            </div>
          </section>

          {/* Daily breakdown */}
          <section className="bg-neutral-900/50 border border-neutral-800/60 rounded-md">
            <div className="px-4 py-3 border-b border-neutral-800/40">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Daily
              </h3>
            </div>
            <div className="p-4">
              <DailyBreakdown dailyTotals={data.dailyTotals} />
            </div>
          </section>

          {/* Import button - subtle, functional */}
          <button
            onClick={() => setShowImport(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-dashed border-neutral-700 text-neutral-500 active:bg-neutral-800/50 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-[13px] font-medium">Import</span>
          </button>
        </div>
      )}

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
}
