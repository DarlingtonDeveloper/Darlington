import { NextResponse } from 'next/server'
import {
  checkApiAuth,
  createServiceClient,
  validateDate,
  computeCompletionStats,
  EnergyLevel,
} from '@/lib/api-utils'

interface SummaryRequest {
  date?: string
  energy_level?: EnergyLevel
  context_notes?: string
}

export async function POST(request: Request) {
  // Check auth
  const auth = checkApiAuth(request)
  if (!auth.success) {
    return auth.response
  }
  const { userId } = auth

  // Parse body
  let body: SummaryRequest
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

  // Validate energy_level if provided
  if (body.energy_level && !['low', 'medium', 'high'].includes(body.energy_level)) {
    return NextResponse.json(
      { success: false, error: 'energy_level must be one of: low, medium, high' },
      { status: 400 }
    )
  }

  // Validate at least one field provided
  if (!body.energy_level && !body.context_notes) {
    return NextResponse.json(
      { success: false, error: 'Must provide at least one of: energy_level, context_notes' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  try {
    // Compute completion stats
    const stats = await computeCompletionStats(supabase, userId, date)

    // Check for existing summary
    const { data: existing } = await supabase
      .from('daily_summaries')
      .select('id')
      .eq('user_id', userId)
      .eq('summary_date', date)
      .single()

    // Build summary data
    const summaryData = {
      user_id: userId,
      summary_date: date,
      total_habits: stats.total,
      completed_count: stats.completed,
      completion_percentage: stats.percentage,
      energy_level: body.energy_level ?? null,
      context_notes: body.context_notes ?? null,
      updated_at: new Date().toISOString(),
    }

    let action: 'created' | 'updated'
    let summaryId: string

    if (existing) {
      // Update existing summary
      const { error } = await supabase
        .from('daily_summaries')
        .update(summaryData)
        .eq('id', existing.id)

      if (error) {
        console.error('Error updating summary:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to update summary' },
          { status: 500 }
        )
      }

      action = 'updated'
      summaryId = existing.id
    } else {
      // Insert new summary
      const { data, error } = await supabase
        .from('daily_summaries')
        .insert(summaryData)
        .select('id')
        .single()

      if (error) {
        console.error('Error creating summary:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to create summary' },
          { status: 500 }
        )
      }

      action = 'created'
      summaryId = data.id
    }

    return NextResponse.json({
      success: true,
      date,
      summary: {
        id: summaryId,
        energy_level: body.energy_level ?? null,
        context_notes: body.context_notes ?? null,
        total_habits: stats.total,
        completed_count: stats.completed,
        completion_percentage: stats.percentage,
      },
      action,
    })
  } catch (error) {
    console.error('Error in summary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process summary' },
      { status: 500 }
    )
  }
}
