import Script from "next/script";

export interface PersonData {
    name: string;
    jobTitle: string;
    image: string;
    url: string;
    sameAs: string[];
    description: string;
    email?: string;
    telephone?: string;
    address?: {
        addressLocality: string;
        addressRegion: string;
        addressCountry: string;
    };
}

export interface ProjectData {
    name: string;
    description: string;
    url: string;
    image: string;
    datePublished: string;
    author: {
        name: string;
        url: string;
    };
    technologies: string[];
    category: string;
}

/**
 * JSON-LD structured data for Person schema
 */
export function PersonSchema({ person }: { person: PersonData }) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: person.name,
        jobTitle: person.jobTitle,
        image: person.image,
        url: person.url,
        sameAs: person.sameAs,
        description: person.description,
        ...(person.email && { email: person.email }),
        ...(person.telephone && { telephone: person.telephone }),
        ...(person.address && {
            address: {
                "@type": "PostalAddress",
                ...person.address
            }
        }),
    };

    return (
        <Script
            id="person-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

/**
 * JSON-LD structured data for multiple software projects (SoftwareSourceCode schema)
 */
export function ProjectsSchema({ projects }: { projects: ProjectData[] }) {
    const structuredDataList = projects.map((project) => ({
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: project.name,
        description: project.description,
        url: project.url,
        image: project.image,
        datePublished: project.datePublished,
        author: {
            "@type": "Person",
            name: project.author.name,
            url: project.author.url,
        },
        programmingLanguage: project.technologies,
        applicationCategory: project.category,
        codeRepository: project.url,
    }));

    return (
        <Script
            id="projects-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataList) }}
        />
    );
}

/**
 * JSON-LD structured data for WebSite schema
 */
export function WebsiteSchema({
    name,
    url,
    description
}: {
    name: string;
    url: string;
    description: string
}) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        description,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${url}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

/**
 * JSON-LD structured data for BreadcrumbList schema
 */
export function BreadcrumbSchema({
    items
}: {
    items: { name: string; url: string }[]
}) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };

    return (
        <Script
            id="breadcrumb-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}