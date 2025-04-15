"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    slidesToShow?: number;
    autoPlay?: boolean;
    interval?: number;
    showControls?: boolean;
    showIndicators?: boolean;
    className?: string;
}

export function Carousel({
    items,
    renderItem,
    slidesToShow = 1,
    autoPlay = true,
    interval = 5000,
    showControls = true,
    showIndicators = true,
    className
}: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const maxIndex = Math.max(0, items.length - slidesToShow);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle auto play
    useEffect(() => {
        if (!autoPlay || isPaused) return;

        const timer = setTimeout(() => {
            next();
        }, interval);

        return () => clearTimeout(timer);
    }, [currentIndex, autoPlay, interval, isPaused]);

    // Navigation functions
    const prev = () => {
        setCurrentIndex(current => (current <= 0 ? maxIndex : current - 1));
    };

    const next = () => {
        setCurrentIndex(current => (current >= maxIndex ? 0 : current + 1));
    };

    const goTo = (index: number) => {
        setCurrentIndex(Math.min(Math.max(0, index), maxIndex));
    };

    // Render visible slides
    const renderVisibleItems = () => {
        const visibleItems = [];

        for (let i = 0; i < slidesToShow; i++) {
            const index = (currentIndex + i) % items.length;
            if (index < items.length) {
                visibleItems.push(
                    <div
                        key={index}
                        className={cn(
                            "h-full",
                            slidesToShow > 1 ? `w-1/${slidesToShow} px-3` : "w-full"
                        )}
                    >
                        {renderItem(items[index], index)}
                    </div>
                );
            }
        }

        return visibleItems;
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative rounded-lg overflow-hidden", className)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Carousel track */}
            <div className="relative aspect-[4/3] md:aspect-[16/9]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 w-full h-full flex"
                    >
                        {renderVisibleItems()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            {showControls && items.length > slidesToShow && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 text-white rounded-full backdrop-blur-sm hover:bg-black/50 z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 text-white rounded-full backdrop-blur-sm hover:bg-black/50 z-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Indicators */}
            {showIndicators && maxIndex > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goTo(index)}
                            className={cn(
                                "h-2 rounded-full transition-all",
                                index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{
                        width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`
                    }}
                    transition={{ duration: autoPlay ? interval / 1000 : 0 }}
                />
            </div>
        </div>
    );
}