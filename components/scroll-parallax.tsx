'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollParallaxProps {
    children: React.ReactNode
    className?: string
    speed?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    offset?: number
}

export function ScrollParallax({
    children,
    className = '',
    speed = 0.5,
    direction = 'up',
    offset = 0,
}: ScrollParallaxProps) {
    const ref = useRef<HTMLDivElement>(null)

    // Get scroll progress
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Calculate transform based on direction
    let transform = {}

    // Adjust the multiplier to control movement amount
    const moveAmount = 100 * speed

    if (direction === 'up') {
        transform = { y: useTransform(scrollYProgress, [0, 1], [moveAmount + offset, -moveAmount + offset]) }
    } else if (direction === 'down') {
        transform = { y: useTransform(scrollYProgress, [0, 1], [-moveAmount + offset, moveAmount + offset]) }
    } else if (direction === 'left') {
        transform = { x: useTransform(scrollYProgress, [0, 1], [moveAmount + offset, -moveAmount + offset]) }
    } else if (direction === 'right') {
        transform = { x: useTransform(scrollYProgress, [0, 1], [-moveAmount + offset, moveAmount + offset]) }
    }

    return (
        <div ref={ref} className={`${className} overflow-hidden`}>
            <motion.div
                style={{
                    ...transform,
                    willChange: 'transform'
                }}
                className="h-full w-full"
            >
                {children}
            </motion.div>
        </div>
    )
}

export function MultiLayerParallax({ children, className = '' }) {
    return (
        <div className={`relative ${className}`}>
            {children}
        </div>
    )
}

export function ParallaxLayer({
    children,
    speed = 0.5,
    direction = 'up',
    className = '',
    zIndex = 0
}) {
    return (
        <ScrollParallax
            speed={speed}
            direction={direction}
            className={`absolute inset-0 ${className}`}
            style={{ zIndex }}
        >
            {children}
        </ScrollParallax>
    )
}