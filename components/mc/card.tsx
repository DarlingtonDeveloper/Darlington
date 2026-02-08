import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white/[0.02] border border-white/[0.06] rounded-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
