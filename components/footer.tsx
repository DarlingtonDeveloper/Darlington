'use client'

import { SparklesCore } from "@/components/ui/sparkles"
import { SocialIcons } from "@/components/ui/social-icons"
import { Github, Linkedin, Instagram } from 'lucide-react'
import { XIcon } from "@/components/x-icon"
import { HashNodeIcon } from "@/components/hashnode-icon"
import { TextRotate } from "@/components/ui/text-rotate"
import { useEffect, useRef } from "react"

export function Footer() {
    const sparklesRef = useRef<HTMLDivElement>(null);

    // Use effect to add pointer-events-none to canvas elements within sparkles
    useEffect(() => {
        if (sparklesRef.current) {
            const canvasElements = sparklesRef.current.querySelectorAll('canvas');
            canvasElements.forEach(canvas => {
                canvas.style.pointerEvents = 'none';
            });
        }
    }, []);

    // Define social platforms for better maintainability
    const socialPlatforms = [
        {
            Icon: Github,
            href: "https://github.com/Darlingtondeveloper/",
            label: "GitHub Profile",
            className: "hover:scale-105"
        },
        {
            Icon: XIcon,
            href: "https://x.com/DarlingtonDev",
            label: "X (Twitter) Profile",
            className: "hover:scale-105"
        },
        {
            Icon: Linkedin,
            href: "https://www.linkedin.com/in/DarlingtonDev/",
            label: "LinkedIn Profile",
            className: "hover:scale-105"
        },
        {
            Icon: Instagram,
            href: "https://instagram.com/Darlington.dev",
            label: "Instagram Profile",
            className: "hover:scale-105"
        },
        {
            Icon: HashNodeIcon,
            href: "https://blog.darlington.dev/",
            label: "HashNode Blog",
            className: "hover:scale-105"
        }
    ];

    return (
        <footer className="w-full h-full bg-black/80 relative overflow-hidden">
            {/* Decorative gradients */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm pointer-events-none" />
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4 pointer-events-none" />
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm pointer-events-none" />
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4 pointer-events-none" />

            {/* Sparkles with ref to access canvas */}
            <div ref={sparklesRef} className="absolute inset-0 pointer-events-none">
                <SparklesCore
                    background="transparent"
                    minSize={0.3}
                    maxSize={1}
                    particleDensity={1300}
                    className="w-full h-full pointer-events-none"
                    particleColor="#FFFFFF"
                    speed={0.8}
                />
            </div>

            {/* Content overlay with high z-index */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                <div className="text-center px-4">
                    {/* Headline with text rotation - FIXED to stay on one line */}
                    <div className="flex items-center justify-center whitespace-nowrap text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        <span className="mr-2">Let&apos;s build together on</span>
                        <TextRotate
                            texts={[
                                "GitHub.",
                                "X.",
                                "LinkedIn.",
                                "Instagram.",
                                "HashNode."
                            ]}
                            mainClassName="text-white px-2 sm:px-2 md:px-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden py-0.5 sm:py-1 justify-center rounded-lg flex items-center font-medium"
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

                    {/* Social Icons with higher z-index */}
                    <SocialIcons
                        icons={socialPlatforms}
                        iconSize={22}
                        className="mt-2 relative z-50"
                        buttonClassName="size-10 sm:size-12"
                    />
                </div>
            </div>

            {/* Radial gradient mask - ensure it doesn't block clicks */}
            <div className="absolute inset-0 w-full h-full [mask-image:radial-gradient(600px_400px_at_center,transparent_20%,black)] pointer-events-none"></div>
        </footer>
    );
}