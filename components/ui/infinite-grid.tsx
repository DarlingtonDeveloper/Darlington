"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfiniteGridProps {
    items: any[]; // The cards/items to display 
    renderItem: (item: any, index: number) => React.ReactNode;
    columns?: number; // Number of columns in the grid
    gap?: number; // Gap between grid items in pixels
    className?: string;
    itemClassName?: string;
}

export function InfiniteGrid({
    items,
    renderItem,
    columns = 3,
    gap = 16,
    className,
    itemClassName,
}: InfiniteGridProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Calculate rows based on items and columns
    const rows = Math.ceil(items.length / columns);

    // Use motion values for smooth performance
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);

    // Get container dimensions
    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                setDimensions({ width: rect.width, height: rect.height });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    // Calculate item dimensions with precise math to avoid rounding issues
    const calculateItemWidth = (containerWidth: number, cols: number, gapPx: number) => {
        // Ensure we get a precise value that accounts for all gaps
        const availableWidth = containerWidth - (gapPx * (cols - 1));
        return availableWidth / cols;
    };

    const itemWidth = dimensions.width > 0
        ? calculateItemWidth(dimensions.width, columns, gap)
        : 0;

    const itemHeight = itemWidth; // Square items for simplicity

    // Calculate grid dimensions with precision
    const gridWidth = itemWidth * columns + gap * (columns - 1);
    const gridHeight = rows * itemHeight + (rows - 1) * gap;

    // Create transformed motion values for wrapping effect
    const wrappedX = useTransform(dragX, (value) => {
        // Use modulo to create the wrapping effect
        return ((value % gridWidth) + gridWidth) % gridWidth * -1;
    });

    const wrappedY = useTransform(dragY, (value) => {
        // Use modulo to create the wrapping effect
        return ((value % gridHeight) + gridHeight) % gridHeight * -1;
    });

    // Determine how many copies of the grid we need
    const getGridCopies = () => {
        if (dimensions.width === 0) return { x: 3, y: 3 };

        const xCopies = Math.ceil(dimensions.width / gridWidth) + 2;
        const yCopies = Math.ceil(dimensions.height / gridHeight) + 2;

        return {
            x: Math.max(3, xCopies),
            y: Math.max(3, yCopies),
        };
    };

    const gridCopies = getGridCopies();

    // Generate positions for grid copies
    const getGridPositions = () => {
        const halfX = Math.floor(gridCopies.x / 2);
        const halfY = Math.floor(gridCopies.y / 2);

        const positions = [];

        // Create a NxN grid of the original grid
        for (let y = -halfY; y <= halfY; y++) {
            for (let x = -halfX; x <= halfX; x++) {
                positions.push({
                    x: x * gridWidth,
                    y: y * gridHeight,
                    key: `${x}-${y}`,
                });
            }
        }

        return positions;
    };

    const gridPositions = getGridPositions();

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", className)}
        >
            {dimensions.width > 0 && (
                <motion.div
                    className="absolute inset-0"
                    drag
                    dragTransition={{ power: 0.2, timeConstant: 200 }}
                    dragMomentum={true}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => {
                        setIsDragging(false);

                        // Calculate the nearest grid cell to snap to
                        const cellX = Math.round(dragX.get() / (itemWidth + gap));
                        const cellY = Math.round(dragY.get() / (itemHeight + gap));

                        // Calculate target snap position (centered cell)
                        const targetX = cellX * (itemWidth + gap);
                        const targetY = cellY * (itemHeight + gap);

                        // Animate to the snapped position
                        animate(dragX, targetX, { type: "spring", stiffness: 300, damping: 30 });
                        animate(dragY, targetY, { type: "spring", stiffness: 300, damping: 30 });
                    }}
                    onDrag={(_, info) => {
                        // Invert the delta for more natural scrolling direction
                        dragX.set(dragX.get() - info.delta.x);
                        dragY.set(dragY.get() - info.delta.y);
                    }}
                    style={{
                        x: wrappedX,
                        y: wrappedY,
                        touchAction: 'none'
                    }}
                >
                    {gridPositions.map((grid) => (
                        <div
                            key={grid.key}
                            className="absolute"
                            style={{
                                left: grid.x,
                                top: grid.y,
                                width: gridWidth,
                                height: gridHeight,
                            }}
                        >
                            {items.map((item, index) => {
                                const row = Math.floor(index / columns);
                                const col = index % columns;

                                return (
                                    <motion.div
                                        key={index}
                                        className={cn("absolute", itemClassName)}
                                        style={{
                                            left: col * itemWidth + col * gap,
                                            top: row * itemHeight + row * gap,
                                            width: itemWidth,
                                            height: itemHeight,
                                        }}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{
                                            scale: 1.05,
                                            zIndex: 10,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        {renderItem(item, index)}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}