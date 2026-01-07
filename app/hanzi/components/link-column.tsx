'use client'

import type { LinkItem, Connection } from '@/lib/hanzi/types'
import { LinkItemCard } from './link-item'

interface LinkColumnProps {
  title: string
  items: LinkItem[]
  selectedItem: LinkItem | null
  isSubmitted: boolean
  onItemSelect: (item: LinkItem) => void
  onItemLongPress: (item: LinkItem) => void
  getItemConnection: (item: LinkItem) => Connection | undefined
}

export function LinkColumn({
  title,
  items,
  selectedItem,
  isSubmitted,
  onItemSelect,
  onItemLongPress,
  getItemConnection,
}: LinkColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider text-center mb-1">
        {title}
      </h3>
      {items.map(item => {
        const connection = getItemConnection(item)
        const isSelected = selectedItem?.id === item.id
        const isConnected = !!connection
        const isComplete = connection?.isComplete ?? false
        const isCorrect = connection?.isCorrect ?? null

        return (
          <LinkItemCard
            key={item.id}
            item={item}
            isSelected={isSelected}
            isConnected={isConnected}
            isComplete={isComplete}
            isCorrect={isCorrect}
            isSubmitted={isSubmitted}
            onSelect={onItemSelect}
            onLongPress={onItemLongPress}
          />
        )
      })}
    </div>
  )
}
