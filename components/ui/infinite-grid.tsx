"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfiniteGridProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    columns?: number | { sm: number; md: number; lg: number; xl: number; '2xl': number };
    gap?: number;
    className?: string;
    itemClassName?: string;
    maxItemWidth?: number;
}

export function InfiniteGrid<T>({
    items,
    renderItem,
    columns = { sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
    gap = 16,
    className,
    itemClassName,
    maxItemWidth = 300, // Cap the maximum width of each item
}: InfiniteGridProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [gridItems, setGridItems] = useState<Array<{ id: string; col: number; row: number; itemIndex: number }>>([]);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPositionRef = useRef({ x: 0, y: 0 });
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Calculate responsive column count based on screen width
    const currentColumns = useMemo(() => {
        if (typeof columns === 'number') {
            return columns;
        }

        // Calculate columns based on container width
        const width = dimensions.width;
        if (width === 0) return columns.md; // Default fallback

        if (width >= 1536) return columns['2xl']; // 2xl screens (1536px+)
        if (width >= 1280) return columns.xl;     // xl screens (1280px+)
        if (width >= 1024) return columns.lg;     // lg screens (1024px+)
        if (width >= 768) return columns.md;      // md screens (768px+)
        return columns.sm;                        // sm screens (<768px)
    }, [columns, dimensions.width]);

    // Calculate item width and other grid properties based on container width
    const gridConfig = useMemo(() => {
        if (dimensions.width === 0) {
            return {
                itemWidth: 250,
                itemHeight: 250,
                viewportRows: 5,
                viewportCols: typeof columns === 'number' ? columns + 2 : columns.md + 2
            };
        }

        // Calculate item width based on container width, columns, and gap
        const availableWidth = dimensions.width - (gap * (currentColumns - 1));
        const calculatedWidth = Math.min(availableWidth / currentColumns, maxItemWidth);
        const itemWidth = calculatedWidth;
        const itemHeight = itemWidth; // Square items

        // Calculate how many rows/columns are needed to fill the viewport plus overflow
        const viewportRows = Math.ceil(dimensions.height / (itemHeight + gap)) + 2;
        const viewportCols = currentColumns + 2; // Add buffer columns

        return {
            itemWidth,
            itemHeight,
            viewportRows,
            viewportCols
        };
    }, [dimensions.width, dimensions.height, currentColumns, gap, maxItemWidth, columns]);

    // Function to get a unique item index different from neighbors
    const getUniqueItemIndex = useCallback((col: number, row: number) => {
        // Simple deterministic but pseudo-random selection based on position
        const seed = Math.abs((col * 13) + (row * 17)) % items.length;

        // For the main items (your featured projects), use deterministic placement
        if (col >= 0 && row >= 0 && col < currentColumns && row < Math.ceil(items.length / currentColumns)) {
            const index = row * currentColumns + col;
            return index < items.length ? index : seed;
        }

        // For infinity grid, use the seed
        return seed;
    }, [items.length, currentColumns]);

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
        if (isDragging) return; // Prevent re-entry if already dragging
        setIsDragging(true);

        // Get starting position
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        dragStartRef.current = { x: clientX, y: clientY };
        lastPositionRef.current = position;
    };

    const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        // Calculate drag delta
        const clientX = 'touches' in e ?
            (e as TouchEvent).touches[0].clientX :
            (e as MouseEvent).clientX;
        const clientY = 'touches' in e ?
            (e as TouchEvent).touches[0].clientY :
            (e as MouseEvent).clientY;

        const deltaX = clientX - dragStartRef.current.x;
        const deltaY = clientY - dragStartRef.current.y;

        // Update position without triggering re-renders for every mouse movement
        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
            setPosition({
                x: lastPositionRef.current.x + deltaX,
                y: lastPositionRef.current.y + deltaY
            });
        });
    }, [isDragging]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Attach drag event handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
        const handleTouchMove = (e: TouchEvent) => handleDragMove(e);

        const handleMouseUp = () => handleDragEnd();
        const handleTouchEnd = () => handleDragEnd();

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            document.addEventListener('touchmove', handleTouchMove, { passive: true });
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    // Handle initial empty state
    useEffect(() => {
        if (gridItems.length === 0 && dimensions.width > 0) {
            updateGridItems();
        }
    }, [gridItems.length, dimensions.width, updateGridItems]);

    // Initialize grid position
    useEffect(() => {
        if (dimensions.width > 0 && containerRef.current && gridConfig) {
            // Initial position in center for all screen sizes
            const { itemWidth } = gridConfig;
            const visibleColumns = Math.min(currentColumns, items.length);
            const totalGridWidth = visibleColumns * (itemWidth + gap) - gap;

            // Center horizontally if the grid is smaller than the container
            if (totalGridWidth < dimensions.width) {
                const centerX = (dimensions.width - totalGridWidth) / 2;
                setPosition(prev => ({ ...prev, x: centerX }));
            } else {
                // For very small screens or when the grid is wider than container,
                // start position at 0 (default)
                setPosition(prev => ({ ...prev, x: 0 }));
            }
        }
    }, [dimensions.width, currentColumns, gridConfig, gap, items.length]);

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

            {/* Debug overlay - can be useful during development */}
            {process.env.NODE_ENV === 'development' && false && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs p-2 rounded">
                    <div>Items: {items.length}</div>
                    <div>Grid Items: {gridItems.length}</div>
                    <div>Columns: {currentColumns}</div>
                    <div>Item Width: {gridConfig.itemWidth.toFixed(0)}px</div>
                    <div>Position: {position.x.toFixed(0)}, {position.y.toFixed(0)}</div>
                    <div>Dimensions: {dimensions.width.toFixed(0)}x{dimensions.height.toFixed(0)}</div>
                </div>
            )}
        </div>
    );
}