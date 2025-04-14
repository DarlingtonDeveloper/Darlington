'use client'

import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import dynamic from 'next/dynamic'
import ClientWrapper from "@/components/ClientWrapper"

// Dynamic import with ssr: false
const SplineScene = dynamic(() => import('@/components/ui/spline-scene'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
})

export function SplineSceneBasic() {
    return (
        <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden">
            <ClientWrapper>
                <div className="flex h-full flex-col md:flex-row">
                    {/* Left content */}
                    <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                            Interactive 3D
                        </h1>
                        <p className="mt-4 text-neutral-300 max-w-lg">
                            Bring your UI to life with beautiful 3D scenes. Create immersive experiences
                            that capture attention and enhance your design.
                        </p>
                    </div>

                    {/* Right content */}
                    <div className="flex-1 relative">
                        <SplineScene
                            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </ClientWrapper>
        </Card>
    )
}