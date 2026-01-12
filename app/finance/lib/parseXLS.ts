import * as XLSX from 'xlsx'
import type { ParsedTransaction } from '../types'

interface SantanderRow {
  Date?: string
  Description?: string
  'Money in'?: string | number
  'Money out'?: string | number
  Balance?: string | number
  // Credit card columns
  Card?: string
  Amount?: string | number
}

function parseUKDate(dateStr: string): string {
  // Handle DD/MM/YYYY format
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  // Try parsing as-is
  return dateStr
}

function parseAmount(value: string | number | undefined): number {
  if (value === undefined || value === '' || value === null) return 0
  if (typeof value === 'number') return value
  // Remove currency symbols and commas
  const cleaned = value.replace(/[£$,\s]/g, '')
  return parseFloat(cleaned) || 0
}

export type SantanderSource = 'santander_current' | 'santander_cc'

export function detectSantanderType(workbook: XLSX.WorkBook): SantanderSource {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<SantanderRow>(firstSheet, { range: 4 })

  if (data.length > 0) {
    const firstRow = data[0]
    // Credit card has Card column
    if ('Card' in firstRow || 'card' in firstRow) {
      return 'santander_cc'
    }
    // Current account has Balance column
    if ('Balance' in firstRow || 'balance' in firstRow) {
      return 'santander_current'
    }
  }

  // Default to current account
  return 'santander_current'
}

export function parseSantanderXLS(
  data: ArrayBuffer,
  source?: SantanderSource
): ParsedTransaction[] {
  // Read the workbook - Santander XLS is actually HTML table format
  const workbook = XLSX.read(data, { type: 'array' })

  // Auto-detect source if not provided
  const detectedSource = source ?? detectSantanderType(workbook)

  // Get first sheet
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

  // Convert to JSON, skipping first few rows (header junk)
  // Santander XLS files have ~4-5 rows of header content
  const rows = XLSX.utils.sheet_to_json<SantanderRow>(firstSheet, {
    range: 4,
    defval: '',
  })

  const transactions: ParsedTransaction[] = []

  for (const row of rows) {
    // Skip empty rows
    if (!row.Date && !row.Description) continue

    const dateStr = row.Date?.toString() || ''
    if (!dateStr) continue

    const description = row.Description?.toString().trim() || ''
    if (!description) continue

    // Parse amount
    let amount = 0
    let balance: number | null = null

    if (detectedSource === 'santander_current') {
      // Current account: Money in (positive) or Money out (negative)
      const moneyIn = parseAmount(row['Money in'])
      const moneyOut = parseAmount(row['Money out'])
      amount = moneyIn > 0 ? moneyIn : -moneyOut
      balance = parseAmount(row.Balance) || null
    } else {
      // Credit card: Amount column (negative for spending)
      amount = parseAmount(row.Amount)
      // Credit card transactions are typically shown as positive but are spending
      if (amount > 0) amount = -amount
    }

    // Skip zero amount transactions
    if (amount === 0) continue

    const transaction_date = parseUKDate(dateStr)
    const timestamp = `${transaction_date}T12:00:00.000Z`

    transactions.push({
      transaction_date,
      timestamp,
      description,
      amount,
      balance,
      source: detectedSource,
      raw_data: row as Record<string, unknown>,
    })
  }

  return transactions
}

export function parseXLSFile(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer
        const transactions = parseSantanderXLS(data)
        resolve(transactions)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}
