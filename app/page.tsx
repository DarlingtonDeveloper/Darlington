import { Suspense } from "react";
import { Metadata } from "next";
import { SplineSceneBasic } from "@/components/SplineSceneBasic";
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

      <div className="bg-black text-white flex flex-col min-h-screen">
        <Header />

        {/* Main content adjusted to fill available space without extra gap */}
        <main className="flex-1 flex flex-col">
          {/* Hero Section with semantic structure filling the available space */}
          <section id="connect" aria-label="Welcome Section" className="flex-1">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
              </div>
            }>
              <SplineSceneBasic />
            </Suspense>
          </section>
        </main>
      </div>
    </>
  );
}