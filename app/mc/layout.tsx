import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MissionControl | Darlington',
  description: 'OpenClaw orchestrator dashboard',
}

export default function McLayout({ children }: { children: React.ReactNode }) {
  return <div className="dark bg-background text-foreground">{children}</div>
}
