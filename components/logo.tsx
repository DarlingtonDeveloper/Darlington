"use client"

import { motion } from "framer-motion"
import { Typewriter } from "@/components/ui/typewriter"
import Link from "next/link"

interface LogoProps {
    className?: string;
    size?: "small" | "large";
}

export function Logo({ className, size = "large" }: LogoProps) {
    // Use different text sizes based on the size prop
    const textSizeClasses = size === "small"
        ? "text-2xl md:text-2xl lg:text-3xl"
        : "text-4xl md:text-5xl lg:text-6xl";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={className}
        >
            <Link
                href="/"
                className="inline-block cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md no-underline"
                aria-label="Go to homepage"
            >
                <h1 className={`${textSizeClasses} font-bold flex`}>
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        Darlington
                    </span>
                    <Typewriter
                        text={[".Architect", ".Developer", ".Designer", ".Engineer"]}
                        speed={70}
                        className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400"
                        waitTime={1500}
                        deleteSpeed={40}
                        cursorChar={"_"}
                        cursorClassName="text-neutral-400 ml-0.5"
                    />
                </h1>
            </Link>
        </motion.div>
    )
}