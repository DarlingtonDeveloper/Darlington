import { supabase } from '@/lib/supabase'
import { format, startOfWeek, endOfWeek, subWeeks, addDays } from 'date-fns'
import type { WeeklySummary, CategoryTotal, MerchantTotal, DailyTotal, CategorizedTransaction } from '../types'
import { CATEGORY_ICONS } from '../types'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

export async function getWeeklySummary(weekStart: Date): Promise<WeeklySummary> {
  // Ensure we're working with the start of the week (Monday)
  const startDate = startOfWeek(weekStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(weekStart, { weekStartsOn: 1 })

  const startStr = format(startDate, 'yyyy-MM-dd')
  const endStr = format(endDate, 'yyyy-MM-dd')

  // Previous week for comparison
  const prevWeekStart = subWeeks(startDate, 1)
  const prevWeekEnd = subWeeks(endDate, 1)
  const prevStartStr = format(prevWeekStart, 'yyyy-MM-dd')
  const prevEndStr = format(prevWeekEnd, 'yyyy-MM-dd')

  // Fetch all data in parallel
  const [
    weeklyResult,
    prevWeeklyResult,
    categoryResult,
    merchantResult,
    dailyResult,
  ] = await Promise.all([
    // Current week total
    supabase
      .from('finance_transactions')
      .select('amount')
      .eq('user_id', USER_ID)
      .lt('amount', 0)
      .eq('is_transfer', false)
      .gte('transaction_date', startStr)
      .lte('transaction_date', endStr),

    // Previous week total
    supabase
      .from('finance_transactions')
      .select('amount')
      .eq('user_id', USER_ID)
      .lt('amount', 0)
      .eq('is_transfer', false)
      .gte('transaction_date', prevStartStr)
      .lte('transaction_date', prevEndStr),

    // Category breakdown
    supabase
      .from('finance_transactions')
      .select('category, amount')
      .eq('user_id', USER_ID)
      .lt('amount', 0)
      .eq('is_transfer', false)
      .gte('transaction_date', startStr)
      .lte('transaction_date', endStr),

    // Top merchants
    supabase
      .from('finance_transactions')
      .select('merchant_name, amount')
      .eq('user_id', USER_ID)
      .lt('amount', 0)
      .eq('is_transfer', false)
      .gte('transaction_date', startStr)
      .lte('transaction_date', endStr),

    // Daily totals
    supabase
      .from('finance_transactions')
      .select('transaction_date, amount')
      .eq('user_id', USER_ID)
      .lt('amount', 0)
      .eq('is_transfer', false)
      .gte('transaction_date', startStr)
      .lte('transaction_date', endStr),
  ])

  // Calculate current week total
  const weeklyData = weeklyResult.data || []
  const totalSpent = weeklyData.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const transactionCount = weeklyData.length

  // Calculate previous week total
  const prevWeeklyData = prevWeeklyResult.data || []
  const previousWeekSpent = prevWeeklyData.reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Calculate percent change
  const percentChange = previousWeekSpent > 0
    ? ((totalSpent - previousWeekSpent) / previousWeekSpent) * 100
    : 0

  // Aggregate category breakdown
  const categoryData = categoryResult.data || []
  const categoryMap = new Map<string, { total: number; count: number }>()
  for (const t of categoryData) {
    const cat = t.category || 'other'
    const existing = categoryMap.get(cat) || { total: 0, count: 0 }
    categoryMap.set(cat, {
      total: existing.total + Math.abs(t.amount),
      count: existing.count + 1,
    })
  }

  const categoryBreakdown: CategoryTotal[] = Array.from(categoryMap.entries())
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      icon: CATEGORY_ICONS[category] || '❓',
    }))
    .sort((a, b) => b.total - a.total)

  // Aggregate top merchants
  const merchantData = merchantResult.data || []
  const merchantMap = new Map<string, { total: number; count: number }>()
  for (const t of merchantData) {
    const merchant = t.merchant_name || 'Other'
    const existing = merchantMap.get(merchant) || { total: 0, count: 0 }
    merchantMap.set(merchant, {
      total: existing.total + Math.abs(t.amount),
      count: existing.count + 1,
    })
  }

  const topMerchants: MerchantTotal[] = Array.from(merchantMap.entries())
    .map(([merchant, { total, count }]) => ({ merchant, total, count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Aggregate daily totals
  const dailyData = dailyResult.data || []
  const dailyMap = new Map<string, number>()
  for (const t of dailyData) {
    const date = t.transaction_date
    dailyMap.set(date, (dailyMap.get(date) || 0) + Math.abs(t.amount))
  }

  // Generate all days of the week with totals
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dailyTotals: DailyTotal[] = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    dailyTotals.push({
      date: dateStr,
      dayOfWeek: dayNames[i],
      total: dailyMap.get(dateStr) || 0,
    })
  }

  return {
    weekStart: startDate,
    weekEnd: endDate,
    totalSpent,
    previousWeekSpent,
    percentChange,
    categoryBreakdown,
    topMerchants,
    dailyTotals,
    transactionCount,
  }
}

export async function checkDuplicates(
  hashes: string[]
): Promise<Set<string>> {
  const { data } = await supabase
    .from('finance_transactions')
    .select('import_hash')
    .eq('user_id', USER_ID)
    .in('import_hash', hashes)

  return new Set((data || []).map(d => d.import_hash))
}

export async function insertTransactions(
  transactions: CategorizedTransaction[],
  accountId: string
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = []
  let inserted = 0

  // Insert in batches of 100
  const batchSize = 100
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize)

    const { error } = await supabase
      .from('finance_transactions')
      .insert(
        batch.map(t => ({
          user_id: USER_ID,
          account_id: accountId,
          transaction_date: t.transaction_date,
          timestamp: t.timestamp,
          description: t.description,
          amount: t.amount,
          balance: t.balance,
          category: t.category,
          subcategory: t.subcategory,
          merchant_name: t.merchant_name,
          source: t.source,
          import_hash: t.import_hash,
          raw_data: t.raw_data,
          is_transfer: t.is_transfer,
          is_recurring: t.is_recurring,
        }))
      )

    if (error) {
      errors.push(`Batch ${i / batchSize + 1}: ${error.message}`)
    } else {
      inserted += batch.length
    }
  }

  return { inserted, errors }
}

export async function updateTransactionCategory(
  importHash: string,
  category: string,
  merchantName?: string
): Promise<void> {
  await supabase
    .from('finance_transactions')
    .update({ category, merchant_name: merchantName })
    .eq('import_hash', importHash)
    .eq('user_id', USER_ID)
}

export async function getAccounts(): Promise<{ id: string; name: string; type: string }[]> {
  const { data } = await supabase
    .from('finance_accounts')
    .select('id, name, type')
    .eq('user_id', USER_ID)
    .order('name')

  return data || []
}
