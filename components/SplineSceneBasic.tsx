import { Card } from "@/components/ui/card"
import ClientWrapper from "@/components/ClientWrapper"
import { motion } from "framer-motion"
import SplineScene from "@/components/ui/spline-scene"

export function SplineSceneBasic() {
    return (
        <Card className="w-full h-[calc(100vh-320px)] bg-black/[0.96] relative overflow-hidden border-b-0 rounded-b-none sticky top-0 z-10">
            <ClientWrapper>
                <div className="h-full w-full">
                    {/* Background glow effects */}
                    <div className="absolute pointer-events-none inset-0 z-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[120px] opacity-50 animate-pulse" style={{ animationDuration: '8s' }}></div>
                        <div className="absolute bottom-1/3 right-1/3 w-1/3 h-1/3 bg-blue-500/20 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDuration: '12s' }}></div>
                    </div>

                    {/* Content layer */}
                    <div className="flex h-full flex-col md:flex-row relative z-10">
                        {/* Left content */}
                        <div className="flex-1 p-8 md:pl-20 lg:pl-32 flex flex-col justify-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold flex">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                                        Darlington
                                    </span>
                                </h1>
                            </motion.div>
                        </div>

                        {/* Right content */}
                        <div className="flex-1 relative">
                            <SplineScene
                                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </ClientWrapper>
        </Card>
    )
}