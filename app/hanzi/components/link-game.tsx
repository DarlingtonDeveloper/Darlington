'use client'

import { useRef } from 'react'
import type { LinkItem, Connection } from '@/lib/hanzi/types'
import { LinkColumn } from './link-column'
import { ConnectionLines } from './connection-lines'

interface LinkGameProps {
  englishItems: LinkItem[]
  pinyinItems: LinkItem[]
  hanziItems: LinkItem[]
  connections: Connection[]
  selectedItem: LinkItem | null
  isSubmitted: boolean
  onItemSelect: (item: LinkItem) => void
  onItemLongPress: (item: LinkItem) => void
  getItemConnection: (item: LinkItem) => Connection | undefined
  flashingIds?: Map<string, boolean>
  newlyAddedIds?: Set<string>
}

export function LinkGame({
  englishItems,
  pinyinItems,
  hanziItems,
  connections,
  selectedItem,
  isSubmitted,
  onItemSelect,
  onItemLongPress,
  getItemConnection,
  flashingIds,
  newlyAddedIds,
}: LinkGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative" ref={containerRef}>
      {/* Connection lines SVG overlay */}
      <ConnectionLines
        containerRef={containerRef}
        connections={connections}
        isSubmitted={isSubmitted}
      />

      {/* Three columns */}
      <div className="grid grid-cols-3 gap-2">
        <LinkColumn
          title="English"
          items={englishItems}
          selectedItem={selectedItem}
          isSubmitted={isSubmitted}
          onItemSelect={onItemSelect}
          onItemLongPress={onItemLongPress}
          getItemConnection={getItemConnection}
          flashingIds={flashingIds}
          newlyAddedIds={newlyAddedIds}
        />
        <LinkColumn
          title="Pinyin"
          items={pinyinItems}
          selectedItem={selectedItem}
          isSubmitted={isSubmitted}
          onItemSelect={onItemSelect}
          onItemLongPress={onItemLongPress}
          getItemConnection={getItemConnection}
          flashingIds={flashingIds}
          newlyAddedIds={newlyAddedIds}
        />
        <LinkColumn
          title="Hanzi"
          items={hanziItems}
          selectedItem={selectedItem}
          isSubmitted={isSubmitted}
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
