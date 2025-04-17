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
        <>
            <NavBar items={navItems} />
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
        </>
    )
}