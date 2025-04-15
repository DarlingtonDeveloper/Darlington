export interface PortfolioItem {
    id: number;
    title: string;
    category: string;
    image: string;
    year: string;
    href: string;
    priority?: boolean;
    src?: string;
    alt?: string;
}

export interface CarouselItem {
    src: string;
    alt: string;
    title: string;
    href: string;
    priority?: boolean;
}