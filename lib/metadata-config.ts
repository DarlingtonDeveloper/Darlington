import { Metadata } from "next";

// Base URL for absolute URLs in metadata
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://darlington.dev";

// Default metadata for the site - shared across all pages
export const defaultMetadata: Metadata = {
    // Basic metadata
    title: {
        template: "%s | Darlington - Developer & System Architect",
        default: "Darlington | Developer & System Architect",
    },
    description: "Full-stack developer and system architect specializing in TypeScript, Python, Go and cloud infrastructure.",
    applicationName: "Darlington Portfolio",
    authors: [{ name: "Darlington", url: "https://github.com/DarlingtonDeveloper" }],
    generator: "Next.js",
    keywords: [
        "developer", "software engineer", "typescript", "python", "go",
        "web development", "system architecture", "backend", "fullstack"
    ],

    // Canonical URL
    metadataBase: new URL(baseUrl),

    // Open Graph - without image requirement
    openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        siteName: "Darlington - Developer Portfolio",
        title: "Darlington | Developer & System Architect",
        description: "Full-stack developer and system architect specializing in TypeScript, Python, Go and cloud infrastructure.",
    },

    // Twitter - without image requirement
    twitter: {
        card: "summary",
        creator: "@DarlingtonDev",
        site: "@DarlingtonDev",
        title: "Darlington | Developer & System Architect",
        description: "Full-stack developer and system architect specializing in TypeScript, Python, Go and cloud infrastructure.",
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    // Category
    category: "technology",
};