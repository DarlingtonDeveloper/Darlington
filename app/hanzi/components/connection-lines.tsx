'use client'

import { useEffect, useState, RefObject } from 'react'
import type { Connection } from '@/lib/hanzi/types'

interface ConnectionLinesProps {
  containerRef: RefObject<HTMLDivElement | null>
  connections: Connection[]
  isSubmitted: boolean
}

interface Line {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  isCorrect: boolean | null
  isComplete: boolean
  isDashed?: boolean // For incomplete connections (e.g., English + Hanzi without Pinyin)
}

export function ConnectionLines({
  containerRef,
  connections,
  isSubmitted,
}: ConnectionLinesProps) {
  const [lines, setLines] = useState<Line[]>([])

  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLines: Line[] = []

      connections.forEach(conn => {
        // Get element positions (all IDs can be null now)
        const englishEl = conn.englishId ? document.getElementById(conn.englishId) : null
        const pinyinEl = conn.pinyinId ? document.getElementById(conn.pinyinId) : null
        const hanziEl = conn.hanziId ? document.getElementById(conn.hanziId) : null

        // Draw line from English to Pinyin if both exist
        if (englishEl && pinyinEl) {
          const englishRect = englishEl.getBoundingClientRect()
          const pinyinRect = pinyinEl.getBoundingClientRect()

          newLines.push({
            id: `${conn.englishId}-${conn.pinyinId}`,
            x1: englishRect.right - containerRect.left,
            y1: englishRect.top + englishRect.height / 2 - containerRect.top,
            x2: pinyinRect.left - containerRect.left,
            y2: pinyinRect.top + pinyinRect.height / 2 - containerRect.top,
            isCorrect: conn.isCorrect,
            isComplete: conn.isComplete,
          })
        }

        // Draw line from Pinyin to Hanzi if both exist
        if (pinyinEl && hanziEl) {
          const pinyinRect = pinyinEl.getBoundingClientRect()
          const hanziRect = hanziEl.getBoundingClientRect()

          newLines.push({
            id: `${conn.pinyinId}-${conn.hanziId}`,
            x1: pinyinRect.right - containerRect.left,
            y1: pinyinRect.top + pinyinRect.height / 2 - containerRect.top,
            x2: hanziRect.left - containerRect.left,
            y2: hanziRect.top + hanziRect.height / 2 - containerRect.top,
            isCorrect: conn.isCorrect,
            isComplete: conn.isComplete,
          })
        }

        // Draw dashed line from English to Hanzi if pinyin is missing (incomplete connection)
        if (englishEl && hanziEl && !pinyinEl) {
          const englishRect = englishEl.getBoundingClientRect()
          const hanziRect = hanziEl.getBoundingClientRect()

          newLines.push({
            id: `${conn.englishId}-${conn.hanziId}-incomplete`,
            x1: englishRect.right - containerRect.left,
            y1: englishRect.top + englishRect.height / 2 - containerRect.top,
            x2: hanziRect.left - containerRect.left,
            y2: hanziRect.top + hanziRect.height / 2 - containerRect.top,
            isCorrect: conn.isCorrect,
            isComplete: false,
            isDashed: true,
          })
        }
      })

      setLines(newLines)
    }

    updateLines()

    // Update on resize
    window.addEventListener('resize', updateLines)
    return () => window.removeEventListener('resize', updateLines)
  }, [connections, containerRef])

  if (lines.length === 0) return null

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="lineGradientBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient
          id="lineGradientCorrect"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="lineGradientIncorrect"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {lines.map(line => {
        let stroke = 'url(#lineGradientBlue)'
        if (isSubmitted && line.isCorrect === true) {
          stroke = 'url(#lineGradientCorrect)'
        } else if (isSubmitted && line.isCorrect === false) {
          stroke = 'url(#lineGradientIncorrect)'
        }

        // Calculate control points for a smooth curve
        const dx = line.x2 - line.x1
        const controlX1 = line.x1 + dx * 0.4
        const controlX2 = line.x1 + dx * 0.6

        return (
          <path
            key={line.id}
            d={`M ${line.x1} ${line.y1} C ${controlX1} ${line.y1}, ${controlX2} ${line.y2}, ${line.x2} ${line.y2}`}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={line.isDashed ? '6 4' : undefined}
            opacity={line.isDashed ? 0.5 : 1}
            className="transition-all duration-150"
          />
        )
      })}
    </svg>
  )
}
