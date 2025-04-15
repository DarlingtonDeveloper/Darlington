/* eslint-disable import/no-unresolved */
'use client';

import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline').then(mod => mod.default), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    ),
});

interface SplineSceneProps {
    scene: string;
    className?: string;
}

export default function SplineScene({ scene, className }: SplineSceneProps) {
    return <Spline scene={scene} className={className} />;
}
