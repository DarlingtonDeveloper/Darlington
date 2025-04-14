'use client';

import React from 'react';
import { motion, useSpring, useTransform, SpringOptions } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SpotlightProps = {
    className?: string;
    size?: number;
    springOptions?: SpringOptions;
    mouseX: number;
    mouseY: number;
};

export function Spotlight({
    className,
    size = 200,
    springOptions = { bounce: 0 },
    mouseX,
    mouseY,
}: SpotlightProps) {
    // Create springs based on the externally controlled mouse positions.
    const springX = useSpring(mouseX, springOptions);
    const springY = useSpring(mouseY, springOptions);

    const spotlightLeft = useTransform(springX, (x) => `${x - size / 2}px`);
    const spotlightTop = useTransform(springY, (y) => `${y - size / 2}px`);

    return (
        <motion.div
            className={cn(
                'pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_center,white,transparent_80%)] blur-xl transition-opacity duration-200',
                className
            )}
            style={{
                width: size,
                height: size,
                left: spotlightLeft,
                top: spotlightTop,
            }}
        />
    );
}
