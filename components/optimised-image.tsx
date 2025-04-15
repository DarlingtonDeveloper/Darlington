'use client';

import Image, { ImageProps } from 'next/image';
import { cn } from "@/lib/utils";
import { useState } from 'react';

type OptimizedImageProps = Omit<ImageProps, 'onLoadingComplete'> & {
    aspectRatio?: string;
};

export function OptimizedImage({
    className,
    src,
    alt,
    aspectRatio = 'aspect-video',
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={cn('overflow-hidden relative', aspectRatio, className)}>
            <Image
                className={cn(
                    'duration-700 ease-in-out object-cover',
                    isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'
                )}
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onLoad={() => setIsLoading(false)}
                {...props}
            />
            {isLoading && (
                <div
                    className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 animate-pulse"
                    aria-hidden="true"
                />
            )}
        </div>
    );
}