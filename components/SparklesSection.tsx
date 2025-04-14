'use client'

import { SparklesCore } from "@/components/ui/sparkles"
import { SocialIcons } from "@/components/ui/social-icons"
import { Github, Twitter, Linkedin, Instagram } from "lucide-react"

export function SparklesSection() {
    // Define social icons
    const socialIcons = [
        {
            Icon: Github,
            href: "https://github.com",
            className: "hover:scale-105"
        },
        {
            Icon: Twitter,
            href: "https://twitter.com",
            className: "hover:scale-105"
        },
        {
            Icon: Linkedin,
            href: "https://linkedin.com",
            className: "hover:scale-105"
        },
        {
            Icon: Instagram,
            href: "https://instagram.com",
            className: "hover:scale-105"
        }
    ]

    return (
        <div className="w-full h-80 relative mt-8 bg-black rounded-lg overflow-hidden">
            {/* Gradients */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

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
                <div className="text-center px-4 mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-4">
                        Connect With Us
                    </h2>
                    <p className="text-neutral-300 max-w-xl mx-auto mb-8">
                        Follow our journey and stay updated with the latest developments
                    </p>

                    {/* Social Icons */}
                    <SocialIcons
                        icons={socialIcons}
                        iconSize={24}
                        className="mt-6"
                    />
                </div>
            </div>

            {/* Radial Gradient to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full [mask-image:radial-gradient(600px_400px_at_center,transparent_20%,black)]"></div>
        </div>
    )
}