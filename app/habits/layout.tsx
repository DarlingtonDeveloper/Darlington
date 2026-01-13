import { HabitsNav } from '@/components/habits/habits-nav'

export default function HabitsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto habits-scrollbar">
            <div className="sticky top-0 bg-neutral-950 z-30 pt-safe">
                <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto">
                    <HabitsNav />
                </div>
            </div>
            {children}
        </div>
    )
}
