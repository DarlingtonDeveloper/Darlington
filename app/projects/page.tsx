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

            <div className="bg-black text-white">
                <main>
                    <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-10">
                        {/* Gallery section */}
                        <section id="interactive-projects" aria-label="Interactive Frontend Projects" className="mb-12">
                            <Gallery />
                        </section>

                        {/* Technologies section - with a large bottom margin to avoid footer overlap */}
                        <section aria-label="Technologies" className="mb-48">
                            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Powered By</h2>
                            <MarqueeDemo />
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}