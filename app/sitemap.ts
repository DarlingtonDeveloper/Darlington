import { MetadataRoute } from 'next';
import { portfolioProjects } from '@/data/projects';

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
        // {
        //   url: `${baseUrl}/about`,
        //   lastModified: new Date(),
        //   changeFrequency: 'monthly',
        //   priority: 0.8,
        // },
        // {
        //   url: `${baseUrl}/blog`,
        //   lastModified: new Date(),
        //   changeFrequency: 'weekly',
        //   priority: 0.8,
        // },
    ] as MetadataRoute.Sitemap;

    // Dynamic project routes (if you have individual project pages)
    // const projectRoutes = portfolioProjects.map((project) => ({
    //   url: `${baseUrl}/projects/${project.id}`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly' as const,
    //   priority: 0.7,
    // }));

    // return [...routes, ...projectRoutes];

    // For now, just return the main routes
    return routes;
}