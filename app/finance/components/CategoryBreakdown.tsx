'use client'

import type { CategoryTotal } from '../types'

interface CategoryBreakdownProps {
  categories: CategoryTotal[]
  totalSpent: number
}

export function CategoryBreakdown({ categories, totalSpent }: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <div className="text-[12px] text-neutral-600 text-center py-6">
        No spending this week
      </div>
    )
  }

  const maxTotal = Math.max(...categories.map(c => c.total))

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const percentage = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0
        const barWidth = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0

        return (
          <div key={cat.category} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[13px] flex-shrink-0">{cat.icon}</span>
                <span className="text-[13px] text-neutral-400 capitalize truncate">
                  {cat.category.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="font-mono text-[13px] tabular-nums text-neutral-200">
                  £{cat.total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-neutral-600 w-8 text-right">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-1 bg-neutral-800/60 rounded-sm overflow-hidden">
              <div
                className="h-full bg-neutral-500 rounded-sm transition-all duration-200"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
