import { SplineSceneBasic } from "@/components/SplineSceneBasic";
import { SparklesSection } from "@/components/SparklesSection";
import { MarqueeDemo } from "@/components/marquee-demo";
import { Gallery } from "@/components/gallery";
import { Portfolio } from "@/components/portfolio";
import { Header } from "@/components/header";
import { Footerdemo } from "@/components/footer-section";

export default function Home() {
  return (
    <div className="bg-black text-white">
      <Header />

      <main className="flex flex-col w-full">
        {/* Hero Section - Fixed position with 100vh height */}
        <div id="connect" className="w-full h-screen">
          <SplineSceneBasic />
          <SparklesSection />
        </div>

        {/* Content Sections - Position below the hero which stays fixed */}
        <div className="relative z-30 bg-black">
          {/* Add padding-top to create space for the fixed navbar */}
          <div className="px-6 md:px-12 lg:px-20 pt-24">
            {/* Projects section with id for navigation and additional padding */}
            <div id="projects" className="pt-16 -mt-16 mb-8">
              <Gallery />
            </div>
            <div className="w-full mb-8">
              <h2 className="text-2xl font-bold text-center mb-0">Powered By</h2>
              <MarqueeDemo />
            </div>
          </div>

          {/* Portfolio Section - Full width with additional padding for navbar */}
          <div id="systems" className="mt-16 pt-16 -mt-16 w-full">
            <Portfolio />
          </div>

          <Footerdemo />
        </div>
      </main>
    </div>
  );
}