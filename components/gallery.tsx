"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import Image from "next/image"
import { Typewriter } from "@/components/ui/typewriter"

export function Gallery() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const images = [
    {
      src: "/PA.jpg",
      alt: "Psychedelics Anonymous",
      title: "Psychedelics Anonymous",
      href: "https://psychedelicsanonymous.com/"
    },
    {
      src: "/PP.png",
      alt: "PsyPay",
      title: "PsyPay",
      href: "https://psypay.xyz/"
    },
    {
      src: "/PAGallery.png",
      alt: "Psychedelics Anonymous Gallery",
      title: "Psychedelics Anonymous Gallery",
      href: "https://pa-rarity-gallery.vercel.app/"
    },
    {
      src: "/Morf.png",
      alt: "Morf",
      title: "Morf",
      href: "https://v0-next-js-conf-2024-mkknu2.vercel.app/"
    },
  ]

  return (
    <section ref={ref} className="w-full">
      <motion.h2
        className="mb-10 text-center text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl flex flex-col sm:flex-row items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="whitespace-nowrap mb-2 sm:mb-0">A selection of</span>
        <Typewriter
          text={[
            "Interactive Frontend Builds.",
            "Modern Web Applications.",
            "Live Prototypes.",
            "Responsive Web Interfaces.",
            "Production-Ready UI."
          ]}
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
              <div className="aspect-[2/3] relative overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority={index < 2} // Prioritize loading the first two images
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