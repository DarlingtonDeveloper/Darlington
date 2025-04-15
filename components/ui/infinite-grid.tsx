"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfiniteGridProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    columns?: number;
    gap?: number;
    className?: string;
    itemClassName?: string;
}

export function InfiniteGrid<T>({
    items,
    renderItem,
    columns = 3,
    gap = 16,
    className,
    itemClassName,
}: InfiniteGridProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [gridItems, setGridItems] = useState<Array<{ id: string; col: number; row: number; itemIndex: number }>>([]);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPositionRef = useRef({ x: 0, y: 0 });
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Calculate item width and other grid properties based on container width
    const gridConfig = useMemo(() => {
        if (dimensions.width === 0) {
            return {
                itemWidth: 250,
                itemHeight: 250,
                viewportRows: 5,
                viewportCols: columns + 2
            };
        }

        // Calculate item width based on container width, columns, and gap
        const availableWidth = dimensions.width - (gap * (columns - 1));
        const itemWidth = availableWidth / columns;
        const itemHeight = itemWidth; // Square items

        // Calculate how many rows/columns are needed to fill the viewport plus overflow
        const viewportRows = Math.ceil(dimensions.height / (itemHeight + gap)) + 2;
        const viewportCols = columns + 2; // Add buffer columns

        return {
            itemWidth,
            itemHeight,
            viewportRows,
            viewportCols
        };
    }, [dimensions.width, dimensions.height, columns, gap]);

    // Function to get a unique item index different from neighbors
    const getUniqueItemIndex = useCallback((col: number, row: number) => {
        // Simple deterministic but pseudo-random selection based on position
        const seed = Math.abs((col * 13) + (row * 17)) % items.length;

        // For the main items (your featured projects), use deterministic placement
        if (col >= 0 && row >= 0 && col < columns && row < Math.ceil(items.length / columns)) {
            const index = row * columns + col;
            return index < items.length ? index : seed;
        }

        // For infinity grid, use the seed
        return seed;
    }, [items.length, columns]);

    // Update visible grid items
    const updateGridItems = useCallback(() => {
        if (!gridConfig) return;

        const { itemWidth, itemHeight, viewportRows, viewportCols } = gridConfig;

        // Calculate which columns and rows are currently visible
        const startCol = Math.floor(-position.x / (itemWidth + gap)) - 1;
        const startRow = Math.floor(-position.y / (itemHeight + gap)) - 1;

        // Map to track item assignments
        const existing = new Map<string, number>();
        const newItems: Array<{ id: string; col: number; row: number; itemIndex: number }> = [];

        // Determine which cards should be visible
        for (let rowOffset = 0; rowOffset < viewportRows; rowOffset++) {
            for (let colOffset = 0; colOffset < viewportCols; colOffset++) {
                const col = startCol + colOffset;
                const row = startRow + rowOffset;
                const key = `${col},${row}`;

                const itemIndex = getUniqueItemIndex(col, row);
                existing.set(key, itemIndex);

                newItems.push({
                    id: key,
                    col,
                    row,
                    itemIndex
                });
            }
        }

        setGridItems(newItems);
    }, [position, gridConfig, gap, getUniqueItemIndex]);

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setDimensions({ width: rect.width, height: rect.height });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Update grid items when position or dimensions change
    useEffect(() => {
        updateGridItems();
    }, [position, dimensions, updateGridItems]);

    // Handle drag interactions
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);

        // Get starting position
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        dragStartRef.current = { x: clientX, y: clientY };
        lastPositionRef.current = position;
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;

        // Calculate drag delta
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - dragStartRef.current.x;
        const deltaY = clientY - dragStartRef.current.y;

        // Update position
        setPosition({
            x: lastPositionRef.current.x + deltaX,
            y: lastPositionRef.current.y + deltaY
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // Attach drag event handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => handleDragMove(e as unknown as React.MouseEvent);
        const handleTouchMove = (e: TouchEvent) => handleDragMove(e as unknown as React.TouchEvent);

        const handleMouseUp = () => handleDragEnd();
        const handleTouchEnd = () => handleDragEnd();

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);

    // Handle initial empty state
    useEffect(() => {
        if (gridItems.length === 0 && dimensions.width > 0) {
            updateGridItems();
        }
    }, [gridItems.length, dimensions.width, updateGridItems]);

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", className)}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <div
                className="absolute inset-0"
                style={{
                    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                    willChange: 'transform'
                }}
            >
                {gridItems.map(({ id, col, row, itemIndex }) => {
                    const { itemWidth, itemHeight } = gridConfig;
                    const xPos = col * (itemWidth + gap);
                    const yPos = row * (itemHeight + gap);

                    return (
                        <motion.div
                            key={id}
                            className={cn("absolute", itemClassName)}
                            style={{
                                left: xPos,
                                top: yPos,
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
                            {renderItem(items[itemIndex % items.length], itemIndex % items.length)}
                        </motion.div>
                    );
                })}
            </div>

            {/* Debug overlay */}
            {process.env.NODE_ENV === 'development' && false && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs p-2 rounded">
                    <div>Items: {items.length}</div>
                    <div>Grid Items: {gridItems.length}</div>
                    <div>Position: {position.x.toFixed(0)}, {position.y.toFixed(0)}</div>
                    <div>Dimensions: {dimensions.width.toFixed(0)}x{dimensions.height.toFixed(0)}</div>
                </div>
            )}
        </div>
    );
}