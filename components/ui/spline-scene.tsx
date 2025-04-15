'use client'

import { Suspense, lazy } from 'react'

// Define a fallback component 
const NullComponent = () => null;

// Dynamic import with proper typing
const Spline = lazy(() =>
    import('@splinetool/react-spline')
        .then(mod => ({ default: mod.default }))
        .catch(() => {
            console.error('Failed to load Spline component');
            // Return a module with the same type signature
            return { default: NullComponent };
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