import { MetadataRoute } from 'next';
// Remove the unused import
// import { portfolioProjects } from '@/data/projects';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://darlington.dev';

    // Main pages
    const routes = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        // Add other static pages here
    ] as MetadataRoute.Sitemap;

    // For now, just return the main routes
    return routes;
}