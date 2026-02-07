'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCompass, type CompassPanel } from '@/contexts/compass-context'

const PROMPTS: {
  id: CompassPanel
  label: string
  position: string
  mobilePosition: string
  hover: { x?: number; y?: number }
  exit: { x?: number; y?: number }
  isAccent?: boolean
}[] = [
  {
    id: 'who',
    label: 'WHO',
    position: 'left-[8%] top-1/2 -translate-y-1/2',
    mobilePosition: 'left-[5%] top-1/2 -translate-y-1/2',
    hover: { x: -6 },
    exit: { x: -80 },
  },
  {
    id: 'what',
    label: 'WHAT',
    position: 'top-[8%] left-1/2 -translate-x-1/2',
    mobilePosition: 'top-[6%] left-1/2 -translate-x-1/2',
    hover: { y: -5 },
    exit: { y: -80 },
  },
  {
    id: 'how',
    label: 'HOW',
    position: 'right-[8%] top-1/2 -translate-y-1/2',
    mobilePosition: 'right-[5%] top-1/2 -translate-y-1/2',
    hover: { x: 6 },
    exit: { x: 80 },
  },
  {
    id: 'why',
    label: 'WHY',
    position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    mobilePosition: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    hover: { y: 3 },
    exit: { y: 80 },
    isAccent: true,
  },
]

export function CompassPrompts() {
  const { activePanel, openPanel } = useCompass()

  return (
    <AnimatePresence>
      {activePanel === null &&
        PROMPTS.map((prompt) => (
          <motion.button
            key={prompt.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              x: prompt.exit.x,
              y: prompt.exit.y,
              transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
            }}
            whileHover={{
              x: prompt.hover.x,
              y: prompt.hover.y,
              transition: { duration: 0.2 },
            }}
            onClick={() => openPanel(prompt.id)}
            className={`absolute z-30 ${prompt.position} md:${prompt.position}
              font-display uppercase tracking-[0.15em]
              min-w-[44px] min-h-[44px] flex items-center justify-center
              cursor-pointer select-none
              ${prompt.isAccent
                ? 'text-[#c4b5a0] text-[1.5rem] md:text-[1.7rem] transition-[text-shadow] duration-300'
                : 'text-[#8a8690] hover:text-[var(--fg)] text-[1.35rem] md:text-[1.55rem] transition-colors duration-200'
              }`}
            style={prompt.isAccent
              ? { textShadow: '0 0 12px rgba(196,181,160,0.3), 0 0 30px rgba(196,181,160,0.1)' }
              : undefined}
            onMouseEnter={prompt.isAccent ? (e) => {
              (e.currentTarget as HTMLElement).style.textShadow = '0 0 20px rgba(196,181,160,0.5), 0 0 50px rgba(196,181,160,0.2)'
            } : undefined}
            onMouseLeave={prompt.isAccent ? (e) => {
              (e.currentTarget as HTMLElement).style.textShadow = '0 0 12px rgba(196,181,160,0.3), 0 0 30px rgba(196,181,160,0.1)'
            } : undefined}
            aria-label={`Open ${prompt.label} panel`}
          >
            {prompt.label}
          </motion.button>
        ))}
    </AnimatePresence>
  )
}
