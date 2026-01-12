export default function FinanceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto">
            <div className="sticky top-0 bg-neutral-950/95 backdrop-blur-sm z-10 pt-safe border-b border-neutral-800/60">
                <div className="px-4 py-3 sm:px-6 sm:max-w-2xl sm:mx-auto">
                    <h1 className="text-[13px] font-medium text-neutral-300 tracking-tight">Finance</h1>
                </div>
            </div>
            <div className="sm:max-w-2xl sm:mx-auto">
                {children}
            </div>
        </div>
    )
}
