'use client'

import React, { useRef } from 'react'
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
    // Always define all transforms to avoid conditional hook calls
    const moveAmount = 100 * speed

    // Define all transformations unconditionally
    const yUp = useTransform(scrollYProgress, [0, 1], [moveAmount + offset, -moveAmount + offset])
    const yDown = useTransform(scrollYProgress, [0, 1], [-moveAmount + offset, moveAmount + offset])
    const xLeft = useTransform(scrollYProgress, [0, 1], [moveAmount + offset, -moveAmount + offset])
    const xRight = useTransform(scrollYProgress, [0, 1], [-moveAmount + offset, moveAmount + offset])

    // Select the appropriate transform based on direction
    let transform = {}
    if (direction === 'up') {
        transform = { y: yUp }
    } else if (direction === 'down') {
        transform = { y: yDown }
    } else if (direction === 'left') {
        transform = { x: xLeft }
    } else if (direction === 'right') {
        transform = { x: xRight }
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

interface MultiLayerParallaxProps {
    children: React.ReactNode
    className?: string
}

export function MultiLayerParallax({
    children,
    className = ''
}: MultiLayerParallaxProps) {
    return (
        <div className={`relative ${className}`}>
            {children}
        </div>
    )
}

interface ParallaxLayerProps {
    children: React.ReactNode
    speed?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    className?: string
    zIndex?: number
    style?: React.CSSProperties
}

export function ParallaxLayer({
    children,
    speed = 0.5,
    direction = 'up',
    className = '',
    zIndex = 0,
    style
}: ParallaxLayerProps) {
    return (
        <ScrollParallax
            speed={speed}
            direction={direction}
            className={`absolute inset-0 ${className}`}
        >
            <div style={{ zIndex, ...style }}>
                {children}
            </div>
        </ScrollParallax>
    )
}