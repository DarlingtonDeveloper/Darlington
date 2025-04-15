"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimationControls, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface CarouselProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    slidesToShow?: number | { mobile: number; desktop: number };
    autoPlay?: boolean;
    scrollDuration?: number;
    className?: string;
    gap?: number;
    dragThreshold?: number;
}

export function Carousel({
    items,
    renderItem,
    slidesToShow = 1,
    autoPlay = true,
    scrollDuration = 20000, // Time to scroll through all items
    className,
    gap = 16,
    dragThreshold = 50
}: CarouselProps) {
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentSlidesToShow, setCurrentSlidesToShow] = useState<number>(
        typeof slidesToShow === 'object' ? slidesToShow.mobile : slidesToShow
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const animationControls = useAnimationControls();
    const dragStartX = useRef(0);
    const autoScrollRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    // Handle responsive slidesToShow
    useEffect(() => {
        if (typeof slidesToShow === 'object') {
            const handleResize = () => {
                const isMobile = window.innerWidth < 768; // Match the md: breakpoint
                setCurrentSlidesToShow(isMobile ? slidesToShow.mobile : slidesToShow.desktop);
            };

            handleResize(); // Initialize
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [slidesToShow]);

    // Double the items for smoother infinite scrolling
    const normalizedItems = [...items, ...items];

    // Calculate width percentage based on slidesToShow and gap
    const slideWidth = `calc(${100 / currentSlidesToShow}% - ${(gap * (currentSlidesToShow - 1)) / currentSlidesToShow}px)`;

    // Auto scroll animation
    const animateScroll = (timestamp: number) => {
        if (isPaused) {
            lastTimeRef.current = timestamp;
            autoScrollRef.current = requestAnimationFrame(animateScroll);
            return;
        }

        if (lastTimeRef.current === null) {
            lastTimeRef.current = timestamp;
            autoScrollRef.current = requestAnimationFrame(animateScroll);
            return;
        }

        const deltaTime = timestamp - lastTimeRef.current;
        const progressIncrement = deltaTime / scrollDuration;

        setProgress(prev => {
            let newProgress = prev + progressIncrement;
            if (newProgress >= 1) {
                newProgress = 0; // Reset when we've scrolled through all items
            }

            // Update the track position
            const maxPosition = items.length - currentSlidesToShow;
            const position = newProgress * maxPosition;
            const trackX = position * (100 / currentSlidesToShow) + position * (gap / currentSlidesToShow);

            animationControls.set({
                x: `-${trackX}%`
            });

            return newProgress;
        });

        lastTimeRef.current = timestamp;
        autoScrollRef.current = requestAnimationFrame(animateScroll);
    };

    // Start and stop auto scroll
    useEffect(() => {
        if (autoPlay && !isPaused && items.length > currentSlidesToShow) {
            lastTimeRef.current = null;
            autoScrollRef.current = requestAnimationFrame(animateScroll);
        }

        return () => {
            if (autoScrollRef.current) {
                cancelAnimationFrame(autoScrollRef.current);
            }
        };
    }, [autoPlay, isPaused, items.length, currentSlidesToShow]);

    // Handle manual navigation
    const handleDragStart = (_: any, info: PanInfo) => {
        setIsPaused(true);
        dragStartX.current = info.point.x;
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        const dragEndX = info.point.x;
        const dragDifference = dragStartX.current - dragEndX;

        if (Math.abs(dragDifference) > dragThreshold) {
            // Calculate position based on drag direction and amount
            const newProgress = progress + ((dragDifference / (containerRef.current?.clientWidth || 500)) * 0.5);
            setProgress(Math.max(0, Math.min(1, newProgress)));

            // Update the track position
            const maxPosition = items.length - currentSlidesToShow;
            const position = newProgress * maxPosition;
            const trackX = position * (100 / currentSlidesToShow) + position * (gap / currentSlidesToShow);

            animationControls.start({
                x: `-${trackX}%`,
                transition: { type: "spring", stiffness: 100, damping: 30 }
            });
        }

        setTimeout(() => {
            setIsPaused(false);
        }, 1000);
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", className)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <motion.div
                className="flex w-full h-full"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                dragElastic={0.2}
                animate={animationControls}
                initial={{ x: "0%" }}
                style={{
                    touchAction: "pan-y", // Allow vertical scrolling on touch devices
                }}
            >
                {normalizedItems.map((item, index) => {
                    // Adjust index to get the correct item from the original array
                    const originalIndex = index % items.length;

                    return (
                        <div
                            key={`carousel-item-${index}`}
                            className="flex-shrink-0"
                            style={{
                                width: slideWidth,
                                marginRight: `${gap}px`
                            }}
                        >
                            {renderItem(item, originalIndex)}
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
}