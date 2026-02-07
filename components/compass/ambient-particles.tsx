'use client'

import { SparklesCore } from '@/components/ui/sparkles'

export function AmbientParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none motion-reduce:hidden">
      <SparklesCore
        className="w-full h-full"
        background="transparent"
        particleColor="rgba(196, 181, 160, 0.3)"
        particleDensity={40}
        minSize={0.3}
        maxSize={1}
        speed={0.4}
      />
    </div>
  )
}
