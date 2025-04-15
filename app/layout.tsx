import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Optimize font loading with display swap
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Keep text visible during font loading
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Darlington | Developer",
  description: "Portfolio for Darlington - Developer and System Architect",
  keywords: ["developer", "portfolio", "architect", "typescript", "nextjs", "react"],
  authors: [
    {
      name: "Darlington",
      url: "https://github.com/DarlingtonDeveloper",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href={geistSans.url}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

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
        {children}
      </body>
    </html>
  );
}