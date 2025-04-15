"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { Typewriter } from "@/components/ui/typewriter"

export function Gallery() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const images = [
    {
      src: "/PA.jpg?height=600&width=400",
      alt: "Psychedelics Anonymous",
      title: "Psychedelics Anonymous",
      href: "https://psychedelicsanonymous.com/"
    },
    {
      src: "/PP.png?height=600&width=400",
      alt: "PsyPay",
      title: "PsyPay",
      href: "https://psypay.xyz/"
    },
    {
      src: "/PAGallery.png?height=600&width=400",
      alt: "Psychedelics Anonymous Gallery",
      title: "Psychedelics Anonymous Gallery",
      href: "https://pa-rarity-gallery.vercel.app/"
    },
    {
      src: "/Morf.png?height=600&width=400",
      alt: "Morf",
      title: "Morf",
      href: "https://v0-next-js-conf-2024-mkknu2.vercel.app/"
    },
  ]

  return (
    <section ref={ref} className="w-full">
      <motion.h2
        className="mb-10 text-center text-3xl font-bold tracking-tighter sm:text-4xl flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span>A selection of</span>
        <Typewriter
          text={["Interactive Frontend Builds", "Modern Web Applications", "Live Prototypes", "Responsive Web Interfaces", "Production-Ready UI"]}
          speed={70}
          className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          waitTime={1500}
          deleteSpeed={40}
          cursorChar="|"
          cursorClassName="text-purple-400 ml-1"
        />
      </motion.h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="group relative overflow-hidden rounded-lg cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <a
              href={image.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              <div className="aspect-[2/3] overflow-hidden">
                <img
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="text-xl font-semibold text-white">{image.title}</h3>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  )
}