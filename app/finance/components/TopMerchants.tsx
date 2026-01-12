'use client'

import type { MerchantTotal } from '../types'

interface TopMerchantsProps {
  merchants: MerchantTotal[]
}

export function TopMerchants({ merchants }: TopMerchantsProps) {
  if (merchants.length === 0) {
    return (
      <div className="text-[12px] text-neutral-600 text-center py-6">
        No merchants this week
      </div>
    )
  }

  return (
    <div className="space-y-0 divide-y divide-neutral-800/40">
      {merchants.map((merchant, index) => (
        <div
          key={merchant.merchant}
          className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-[11px] tabular-nums text-neutral-600 w-4">
              {index + 1}
            </span>
            <span className="text-[13px] text-neutral-300 truncate">{merchant.merchant}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="font-mono text-[13px] tabular-nums text-neutral-200">
              £{merchant.total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {merchant.count > 1 && (
              <span className="font-mono text-[11px] tabular-nums text-neutral-600">
                ×{merchant.count}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
