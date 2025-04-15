'use client'

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Types for component props
interface SocialIcon {
    Icon: LucideIcon | React.FC<{ size?: number; className?: string }>;
    href?: string;
    label?: string;
    className?: string;
}

interface SocialIconsProps {
    icons: SocialIcon[];
    className?: string;
    iconSize?: number;
    buttonClassName?: string;
    iconClassName?: string;
}

export function SocialIcons({
    icons,
    className,
    iconSize = 32,
    buttonClassName,
    iconClassName
}: SocialIconsProps) {
    // Default styles with the ability to override
    const defaultButtonClassName = cn(
        "size-16 sm:size-20",
        "rounded-full flex items-center justify-center",
        "bg-background/10 backdrop-blur-sm hover:bg-background/20",
        "border border-white/10 hover:border-white/20 hover:border-2",
        "transition-all duration-300 ease-in-out",
        buttonClassName
    );

    const defaultIconClassName = cn(
        "text-white/70 transition-all hover:text-white hover:scale-110",
        iconClassName
    );

    return (
        <div className={cn("flex items-center justify-center gap-6", className)}>
            {icons.map(({ Icon, href, className, label }, index) => (
                <div
                    key={index}
                    className={cn(defaultButtonClassName, className)}
                    title={label}
                >
                    {href ? (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                            aria-label={label || `Social Link ${index + 1}`}
                        >
                            <Icon
                                size={iconSize}
                                className={defaultIconClassName}
                            />
                        </a>
                    ) : (
                        <Icon
                            size={iconSize}
                            className={defaultIconClassName}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}