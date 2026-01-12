import { startOfWeek } from 'date-fns'
import { WeeklySummary } from './components/WeeklySummary'
import { getWeeklySummary } from './lib/queries'

// Force dynamic rendering - don't try to build this at build time
export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 })
  const initialData = await getWeeklySummary(thisWeek)

  return <WeeklySummary initialData={initialData} />
}
