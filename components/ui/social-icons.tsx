'use client'
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialIcon {
    Icon: LucideIcon
    href?: string
    className?: string
}

interface SocialIconsProps {
    icons: SocialIcon[]
    className?: string
    iconSize?: number
}

export function SocialIcons({
    icons,
    className,
    iconSize = 32
}: SocialIconsProps) {
    const buttonSize = "size-16 sm:size-20"

    return (
        <div className={cn("flex items-center justify-center gap-6", className)}>
            {icons.map(({ Icon, href, className }, index) => (
                <div
                    key={index}
                    className={cn(
                        buttonSize,
                        "rounded-full flex items-center justify-center",
                        "bg-background/10 backdrop-blur-sm hover:bg-background/20",
                        "border border-white/10 hover:border-white/20 hover:border-2",
                        "transition-all duration-300 ease-in-out",
                        className
                    )}
                >
                    {href ? (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                        >
                            <Icon
                                size={iconSize}
                                className="text-white/70 transition-all hover:text-white hover:scale-110"
                            />
                        </a>
                    ) : (
                        <Icon
                            size={iconSize}
                            className="text-white/70 transition-all hover:text-white hover:scale-110"
                        />
                    )}
                </div>
            ))}
        </div>
    )
}