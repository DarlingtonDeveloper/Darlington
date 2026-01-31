import { NextResponse } from 'next/server'
import {
  checkApiAuth,
  createServiceClient,
  validateDate,
  DIET_SIGNALS,
  DietSignal,
} from '@/lib/api-utils'

interface DietUpdateRequest {
  date?: string
  signals?: Partial<Record<DietSignal, number>>
  all?: number
}

interface DietSignals {
  no_alcohol: number
  no_snacking: number
  no_sugar: number
  no_junk: number
  protein_focus: number
  hydration: number
  no_late_eating: number
  ate_vegetables: number
  caffeine_cutoff: number
  mindful_portions: number
}

const DEFAULT_SIGNALS: DietSignals = {
  no_alcohol: 0,
  no_snacking: 0,
  no_sugar: 0,
  no_junk: 0,
  protein_focus: 0,
  hydration: 0,
  no_late_eating: 0,
  ate_vegetables: 0,
  caffeine_cutoff: 0,
  mindful_portions: 0,
}

export async function POST(request: Request) {
  // Check auth
  const auth = checkApiAuth(request)
  if (!auth.success) {
    return auth.response
  }
  const { userId } = auth

  // Parse body
  let body: DietUpdateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Validate date
  const dateValidation = validateDate(body.date)
  if (!dateValidation.valid) {
    return NextResponse.json(
      { success: false, error: dateValidation.error },
      { status: 400 }
    )
  }
  const date = dateValidation.date

  // Validate request has signals or all
  if (!body.signals && body.all === undefined) {
    return NextResponse.json(
      { success: false, error: 'Must provide signals or all' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  try {
    // Fetch existing entry
    const { data: existing } = await supabase
      .from('diet_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .single()

    // Build updated signals
    let updatedSignals: DietSignals

    if (body.all !== undefined) {
      // Set all signals to the same value
      const value = Math.min(100, Math.max(0, body.all))
      updatedSignals = {
        no_alcohol: value,
        no_snacking: value,
        no_sugar: value,
        no_junk: value,
        protein_focus: value,
        hydration: value,
        no_late_eating: value,
        ate_vegetables: value,
        caffeine_cutoff: value,
        mindful_portions: value,
      }
    } else {
      // Merge with existing or defaults
      updatedSignals = { ...DEFAULT_SIGNALS }

      // Apply existing values if entry exists
      if (existing) {
        for (const signal of DIET_SIGNALS) {
          if (existing[signal] !== undefined && existing[signal] !== null) {
            updatedSignals[signal] = existing[signal]
          }
        }
      }

      // Apply new values (clamp to 0-100)
      if (body.signals) {
        for (const [key, value] of Object.entries(body.signals)) {
          if (DIET_SIGNALS.includes(key as DietSignal) && typeof value === 'number') {
            updatedSignals[key as DietSignal] = Math.min(100, Math.max(0, value))
          }
        }
      }
    }

    // Upsert diet entry
    const { data, error } = await supabase
      .from('diet_entries')
      .upsert(
        {
          user_id: userId,
          entry_date: date,
          ...updatedSignals,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,entry_date' }
      )
      .select('daily_score')
      .single()

    if (error) {
      console.error('Error upserting diet entry:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update diet signals' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      date,
      signals: updatedSignals,
      daily_score: data?.daily_score ?? null,
      action: existing ? 'updated' : 'created',
    })
  } catch (error) {
    console.error('Error in diet update:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update diet signals' },
      { status: 500 }
    )
  }
}
