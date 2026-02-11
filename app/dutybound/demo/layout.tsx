import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "DutyBound Demo | Darlington",
  description: "See DutyBound in action — guided demo walkthrough",
};

function DemoNav() {
  return (
    <nav className="flex items-center justify-between py-3">
      <Link
        href="/"
        aria-label="Back to home"
        className="p-1 transition-opacity hover:opacity-70"
        style={{ color: "var(--fg2, #6b6560)" }}
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <span
        className="font-display text-sm tracking-wide"
        style={{ color: "var(--fg, #e8e4df)" }}
      >
        DutyBound Demo
      </span>
      <div className="w-7" />
    </nav>
  );
}

export default function DemoLayout({
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
          <DemoNav />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
