'use client'

import { SparklesCore } from "@/components/ui/sparkles"
import { SocialIcons } from "@/components/ui/social-icons"
import { Github, Linkedin, Instagram } from "lucide-react"
import { XIcon } from "@/components/x-icon"
import { HashNodeIcon } from "@/components/hashnode-icon"
import { TextRotate } from "@/components/ui/text-rotate"

export function SparklesSection() {
    // Define social icons
    const socialIcons = [
        {
            Icon: Github,
            href: "https://github.com/Darlingtondeveloper/",
            className: "hover:scale-105"
        },
        {
            Icon: XIcon,
            href: "https://x.com/DarlingtonDev",
            className: "hover:scale-105"
        },
        {
            Icon: Linkedin,
            href: "https://www.linkedin.com/in/DarlingtonDev/",
            className: "hover:scale-105"
        },
        {
            Icon: Instagram,
            href: "https://instagram.com/Darlington.dev",
            className: "hover:scale-105"
        },
        {
            Icon: HashNodeIcon,
            href: "https://hashnode.com/@darlington",
            className: "hover:scale-105"
        }
    ]

    return (
        <div className="w-full h-80 relative bg-black rounded-t-none rounded-b-lg overflow-hidden mt-0 z-20">
            {/* Gradients */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

            {/* Core sparkles component */}
            <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1.2}
                particleDensity={300}
                className="w-full h-full"
                particleColor="#FFFFFF"
                speed={0.8}
            />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="text-center px-4">
                    <div className="flex items-center justify-center mb-6 text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        <span className="mr-2">Connect with me on</span>
                        <TextRotate
                            texts={[
                                "GitHub.",
                                "X.",
                                "LinkedIn.",
                                "Instagram.",
                                "HashNode."
                            ]}
                            mainClassName="text-white px-2 sm:px-2 md:px-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden py-0.5 sm:py-1 md:py-1.5 justify-center rounded-lg flex items-center font-medium"
                            staggerFrom="first"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-120%" }}
                            staggerDuration={0.025}
                            splitLevelClassName="overflow-hidden"
                            elementLevelClassName="inline-block"
                            transition={{ type: "spring", damping: 30, stiffness: 400 }}
                            rotationInterval={3000}
                        />
                    </div>

                    {/* Social Icons */}
                    <SocialIcons
                        icons={socialIcons}
                        iconSize={28}
                        className="mt-4"
                    />
                </div>
            </div>

            {/* Radial Gradient to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full [mask-image:radial-gradient(600px_400px_at_center,transparent_20%,black)]"></div>
        </div>
    )
}