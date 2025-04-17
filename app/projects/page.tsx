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

            <div className="w-full h-full flex flex-col">
                <div className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 flex flex-col">
                    {/* Gallery section - 80-85% of available space */}
                    <section
                        id="interactive-projects"
                        aria-label="Interactive Frontend Projects"
                        className="flex-1 flex flex-col justify-center"
                    >
                        <Gallery />
                    </section>

                    {/* Technologies section - fixed height at bottom */}
                    <section
                        aria-label="Technologies"
                        className="h-[80px] flex flex-col justify-center"
                    >
                        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">Powered By</h2>
                        <MarqueeDemo />
                    </section>
                </div>
            </div>
        </>
    );
}