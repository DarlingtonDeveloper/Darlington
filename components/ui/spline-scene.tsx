'use client'

import { Suspense, lazy } from 'react'

// More efficient dynamic import with explicit handling
const Spline = lazy(() =>
    import('@splinetool/react-spline')
        .then(mod => ({ default: mod.default }))
        .catch(() => {
            console.error('Failed to load Spline component');
            return { default: () => null };
        })
);

interface SplineSceneProps {
    scene: string;
    className?: string;
}

export default function SplineScene({ scene, className }: SplineSceneProps) {
    return (
        <Suspense
            fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            }
        >
            <Spline
                scene={scene}
                className={className}
            />
        </Suspense>
    )
}