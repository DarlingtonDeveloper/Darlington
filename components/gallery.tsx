"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";
import { Carousel } from "@/components/ui/carousel";
import Image from "next/image";
import { CarouselItem } from "@/components/types";

// Project item rendering component
const ProjectItem = ({ item }: { item: CarouselItem }) => {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full group"
    >
      <div className="relative h-full overflow-hidden rounded-lg">
        <div className="relative aspect-video w-full h-full">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={item.priority}
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6">
            <div className="w-full">
              <h3 className="text-lg sm:text-xl font-semibold text-white">{item.title}</h3>
              <div className="w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mt-2 rounded-full opacity-80"></div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

export function Gallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Project data
  const projects: CarouselItem[] = [
    {
      src: "/PA.jpg",
      alt: "Psychedelics Anonymous",
      title: "Psychedelics Anonymous",
      href: "https://psychedelicsanonymous.com/",
      priority: true
    },
    {
      src: "/PP.png",
      alt: "PsyPay",
      title: "PsyPay",
      href: "https://psypay.xyz/",
      priority: true
    },
    {
      src: "/PAGallery.png",
      alt: "Psychedelics Anonymous Gallery",
      title: "Psychedelics Anonymous Gallery",
      href: "https://pa-rarity-gallery.vercel.app/",
      priority: false
    },
    {
      src: "/mf.png",
      alt: "Morf",
      title: "Morf",
      href: "https://v0-next-js-conf-2024-mkknu2.vercel.app/",
      priority: false
    }
  ];

  return (
    <section ref={ref} className="w-full h-full flex flex-col">
      <motion.h1
        className="mb-2 md:mb-4 text-center text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter lg:text-4xl flex flex-col sm:flex-row items-center justify-center gap-2"
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
          className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden py-0.5 sm:py-1 md:py-1.5 justify-center rounded-lg flex items-center font-medium"
          waitTime={1500}
          deleteSpeed={40}
          cursorChar="|"
          cursorClassName="text-purple-400 ml-1"
        />
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        className="px-1 sm:px-4 h-full flex items-center"
      >
        <Carousel<CarouselItem>
          items={projects}
          renderItem={(item) => <ProjectItem item={item} />}
          slidesToShow={{ mobile: 1, desktop: 2 }}
          autoPlay={true}
          scrollDuration={30000} // 30 seconds to scroll through all items for a gentle effect
          gap={24}
          className="w-full h-[90%] sm:h-auto"
        />
      </motion.div>
    </section>
  );
}