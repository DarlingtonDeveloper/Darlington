import { Suspense } from "react";
import { Metadata } from "next";
import { SplineSceneBasic } from "@/components/SplineSceneBasic";
import { SparklesSection } from "@/components/SparklesSection";
import { Header } from "@/components/header";
import { BreadcrumbSchema } from "@/components/json-ld";

// Page-specific metadata
export const metadata: Metadata = {
  title: "Home",
  description: "Portfolio of Darlington, a full-stack developer and system architect specializing in TypeScript, Python, Go and cloud infrastructure.",
  alternates: {
    canonical: "/",
  },
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