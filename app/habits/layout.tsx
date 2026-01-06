export default function HabitsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto habits-scrollbar">
            {children}
        </div>
    )
}
