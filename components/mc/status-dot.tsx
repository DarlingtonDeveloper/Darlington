import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  in_progress: "bg-[#c4b5a0]",
  busy: "bg-[#c4b5a0]",
  complete: "bg-[#4ade80]",
  idle: "bg-[#4ade80]",
  blocked: "bg-[#f87171]",
  error: "bg-[#f87171]",
  pending: "bg-[#6b6560]",
  offline: "bg-[#6b6560]",
};

export function StatusDot({
  status,
  size = 8,
  pulse = false,
}: {
  status: string;
  size?: number;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full shrink-0",
        statusColors[status] ?? "bg-[#6b6560]",
        pulse && "animate-[status-pulse_2s_ease-in-out_infinite]",
      )}
      style={{ width: size, height: size }}
    />
  );
}
