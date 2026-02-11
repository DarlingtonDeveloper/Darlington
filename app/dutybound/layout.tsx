import type { Metadata } from "next";
import { KaiNav } from "@/components/kai/kai-nav";

export const metadata: Metadata = {
  title: "DutyBound | Darlington",
  description: "Provenance-driven agentic project orchestration",
};

export default function DutyBoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--bg, #07070e)" }}
    >
      <div
        className="sticky top-0 z-30 pt-safe"
        style={{ background: "var(--bg, #07070e)" }}
      >
        <div
          className="px-4 sm:px-6 max-w-2xl mx-auto"
          style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}
        >
          <KaiNav />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
