"use client"

import { Home, LayoutGrid, Images, BookOpen, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"
import { motion } from "framer-motion"
import { Typewriter } from "@/components/ui/typewriter"

export function Header() {
    const navItems = [
        { name: 'Home', url: '/', icon: Home },
        { name: 'Projects', url: '/projects', icon: LayoutGrid },
        { name: 'Systems', url: '/systems', icon: Images },
        { name: 'Blog', url: 'https://blog.darlington.dev', icon: BookOpen },
        { name: 'Docs', url: 'https://docs.darlington.dev', icon: FileText }
    ]

    return (
        <div className="h-full w-full relative flex flex-col">
            <div className="absolute top-4 left-0 right-0 z-50">
                <NavBar items={navItems} />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 flex items-end px-8 md:px-20 lg:px-32 pb-3"
            >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold flex flex-wrap">
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
            </motion.div>
        </div>
    )
}