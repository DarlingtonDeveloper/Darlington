import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks | Darlington",
  description: "Swipe to pick your next task",
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark bg-[#07070e] text-[#e8e4df] h-full">{children}</div>
  );
}
