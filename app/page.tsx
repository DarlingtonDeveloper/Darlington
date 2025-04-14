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

      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
          <SplineSceneBasic />
          <Gallery />
          <SparklesSection />
          <div className="w-full">
            <h2 className="text-2xl font-bold text-center mb-4">Powered By</h2>
            <MarqueeDemo />
          </div>
          <Portfolio />
        </main>
      </div>

      <Footerdemo />
    </div>
  );
}