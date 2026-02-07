'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import ClientWrapper from '@/components/ClientWrapper'
import SplineScene from '@/components/ui/spline-scene'
import { useCompass, type CompassPanel } from '@/contexts/compass-context'
import { CompassPrompts } from './compass-prompts'
import { CompassHUD } from './compass-hud'
import { AmbientParticles } from './ambient-particles'

const WhoPanel = dynamic(() => import('./panels/who-panel').then(m => m.WhoPanel), { ssr: false })
const HowPanel = dynamic(() => import('./panels/how-panel').then(m => m.HowPanel), { ssr: false })
const WhatPanel = dynamic(() => import('./panels/what-panel').then(m => m.WhatPanel), { ssr: false })
const WhyPanel = dynamic(() => import('./panels/why-panel').then(m => m.WhyPanel), { ssr: false })

const SPLINE_VARIANTS = {
  idle: { x: 0, y: 0, scale: 1 },
  who: { x: '30%', y: 0, scale: 0.85 },
  how: { x: '-30%', y: 0, scale: 0.85 },
  what: { x: 0, y: '20%', scale: 0.5 },
  why: { x: 0, y: '20%', scale: 1.6 },
}

const TRANSITION = { duration: 0.6, ease: [0.16, 1, 0.3, 1] }

export function CompassShell() {
  const { activePanel, openPanel } = useCompass()
  const searchParams = useSearchParams()

  // Auto-open panel from URL search param
  useEffect(() => {
    const panel = searchParams.get('panel') as CompassPanel
    if (panel && ['who', 'what', 'how', 'why'].includes(panel)) {
      openPanel(panel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const variant = activePanel ?? 'idle'

  return (
    <div className="fixed inset-0 bg-[var(--bg)] overflow-hidden pt-safe pb-safe pl-safe pr-safe">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 65%, rgba(196, 181, 160, 0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Spline robot */}
      <ClientWrapper>
        <motion.div
          className="absolute inset-0 z-10"
          variants={SPLINE_VARIANTS}
          animate={variant}
          transition={TRANSITION}
        >
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </motion.div>
      </ClientWrapper>

      {/* Ambient particles */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <AmbientParticles />
      </div>

      {/* Compass prompts */}
      <CompassPrompts />

      {/* HUD overlay */}
      <CompassHUD />

      {/* Content panels */}
      <AnimatePresence mode="wait">
        {activePanel === 'who' && <WhoPanel key="who" />}
        {activePanel === 'how' && <HowPanel key="how" />}
        {activePanel === 'what' && <WhatPanel key="what" />}
        {activePanel === 'why' && <WhyPanel key="why" />}
      </AnimatePresence>
    </div>
  )
}
