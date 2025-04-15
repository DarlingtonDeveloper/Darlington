import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface PortfolioItemProps {
    title: string;
    image: string;
    year: string;
    href: string;
}

export function PortfolioItem({ title, image, year, href }: PortfolioItemProps) {
    return (
        <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2">
            <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={4}
            />
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer"
            >
                <Card className="overflow-hidden bg-zinc-900 relative rounded-xl border-[0.5px] shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <CardContent className="p-0">
                        <div className="group relative">
                            <div className="relative aspect-video w-full overflow-hidden">
                                <Image
                                    src={image}
                                    alt={title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <h3 className="text-xl font-semibold text-white">{title}</h3>
                                <p className="mt-2 text-sm text-gray-300">{year}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </a>
        </div>
    )
}