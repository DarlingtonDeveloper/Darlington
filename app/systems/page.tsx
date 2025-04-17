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

            <div className="w-full h-full flex items-center justify-center px-6 md:px-12 lg:px-20">
                <PortfolioGrid className="w-full h-full" />
            </div>
        </>
    );
}