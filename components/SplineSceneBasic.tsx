import ClientWrapper from "@/components/ClientWrapper"
import SplineScene from "@/components/ui/spline-scene"

export function SplineSceneBasic() {
    return (
        <div className="w-full h-full relative">
            <ClientWrapper>
                <div className="h-full w-full">
                    {/* Background glow effects */}
                    <div className="absolute pointer-events-none inset-0 z-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[120px] opacity-50 animate-pulse" style={{ animationDuration: '8s' }}></div>
                        <div className="absolute bottom-1/3 right-1/3 w-1/3 h-1/3 bg-blue-500/20 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDuration: '12s' }}></div>
                    </div>

                    {/* Content layer - critically: using relative positioning and constraining height */}
                    <div className="relative w-full h-full z-10">
                        <SplineScene
                            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </ClientWrapper>
        </div>
    )
}