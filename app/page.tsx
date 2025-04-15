import { Suspense } from "react";
import { Metadata } from "next";
import { SplineSceneBasic } from "@/components/SplineSceneBasic";
import { SparklesSection } from "@/components/SparklesSection";
import { MarqueeDemo } from "@/components/marquee-demo";
import { Gallery } from "@/components/gallery";
import { Portfolio } from "@/components/portfolio";
import { Header } from "@/components/header";
import { BreadcrumbSchema } from "@/components/json-ld";

// Page-specific metadata
export const metadata: Metadata = {
  title: "Home", // Will use the title template from layout: "Home | Darlington - Developer & System Architect"
  description: "Portfolio of Darlington, a full-stack developer and system architect specializing in TypeScript, Python, Go and cloud infrastructure.",
  alternates: {
    canonical: "/",
  },
  // Simplified OpenGraph without image requirement
  openGraph: {
    title: "Darlington | Developer & System Architect",
    description: "Explore my projects and skills in web development, system architecture, and cloud infrastructure.",
    url: "https://darlington.dev",
  },
};

// Breadcrumb data
const breadcrumbs = [
  { name: "Home", url: "https://darlington.dev" },
];

export default function Home() {
  return (
    <>
      {/* Structured data for breadcrumbs */}
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="bg-black text-white">
        <Header />

        <main className="flex flex-col w-full">
          {/* Hero Section with semantic structure */}
          <section id="connect" aria-label="Welcome Section" className="w-full h-screen">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
              </div>
            }>
              <SplineSceneBasic />
            </Suspense>
            <SparklesSection />
          </section>

          {/* Content Sections with semantic HTML */}
          <div className="relative z-30 bg-black">
            <div className="px-6 md:px-12 lg:px-20 pt-24">
              {/* Gallery section */}
              <section id="projects" aria-label="Interactive Frontend Projects" className="pt-16 -mt-16 mb-12">
                <Gallery />
              </section>

              {/* Technologies section */}
              <section aria-label="Technologies" className="w-full mb-16">
                <h2 className="text-2xl font-bold text-center mb-4">Powered By</h2>
                <MarqueeDemo />
              </section>
            </div>

            {/* Portfolio Section */}
            <section id="systems" aria-label="System Architecture Projects" className="pt-16 -mt-16 w-full pb-20">
              <Portfolio />
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