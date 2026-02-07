'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
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
  noScroll?: boolean
}

export function PanelWrapper({ direction, children, className = '', noScroll = false }: PanelWrapperProps) {
  const { closePanel } = useCompass()
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    },
    [closePanel]
  )

  const isSlide = direction === 'left' || direction === 'right'

  // For slide panels: click outside the panel closes it
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (isSlide && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel()
      }
    },
    [closePanel, isSlide]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleEscape, handleClickOutside])

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  const variants = MOTION_VARIANTS[direction]

  // For zoom panels: backdrop click closes, content click doesn't
  if (!isSlide) {
    return (
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute inset-0 z-50 outline-none flex items-center justify-center ${className}`}
        onClick={closePanel}
      >
        {/* Close button */}
        <button
          onClick={closePanel}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 min-w-[44px] min-h-[44px]
                     flex items-center justify-center rounded-full
                     text-[var(--fg2)] hover:text-[var(--fg)] transition-colors duration-200"
          aria-label="Close panel"
        >
          <X size={20} />
        </button>

        <div
          ref={contentRef}
          className="h-full overflow-y-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute z-50 outline-none
        top-0 ${direction === 'left' ? 'left-0' : 'right-0'} h-full w-full md:w-[60vw] max-w-[900px]
        ${className}`}
    >
      <div
        className={`h-full bg-[#07070e]/90 backdrop-blur-xl border-r border-white/5 p-6 pb-14 md:p-8 md:pb-16
          ${noScroll ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'}`}
      >
        {children}
      </div>
    </motion.div>
  )
}
