import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swarm | Darlington",
  description: "Fleet monitoring dashboard",
};

export default function McLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark bg-background text-foreground h-full">{children}</div>
  );
}
