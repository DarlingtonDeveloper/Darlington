'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'

export type CompassPanel = 'who' | 'what' | 'how' | 'why' | null

interface CompassContextType {
  activePanel: CompassPanel
  openPanel: (panel: CompassPanel) => void
  closePanel: () => void
  isTransitioning: boolean
}

const CompassContext = createContext<CompassContextType | undefined>(undefined)

export function CompassProvider({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState<CompassPanel>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimer = useRef<NodeJS.Timeout | null>(null)

  const openPanel = useCallback((panel: CompassPanel) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActivePanel(panel)
    if (transitionTimer.current) clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const closePanel = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActivePanel(null)
    if (transitionTimer.current) clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  return (
    <CompassContext.Provider value={{ activePanel, openPanel, closePanel, isTransitioning }}>
      {children}
    </CompassContext.Provider>
  )
}

export function useCompass() {
  const context = useContext(CompassContext)
  if (!context) {
    throw new Error('useCompass must be used within a CompassProvider')
  }
  return context
}

export function useCompassOptional() {
  return useContext(CompassContext)
}
