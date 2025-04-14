import { SplineSceneBasic } from "@/components/SplineSceneBasic";
import { SparklesSection } from "@/components/SparklesSection";
import { MarqueeDemo } from "@/components/marquee-demo";
import { Gallery } from "@/components/gallery";
import { Portfolio } from "@/components/portfolio";
import { Header } from "@/components/header";
import { Footerdemo } from "@/components/footer-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="flex flex-col w-full">
        {/* Hero Section - Full width with no space */}
        <div className="w-full">
          <SplineSceneBasic />
          <SparklesSection />
        </div>

        {/* Content Sections */}
        <div className="px-6 md:px-12 lg:px-20 space-y-16 mt-16">
          <Gallery />
          <div className="w-full">
            <h2 className="text-2xl font-bold text-center mb-8">Powered By</h2>
            <MarqueeDemo />
          </div>
        </div>

        {/* Portfolio Section - Full width */}
        <div className="mt-16 w-full">
          <Portfolio />
        </div>
      </main>

      <Footerdemo />
    </div>
  );
}