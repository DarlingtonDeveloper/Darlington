"use client";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[#c4b5a0]/10 text-[#c4b5a0] border border-[#c4b5a0]/20 hover:bg-[#c4b5a0]/20",
  success:
    "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 hover:bg-[#4ade80]/20",
  danger:
    "bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 hover:bg-[#f87171]/20",
  ghost:
    "bg-transparent text-[#6b6560] border border-white/10 hover:bg-white/5",
} as const;

const sizes = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-3 py-1.5",
} as const;

export function ActionButton({
  children,
  variant = "primary",
  size = "sm",
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "font-mono rounded-md transition-colors cursor-pointer",
        variants[variant],
        sizes[size],
        disabled && "opacity-40 pointer-events-none",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
