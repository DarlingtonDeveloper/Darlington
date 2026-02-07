import type { Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/lib/metadata-config";
import { PersonSchema, WebsiteSchema } from "@/components/json-ld";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AuthProvider } from "@/contexts/auth-context";
import { CompassProvider } from "@/contexts/compass-context";
import { createClient } from "@/lib/supabase/server";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// Export the default metadata for better SEO
export const metadata = defaultMetadata;

// Define viewport settings
export const viewport: Viewport = {
  themeColor: "#07070e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover", // Enable safe area insets for iPhone notch/home indicator
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

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
        className={`${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
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

        <AuthProvider initialSession={session}>
          <CompassProvider>
            <div className="bg-[var(--bg)] text-[var(--fg)] h-screen overflow-hidden">
              {children}
            </div>
          </CompassProvider>
        </AuthProvider>
      </body>
    </html>
  );
}