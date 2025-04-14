"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { RainbowButton } from "@/components/ui/rainbow-button"


export function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "TypeScript", "Python", ".NET", "Go"]

  const works = [
    {
      id: 1,
      title: "Psychedelics Anonymous",
      category: "TypeScript",
      image: "/PA.jpg?height=400&width=600",
      year: "2024",
    },
    {
      id: 2,
      title: "PsyPay",
      category: "TypeScript",
      image: "/PP.png?height=400&width=600",
      year: "2024",
    },
    {
      id: 3,
      title: "Morf",
      category: "TypeScript",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 4,
      title: "Sprout",
      category: "TypeScript",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 5,
      title: "E3",
      category: "TypeScript",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 6,
      title: "Arise",
      category: "TypeScript",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 7,
      title: "TelexistenceAPI",
      category: ".NET",
      image: "/placeholder.svg?height=400&width=600",
      year: "2024",
    },
    {
      id: 8,
      title: "ArchAngel",
      category: "Go",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 9,
      title: "Fraud Detection",
      category: "TypeScript",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 10,
      title: "CrewAI",
      category: "Python",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 11,
      title: "ConnectFourRL",
      category: "Python",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 12,
      title: "VARCalculator",
      category: "Python",
      image: "/placeholder.svg?height=400&width=600",
      year: "2024",
    },
    {
      id: 13,
      title: "TAPlotter",
      category: "Python",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    },
    {
      id: 14,
      title: "PageLoadTimeExtension",
      category: "TypeScript",
      image: "/placeholder.svg?height=400&width=600",
      year: "2025",
    }
  ]

  const filteredWorks = works.filter((work) => (selectedCategory === "all" ? true : work.category === selectedCategory))

  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <RainbowButton
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-sm capitalize ${selectedCategory === category ? 'opacity-100' : 'opacity-70 hover:opacity-90'}`}
            >
              {category}
            </RainbowButton>
          ))}
        </div>
        <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredWorks.map((work) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={4}
                  />
                  <Card className="overflow-hidden bg-zinc-900 relative rounded-xl border-[0.5px] shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <CardContent className="p-0">
                      <div className="group relative">
                        <img
                          src={work.image || "/placeholder.svg"}
                          alt={work.title}
                          className="w-full transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <h3 className="text-xl font-semibold text-white">{work.title}</h3>
                          <p className="mt-2 text-sm text-gray-300">{work.year}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}