'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useCompass } from '@/contexts/compass-context'

type Direction = 'left' | 'right' | 'zoom-out' | 'zoom-in'

type MotionState = { x?: string | number; y?: string | number; scale?: number; opacity: number }

const MOTION_VARIANTS: Record<Direction, { initial: MotionState; animate: MotionState; exit: MotionState }> = {
  left: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  'zoom-out': {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  'zoom-in': {
    initial: { scale: 1.2, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
}

interface PanelWrapperProps {
  direction: Direction
  children: React.ReactNode
  className?: string
}

export function PanelWrapper({ direction, children, className = '' }: PanelWrapperProps) {
  const { closePanel } = useCompass()
  const panelRef = useRef<HTMLDivElement>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    },
    [closePanel]
  )

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel()
      }
    },
    [closePanel]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleEscape, handleClickOutside])

  // Focus trap: focus panel on mount
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  const variants = MOTION_VARIANTS[direction]
  const isSlide = direction === 'left' || direction === 'right'

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute z-50 outline-none
        ${isSlide
          ? `top-0 ${direction === 'left' ? 'left-0' : 'right-0'} h-full w-full md:w-[60vw] max-w-[900px]`
          : 'inset-0 flex items-center justify-center'
        }
        ${className}`}
      style={{ paddingBottom: '48px' }}
    >
      <div
        className={`h-full overflow-y-auto md:overflow-y-auto
          ${isSlide
            ? 'bg-[#07070e]/90 backdrop-blur-xl border-r border-white/5 p-6 md:p-8'
            : ''
          } no-scrollbar`}
      >
        {children}
      </div>
    </motion.div>
  )
}
