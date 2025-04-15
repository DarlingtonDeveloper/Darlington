import Image from 'next/image';

interface GalleryImageProps {
    src: string;
    alt: string;
    title: string;
    href: string;
    priority?: boolean;
}

export function GalleryImage({ src, alt, title, href, priority = false }: GalleryImageProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full group"
        >
            <div className="aspect-[2/3] relative overflow-hidden">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority={priority}
                />
            </div>
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>
        </a>
    );
}