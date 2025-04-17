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
                        {/* Portfolio Section */}
                        <section aria-label="System Architecture Projects" className="pt-8 w-full pb-20">
                            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                                <PortfolioGrid className="w-full" />
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}