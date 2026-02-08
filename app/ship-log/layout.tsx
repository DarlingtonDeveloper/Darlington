import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShipLogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto">
      <div className="sticky top-0 bg-neutral-950 z-30 pt-safe">
        <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto">
          <nav className="flex items-center border-b border-neutral-800">
            <Link
              href="/"
              className="flex items-center gap-2 px-1 py-3 text-sm font-medium text-neutral-400 active:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ship Log
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
