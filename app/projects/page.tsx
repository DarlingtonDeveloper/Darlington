import { Suspense } from "react";
import { Metadata } from "next";
import { MarqueeDemo } from "@/components/marquee-demo";
import { Gallery } from "@/components/gallery";
import { BreadcrumbSchema } from "@/components/json-ld";

// Page-specific metadata
export const metadata: Metadata = {
    title: "Projects",
    description: "Explore interactive projects, web interfaces, and modern applications built with cutting-edge technology.",
    alternates: {
        canonical: "/projects",
    },
    openGraph: {
        title: "Projects | Darlington",
        description: "Explore interactive projects, web interfaces, and modern applications built with cutting-edge technology.",
        url: "https://darlington.dev/projects",
    },
};

// Breadcrumb data
const breadcrumbs = [
    { name: "Home", url: "https://darlington.dev" },
    { name: "Projects", url: "https://darlington.dev/projects" },
];

export default function ProjectsPage() {
    return (
        <>
            {/* Structured data for breadcrumbs */}
            <BreadcrumbSchema items={breadcrumbs} />

            <div className="bg-black text-white min-h-screen">
                <main className="flex flex-col w-full">
                    <div className="relative z-30 bg-black min-h-screen flex flex-col">
                        <div className="px-4 sm:px-6 md:px-12 lg:px-20 flex flex-col min-h-screen">

                            {/* Gallery section - 80-85% of viewport */}
                            <section
                                id="interactive-projects"
                                aria-label="Interactive Frontend Projects"
                                className="h-[80vh] flex flex-col justify-center"
                            >
                                <Gallery />
                            </section>

                            {/* Technologies section - 15-20% of viewport */}
                            <section
                                aria-label="Technologies"
                                className="h-[20vh] flex flex-col justify-end pb-8 md:pb-16"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 md:mb-4">Powered By</h2>
                                <MarqueeDemo />
                            </section>
                        </div>
                    </div>
                </main>

                {/* Add a minimal semantic footer */}
                <footer className="bg-zinc-950 py-8 text-center text-gray-400 text-sm">
                    <div className="container mx-auto px-6">
                        <p>© {new Date().getFullYear()} Darlington.Dev. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}