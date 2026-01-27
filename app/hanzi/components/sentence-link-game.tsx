'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import type { SentenceLinkItem, SentenceConnection } from '@/lib/hanzi/types'

interface SentenceLinkGameProps {
  chineseItems: SentenceLinkItem[]
  pinyinItems: SentenceLinkItem[]
  englishItems: SentenceLinkItem[]
  selectedItem: SentenceLinkItem | null
  onItemSelect: (item: SentenceLinkItem) => void
  onItemLongPress: (item: SentenceLinkItem) => void
  getItemConnection: (item: SentenceLinkItem) => SentenceConnection | undefined
  flashingIds?: Map<string, boolean>
  newlyAddedIds?: Set<string>
}

function SentenceItemCard({
  item,
  isSelected,
  isConnected,
  isComplete,
  onSelect,
  onLongPress,
  isFlashing,
  flashResult,
  isNewlyAdded,
}: {
  item: SentenceLinkItem
  isSelected: boolean
  isConnected: boolean
  isComplete: boolean
  onSelect: (item: SentenceLinkItem) => void
  onLongPress: (item: SentenceLinkItem) => void
  isFlashing: boolean
  flashResult: boolean | null
  isNewlyAdded: boolean
}) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress(item)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // Determine text size based on content type
  const textSize = item.type === 'chinese' ? 'text-lg' : 'text-sm'

  return (
    <button
      data-item-id={item.id}
      onClick={() => onSelect(item)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={cn(
        'w-full py-3 px-2 rounded-lg border text-center transition-all duration-150 min-h-[60px] flex items-center justify-center',
        textSize,
        // Base state
        !isSelected && !isConnected && !isFlashing &&
          'bg-neutral-900 border-neutral-800 hover:bg-neutral-800',
        // Selected state
        isSelected && !isFlashing && 'bg-blue-900/30 border-blue-600',
        // Connected but not complete
        isConnected && !isComplete && !isFlashing &&
          'bg-neutral-800 border-neutral-600',
        // Flashing correct
        isFlashing && flashResult === true &&
          'bg-emerald-500/30 border-emerald-500 text-emerald-50',
        // Flashing incorrect
        isFlashing && flashResult === false &&
          'bg-red-500/30 border-red-500 text-red-50',
        // Entrance animation
        isNewlyAdded && 'animate-word-fade-in'
      )}
    >
      <span className="leading-tight">{item.content}</span>
    </button>
  )
}

function SentenceColumn({
  title,
  items,
  selectedItem,
  onItemSelect,
  onItemLongPress,
  getItemConnection,
  flashingIds,
  newlyAddedIds,
}: {
  title: string
  items: SentenceLinkItem[]
  selectedItem: SentenceLinkItem | null
  onItemSelect: (item: SentenceLinkItem) => void
  onItemLongPress: (item: SentenceLinkItem) => void
  getItemConnection: (item: SentenceLinkItem) => SentenceConnection | undefined
  flashingIds?: Map<string, boolean>
  newlyAddedIds?: Set<string>
}) {
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
        const isFlashing = flashingIds?.has(item.id) ?? false
        const flashResult = flashingIds?.get(item.id) ?? null
        const isNewlyAdded = newlyAddedIds?.has(item.sentenceId) ?? false

        return (
          <SentenceItemCard
            key={item.id}
            item={item}
            isSelected={isSelected}
            isConnected={isConnected}
            isComplete={isComplete}
            onSelect={onItemSelect}
            onLongPress={onItemLongPress}
            isFlashing={isFlashing}
            flashResult={flashResult}
            isNewlyAdded={isNewlyAdded}
          />
        )
      })}
    </div>
  )
}

export function SentenceLinkGame({
  chineseItems,
  pinyinItems,
  englishItems,
  selectedItem,
  onItemSelect,
  onItemLongPress,
  getItemConnection,
  flashingIds,
  newlyAddedIds,
}: SentenceLinkGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative" ref={containerRef}>
      {/* Three columns: Chinese | Pinyin | English */}
      <div className="grid grid-cols-3 gap-2">
        <SentenceColumn
          title="Chinese"
          items={chineseItems}
          selectedItem={selectedItem}
          onItemSelect={onItemSelect}
          onItemLongPress={onItemLongPress}
          getItemConnection={getItemConnection}
          flashingIds={flashingIds}
          newlyAddedIds={newlyAddedIds}
        />
        <SentenceColumn
          title="Pinyin"
          items={pinyinItems}
          selectedItem={selectedItem}
          onItemSelect={onItemSelect}
          onItemLongPress={onItemLongPress}
          getItemConnection={getItemConnection}
          flashingIds={flashingIds}
          newlyAddedIds={newlyAddedIds}
        />
        <SentenceColumn
          title="English"
          items={englishItems}
          selectedItem={selectedItem}
          onItemSelect={onItemSelect}
          onItemLongPress={onItemLongPress}
          getItemConnection={getItemConnection}
          flashingIds={flashingIds}
          newlyAddedIds={newlyAddedIds}
        />
      </div>
    </div>
  )
}
