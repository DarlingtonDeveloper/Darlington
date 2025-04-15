import Spline from '@splinetool/react-spline/next';

interface SplineSceneProps {
    scene: string;
    className?: string;
}

export default function SplineScene({ scene, className }: SplineSceneProps) {
    return <Spline scene={scene} className={className} />;
}
