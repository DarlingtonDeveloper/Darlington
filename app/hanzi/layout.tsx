import { HanziNav } from './components/hanzi-nav'

export default function HanziLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto hanzi-scrollbar">
      <div className="sticky top-0 bg-neutral-950 z-10 pt-safe">
        <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto">
          <HanziNav />
        </div>
      </div>
      {children}
    </div>
  )
}
