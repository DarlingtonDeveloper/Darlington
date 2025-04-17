"use client";

import React, { useState } from "react";
import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { Card, CardContent } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { OptimizedImage } from "@/components/optimised-image";
import { TextRotate } from "@/components/ui/text-rotate";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { PortfolioItem } from "@/components/types";

interface PortfolioGridProps {
    className?: string;
    title?: boolean;
}

export function PortfolioGrid({ className, title = true }: PortfolioGridProps) {
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Define all available categories
    const categories = ["all", "TypeScript", "Python", ".NET", "Go"];

    // Portfolio items from the existing portfolio component
    const portfolioItems: PortfolioItem[] = [
        {
            id: 1,
            title: "ArchAngel",
            category: "Go",
            image: "/aa.png",
            year: "2025",
            href: "https://github.com/DarlingtonDeveloper/ArchAngel"
        },
        {
            id: 2,
            title: "This Website",
            category: "TypeScript",
            image: "/Darlington.png",
            year: "2025",
            href: "https://github.com/DarlingtonDeveloper/Darlington"
        },
        {
            id: 3,
            title: "Sprout",
            category: "TypeScript",
            image: "/Sprout.gif",
            year: "2025",
            href: "https://github.com/DarlingtonDeveloper/Sprout"
        },
        {
            id: 4,
            title: "EIII",
            category: "TypeScript",
            image: "/e3.svg",
            year: "2025",
            href: "https://github.com/DarlingtonDeveloper/EIII"
        },
        {
            id: 5,
            title: "TelexistenceAPI",
            category: ".NET",
            image: "/TX.png",
            year: "2025",
            href: "https://github.com/DarlingtonDeveloper/TelexistenceAPI"
        },
        {
            id: 6,
            title: "Arise",
            category: "TypeScript",
            image: "/Arise.png",
            year: "2025",
            href: "https://github.com/DarlingtonDeveloper/Arise"
        },
        {
            id: 7,
            title: "Fraud Detection",
            category: "TypeScript",
            image: "/Fraud.png?height=400&width=600",
            year: "2025",
            href: "https://github.com/DarlingtonDeveloper/fraud-detection-system"
        },
        {
            id: 8,
            title: "Resume Optimization System",
            category: "Python",
            image: "/crewai.jpg?height=400&width=600",
            year: "2025",
            href: "https://github.com/DarlingtonDeveloper/resume-optimization-crew"
        },
        {
            id: 9,
            title: "Connect Four Reinforcement Learning",
            category: "Python",
            image: "/c4.jpg?height=400&width=600",
            year: "2024",
            href: "https://github.com/DarlingtonDeveloper/ConnectFourRL"
        },
        {
            id: 10,
            title: "Value-At-Risk Calculator",
            category: "Python",
            image: "/VAR.png?height=400&width=600",
            year: "2024",
            href: "https://github.com/DarlingtonDeveloper/VARCalculator"
        },
        {
            id: 11,
            title: "Technical Analysis Plotter",
            category: "Python",
            image: "/TA.png?height=400&width=600",
            year: "2024",
            href: "https://github.com/DarlingtonDeveloper/Technical_Analysis_Plotter"
        },
        {
            id: 12,
            title: "Twitter Sentiment Analysis",
            category: "Python",
            image: "/twitter.png?height=400&width=600",
            year: "2023",
            href: "https://github.com/DarlingtonDeveloper/Twitter-Keyword-Tracker"
        },
        {
            id: 13,
            title: "Discord Activity Bot",
            category: "Python",
            image: "/discord.jpg?height=400&width=600",
            year: "2023",
            href: "https://github.com/DarlingtonDeveloper/Discord-Activity-Bot"
        },
        {
            id: 14,
            title: "Page Load Time Chrome Extension",
            category: "TypeScript",
            image: "/ps.png?height=400&width=600",
            year: "2023",
            href: "https://github.com/DarlingtonDeveloper/PageLoadTimeExtension"
        }
    ];

    // Filter items based on selected category
    const filteredItems = portfolioItems.filter((item) =>
        selectedCategory === "all" ? true : item.category === selectedCategory
    );

    // Render a portfolio item
    const renderPortfolioItem = (item: PortfolioItem) => (
        <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full w-full"
        >
            <div className="relative h-full w-full rounded-[1.25rem] border-[0.75px] border-border p-2">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={4}
                />
                <Card className="overflow-hidden bg-zinc-900 relative rounded-xl border-[0.5px] shadow-sm h-full dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <CardContent className="p-0 h-full">
                        <div className="group relative h-full">
                            <div className="relative aspect-square w-full overflow-hidden">
                                <OptimizedImage
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    aspectRatio="aspect-square"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <p className="mt-2 text-sm text-gray-300">{item.year}</p>
                                <p className="mt-1 text-xs text-gray-400">{item.category}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </a>
    );

    return (
        <div className={className}>
            {title && (
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-12 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <span className="whitespace-nowrap mb-2 sm:mb-0">Explore</span>
                    <TextRotate
                        texts={[
                            "System Design",
                            "Backend Systems",
                            "Microservices",
                            "API Engineering",
                            "Automation Pipelines",
                            "Cloud Infrastructure"
                        ]}
                        mainClassName="text-white px-2 sm:px-2 md:px-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden py-0.5 sm:py-1 md:py-1.5 justify-center rounded-lg flex items-center font-medium"
                        staggerFrom="first"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden"
                        elementLevelClassName="inline-block"
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        rotationInterval={3000}
                    />
                    <span className="whitespace-nowrap mt-2 sm:mt-0">on GitHub.</span>
                </h1>
            )}

            {/* Category Filter Buttons */}
            <div className="mb-12 flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                    <RainbowButton
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`text-sm capitalize ${selectedCategory === category
                            ? 'opacity-100 font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105 border border-white/20'
                            : 'opacity-70 hover:opacity-90'
                            }`}
                    >
                        {category}
                    </RainbowButton>
                ))}
            </div>

            <div className="mb-4 text-center text-sm text-gray-400">
                <p>Drag in any direction to explore — the grid extends infinitely</p>
            </div>

            <InfiniteGrid<PortfolioItem>
                items={filteredItems}
                renderItem={renderPortfolioItem}
                columns={3}
                gap={40}
                className="h-[700px] md:h-[800px] lg:h-[900px] w-full rounded-xl bg-black/20 backdrop-blur-sm"
                itemClassName="cursor-pointer"
            />
        </div>
    );
}