export interface Transaction {
  id: string
  user_id: string
  account_id: string
  transaction_date: string
  timestamp: string
  description: string
  amount: number
  balance: number | null
  category: string
  subcategory: string | null
  merchant_name: string | null
  original_currency: string | null
  original_amount: number | null
  exchange_rate: number | null
  source: 'santander_current' | 'santander_cc'
  source_id: string | null
  import_hash: string
  raw_data: Record<string, unknown>
  is_transfer: boolean
  is_recurring: boolean
}

export interface WeeklySummary {
  weekStart: Date
  weekEnd: Date
  totalSpent: number
  previousWeekSpent: number
  percentChange: number
  categoryBreakdown: CategoryTotal[]
  topMerchants: MerchantTotal[]
  dailyTotals: DailyTotal[]
  transactionCount: number
}

export interface CategoryTotal {
  category: string
  total: number
  count: number
  icon: string
}

export interface MerchantTotal {
  merchant: string
  total: number
  count: number
}

export interface DailyTotal {
  date: string
  dayOfWeek: string
  total: number
}

export interface ParsedTransaction {
  transaction_date: string
  timestamp: string
  description: string
  amount: number
  balance: number | null
  source: 'santander_current' | 'santander_cc'
  raw_data: Record<string, unknown>
}

export interface CategorizedTransaction extends ParsedTransaction {
  category: string
  subcategory: string | null
  merchant_name: string | null
  is_transfer: boolean
  is_recurring: boolean
  import_hash: string
}

export interface ImportResult {
  inserted: number
  duplicates: number
  uncategorized: CategorizedTransaction[]
  errors: string[]
}

export const CATEGORY_ICONS: Record<string, string> = {
  salary: '💰',
  gifts: '🎁',
  refunds: '↩️',
  transfer: '🔄',
  credit_card_payment: '💳',
  housing: '🏠',
  utilities: '💡',
  groceries: '🛒',
  healthcare: '🏥',
  food_drink: '🍔',
  transport: '🚇',
  shopping: '🛍️',
  entertainment: '🎬',
  subscriptions: '📱',
  travel: '✈️',
  accommodation: '🏨',
  travel_transport: '🚕',
  travel_food: '🍜',
  travel_activities: '🎯',
  travel_cash: '🏧',
  fitness: '💪',
  gaming: '🎮',
  bank_fees: '🏦',
  other: '❓',
}
