import { Suspense } from "react";
import { Metadata } from "next";
import { CompassShell } from "@/components/compass/compass-shell";
import { BreadcrumbSchema } from "@/components/json-ld";

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

const breadcrumbs = [
  { name: "Home", url: "https://darlington.dev" },
];

export default function Home() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <Suspense fallback={
        <div className="fixed inset-0 bg-[var(--bg)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CompassShell />
      </Suspense>
    </>
  );
}
