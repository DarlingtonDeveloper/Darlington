"use client";
import React, { useId, useState, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";

type SparklesCoreProps = {
    className?: string;
    background?: string;
    particleColor?: string;
    particleDensity?: number;
    minSize?: number;
    maxSize?: number;
    speed?: number;
};

export const SparklesCore = ({
    className,
    background = "transparent",
    particleColor = "#FFFFFF",
    particleDensity = 120,
    minSize = 0.4,
    maxSize = 1.2,
    speed = 0.8,
}: SparklesCoreProps) => {
    const [init, setInit] = useState(false);
    const controls = useAnimation();
    const id = useId();

    // Initialize particles engine only once
    useEffect(() => {
        let isMounted = true;

        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            if (isMounted) {
                setInit(true);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const particlesLoaded = async () => {
        controls.start({
            opacity: 1,
            transition: { duration: 1 },
        });
    };

    return (
        <motion.div
            animate={controls}
            className={cn("opacity-0", className)}
        >
            {init && (
                <Particles
                    id={id}
                    className={cn("h-full w-full")}
                    particlesLoaded={particlesLoaded}
                    options={{
                        background: {
                            color: { value: background },
                        },
                        fullScreen: {
                            enable: false,
                            zIndex: 1,
                        },
                        fpsLimit: 60,
                        particles: {
                            color: {
                                value: particleColor,
                            },
                            move: {
                                enable: true,
                                speed: { min: 0.1, max: 1 },
                                direction: "none",
                                random: false,
                                straight: false,
                                outModes: {
                                    default: "out",
                                },
                            },
                            number: {
                                density: {
                                    enable: true,
                                    width: 400,
                                    height: 400,
                                },
                                value: particleDensity,
                            },
                            opacity: {
                                value: {
                                    min: 0.1,
                                    max: 1,
                                },
                                animation: {
                                    enable: true,
                                    speed: speed,
                                    decay: 0,
                                    sync: false,
                                    startValue: "random",
                                },
                            },
                            size: {
                                value: {
                                    min: minSize,
                                    max: maxSize,
                                },
                            },
                            shape: {
                                type: "circle",
                            },
                        },
                        detectRetina: true,
                    }}
                />
            )}
        </motion.div>
    );
};