import { FinanceNav } from './components/finance-nav'

export default function FinanceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto">
            <div className="sticky top-0 bg-neutral-950/95 backdrop-blur-sm z-30 pt-safe border-b border-neutral-800/60">
                <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto">
                    <FinanceNav />
                </div>
            </div>
            <div className="sm:max-w-2xl sm:mx-auto">
                {children}
            </div>
        </div>
    )
}
