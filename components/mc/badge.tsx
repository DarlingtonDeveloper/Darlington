import { cn } from "@/lib/utils";

const variants = {
  default: "bg-white/5 text-[#6b6560] border border-white/10",
  accent: "bg-[#c4b5a0]/10 text-[#c4b5a0] border border-[#c4b5a0]/20",
  success: "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
  danger: "bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20",
  warning: "bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20",
} as const;

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-mono uppercase tracking-wider rounded-full px-2 py-0.5",
        variants[variant],
      )}
    >
      {children}
    </span>
  );
}
