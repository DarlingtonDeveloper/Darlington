"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { TextRotate } from "@/components/ui/text-rotate"


export function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "TypeScript", "Python", ".NET", "Go"]

  const works = [
    {
      id: 1,
      title: "ArchAngel",
      category: "Go",
      image: "/aa.png?height=400&width=600",
      year: "2025",
      href: "https://github.com/DarlingtonDeveloper/ArchAngel"
    },
    {
      id: 2,
      title: "This Website",
      category: "TypeScript",
      image: "/Darlington.png?height=400&width=600",
      year: "2025",
      href: "https://github.com/DarlingtonDeveloper/Darlington"
    },
    {
      id: 3,
      title: "Sprout",
      category: "TypeScript",
      image: "/Sprout.gif?height=400&width=600",
      year: "2025",
      href: "https://github.com/DarlingtonDeveloper/Sprout"
    },
    {
      id: 4,
      title: "EIII",
      category: "TypeScript",
      image: "/e3.svg?height=400&width=600",
      year: "2025",
      href: "https://github.com/DarlingtonDeveloper/EIII"
    },
    {
      id: 5,
      title: "TelexistenceAPI",
      category: ".NET",
      image: "/TX.png?height=400&width=600",
      year: "2025",
      href: "https://github.com/DarlingtonDeveloper/TelexistenceAPI"
    },
    {
      id: 6,
      title: "Arise",
      category: "TypeScript",
      image: "/Arise.png?height=400&width=600",
      year: "2025",
      href: "https://github.com/DarlingtonDeveloper/Arise"
    },
    {
      id: 7,
      title: "Fraud Detection",
      category: "TypeScript",
      image: "/Fraud.png?height=400&width=600",
      year: "2025",
      href: "https://github.com/DarlingtonDeveloper/fraud-detection-system"
    },
    {
      id: 8,
      title: "Resume Optimization System",
      category: "Python",
      image: "/crewai.jpg?height=400&width=600",
      year: "2025",
      href: "https://github.com/DarlingtonDeveloper/resume-optimization-crew"
    },
    {
      id: 9,
      title: "Connect Four Reinforcement Learning",
      category: "Python",
      image: "/c4.jpg?height=400&width=600",
      year: "2024",
      href: "https://github.com/DarlingtonDeveloper/ConnectFourRL"
    },
    {
      id: 10,
      title: "Value-At-Risk Calculator",
      category: "Python",
      image: "/VAR.png?height=400&width=600",
      year: "2024",
      href: "https://github.com/DarlingtonDeveloper/VARCalculator"
    },
    {
      id: 11,
      title: "Technical Analysis Plotter",
      category: "Python",
      image: "/TA.png?height=400&width=600",
      year: "2024",
      href: "https://github.com/DarlingtonDeveloper/Technical_Analysis_Plotter"
    },
    {
      id: 12,
      title: "Twitter Sentiment Analysis",
      category: "Python",
      image: "/twitter.png?height=400&width=600",
      year: "2023",
      href: "https://github.com/DarlingtonDeveloper/Twitter-Keyword-Tracker"
    },
    {
      id: 13,
      title: "Discord Activity Bot",
      category: "Python",
      image: "/discord.jpg?height=400&width=600",
      year: "2023",
      href: "https://github.com/DarlingtonDeveloper/Discord-Activity-Bot"
    },
    {
      id: 14,
      title: "Page Load Time Chrome Extension",
      category: "TypeScript",
      image: "/ps.png?height=400&width=600",
      year: "2023",
      href: "https://github.com/DarlingtonDeveloper/PageLoadTimeExtension"
    }
  ]

  const filteredWorks = works.filter((work) => (selectedCategory === "all" ? true : work.category === selectedCategory))

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-2">
          Explore
          <TextRotate
            texts={[
              "System Design",
              "Backend Systems",
              "Microservices",
              "API Engineering",
              "Automation Pipelines",
              "Cloud Infrastructure"
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
          /> on GitHub
        </h2>

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
                  <a
                    href={work.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block cursor-pointer"
                  >
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
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}