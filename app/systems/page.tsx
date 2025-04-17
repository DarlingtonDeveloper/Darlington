import { Metadata } from "next";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { BreadcrumbSchema } from "@/components/json-ld";

// Page-specific metadata
export const metadata: Metadata = {
    title: "Systems Architecture",
    description: "Explore system design projects, backend architecture, and infrastructure solutions by Darlington.",
    alternates: {
        canonical: "/systems",
    },
    openGraph: {
        title: "Systems Architecture | Darlington",
        description: "Explore system design projects, backend architecture, and infrastructure solutions by Darlington.",
        url: "https://darlington.dev/systems",
    },
};

// Breadcrumb data
const breadcrumbs = [
    { name: "Home", url: "https://darlington.dev" },
    { name: "Systems", url: "https://darlington.dev/systems" },
];

export default function SystemsPage() {
    return (
        <>
            {/* Structured data for breadcrumbs */}
            <BreadcrumbSchema items={breadcrumbs} />

            <div className="bg-black text-white min-h-screen">
                <main className="flex flex-col w-full">
                    <div className="relative z-30 bg-black min-h-screen flex flex-col">
                        {/* Hero heading */}
                        <div className="pt-32 pb-12">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center">
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                                    System Architecture
                                </span>
                            </h1>
                            <p className="text-center text-neutral-400 mt-4 max-w-2xl mx-auto">
                                A showcase of backend systems, infrastructure projects, and architectural designs across various technologies.
                            </p>
                        </div>

                        {/* Portfolio Section */}
                        <section aria-label="System Architecture Projects" className="pt-8 w-full pb-20">
                            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                                <PortfolioGrid className="w-full" />
                            </div>
                        </section>
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