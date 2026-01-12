'use client'

import { useState } from 'react'
import type { CategorizedTransaction } from '../types'
import { CATEGORY_ICONS } from '../types'
import { getCategoryList } from '../lib/categorize'

interface ManualCategorizeProps {
  transaction: CategorizedTransaction
  onCategorize: (category: string, merchantName?: string) => void
  onSkip: () => void
}

export function ManualCategorize({
  transaction,
  onCategorize,
  onSkip,
}: ManualCategorizeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [merchantName, setMerchantName] = useState<string>('')

  const categories = getCategoryList()

  const handleSubmit = () => {
    if (selectedCategory) {
      onCategorize(selectedCategory, merchantName || undefined)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-neutral-900 border border-neutral-800/60 rounded-md max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800/40 flex-shrink-0">
          <h3 className="text-[13px] font-medium text-neutral-200">Categorize</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Transaction details */}
          <div className="bg-neutral-800/30 rounded-md p-3">
            <div className="text-[12px] text-neutral-500 mb-2 truncate font-mono">
              {transaction.description}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[14px] tabular-nums text-red-400">
                £{Math.abs(transaction.amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-neutral-600">
                {transaction.transaction_date}
              </span>
            </div>
          </div>

          {/* Category selector */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-3 py-2 rounded text-left text-[12px] transition-colors duration-150
                    ${selectedCategory === cat
                      ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                      : 'bg-neutral-800/40 border-neutral-800/40 text-neutral-400 active:bg-neutral-700/50'
                    }
                    border
                  `}
                >
                  <span className="mr-1.5">{CATEGORY_ICONS[cat]}</span>
                  <span className="capitalize">{cat.replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional merchant name */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-2">
              Merchant (optional)
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g., Costa Coffee"
              className="w-full bg-neutral-800/40 border border-neutral-800/40 rounded-md px-3 py-2 text-[13px] text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors duration-150"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-neutral-800/40 flex gap-2 flex-shrink-0">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2.5 rounded-md text-[13px] font-medium text-neutral-500 border border-neutral-800/40 active:bg-neutral-800/50 transition-colors duration-150"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedCategory}
            className={`
              flex-1 px-4 py-2.5 rounded-md text-[13px] font-medium transition-colors duration-150
              ${selectedCategory
                ? 'bg-emerald-600 text-white active:bg-emerald-700'
                : 'bg-neutral-800/50 text-neutral-600 cursor-not-allowed'
              }
            `}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
