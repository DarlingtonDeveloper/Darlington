import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/lib/metadata-config";
import { PersonSchema, WebsiteSchema } from "@/components/json-ld";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNavBar } from "@/components/MobileNavBar";

// Optimize font loading with display swap
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Export the default metadata for better SEO
export const metadata = defaultMetadata;

// Define viewport settings
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Portfolio owner information for schema.org data
const portfolioOwner = {
  name: "Darlington",
  jobTitle: "Developer & System Architect",
  image: "https://github.com/DarlingtonDeveloper.png",
  url: "https://darlington.dev",
  sameAs: [
    "https://github.com/DarlingtonDeveloper",
    "https://x.com/DarlingtonDev",
    "https://www.linkedin.com/in/DarlingtonDev/",
    "https://instagram.com/Darlington.dev",
    "https://frtr.hashnode.dev/"
  ],
  description: "Full-stack developer and system architect specializing in TypeScript, Python, Go and cloud infrastructure.",
};

// Mobile navbar will be handled by a client component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Canonical URL - important for SEO */}
        <link rel="canonical" href="https://darlington.dev" />

        {/* Preconnect to domains for faster resource loading */}
        <link rel="preconnect" href="https://github.com" />
        <link rel="preconnect" href="https://x.com" />
        <link rel="preconnect" href="https://linkedin.com" />
        <link rel="preconnect" href="https://prod.spline.design" />

        {/* DNS prefetch for third-party domains */}
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://x.com" />
        <link rel="dns-prefetch" href="https://linkedin.com" />
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        <link rel="dns-prefetch" href="https://instagram.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ isolation: "isolate" }}
        suppressHydrationWarning
      >
        {/* JSON-LD structured data for better SEO */}
        <PersonSchema person={portfolioOwner} />
        <WebsiteSchema
          name="Darlington - Developer Portfolio"
          url="https://darlington.dev"
          description="Portfolio website of Darlington, a developer and system architect specializing in modern web technologies."
        />
        <Analytics />
        <SpeedInsights />

        {/* 
          Responsive Layout Structure:
          - Desktop: Logo+Navbar -> Content -> Footer
          - Mobile: Logo -> Content -> Navbar -> Footer
        */}
        <div className="bg-black text-white flex flex-col h-screen overflow-hidden">
          {/* Header - fixed height */}
          <div className="flex-none h-[100px]">
            <Header />
          </div>

          {/* Main content - calculated height to fit remaining space */}
          <div className="flex-1 h-[calc(100vh-230px)] md:h-[calc(100vh-230px)] overflow-hidden">
            {children}
          </div>

          {/* Mobile Navbar - only visible on mobile */}
          <div className="md:hidden flex-none">
            <MobileNavBar />
          </div>

          {/* Footer - fixed height */}
          <div className="flex-none h-[130px]">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}