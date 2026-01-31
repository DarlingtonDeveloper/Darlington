import { NextResponse } from 'next/server'
import {
  checkApiAuth,
  createServiceClient,
  validateDate,
  resolveHabitName,
  resolveHabitsByCategory,
  computeCompletionStats,
} from '@/lib/api-utils'

interface HabitCompleteRequest {
  habit_name?: string
  habits?: Array<{
    habit_name: string
    completion_percentage?: number
    notes?: string
  }>
  category?: string
  completion_percentage?: number
  notes?: string
  date?: string
}

interface CompletedResult {
  habit_name: string
  habit_id: string
  completion_percentage: number
  action: 'created' | 'updated'
}

interface FailedResult {
  habit_name: string
  error: string
}

export async function POST(request: Request) {
  // Check auth
  const auth = checkApiAuth(request)
  if (!auth.success) {
    return auth.response
  }
  const { userId } = auth

  // Parse body
  let body: HabitCompleteRequest
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

  // Validate request has at least one of habit_name, habits, or category
  if (!body.habit_name && !body.habits && !body.category) {
    return NextResponse.json(
      { success: false, error: 'Must provide habit_name, habits, or category' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()
  const completed: CompletedResult[] = []
  const failed: FailedResult[] = []

  // Build list of habits to complete
  const habitsToComplete: Array<{
    name: string
    percentage: number
    notes?: string
  }> = []

  if (body.habit_name) {
    // Single habit
    habitsToComplete.push({
      name: body.habit_name,
      percentage: body.completion_percentage ?? 100,
      notes: body.notes,
    })
  } else if (body.habits) {
    // Multiple habits
    for (const h of body.habits) {
      habitsToComplete.push({
        name: h.habit_name,
        percentage: h.completion_percentage ?? body.completion_percentage ?? 100,
        notes: h.notes ?? body.notes,
      })
    }
  } else if (body.category) {
    // All habits in category
    const categoryHabits = await resolveHabitsByCategory(supabase, userId, body.category)
    for (const h of categoryHabits) {
      habitsToComplete.push({
        name: h.name,
        percentage: body.completion_percentage ?? 100,
        notes: body.notes,
      })
    }
    if (categoryHabits.length === 0) {
      return NextResponse.json(
        { success: false, error: `No habits found in category: ${body.category}` },
        { status: 404 }
      )
    }
  }

  // Process each habit
  for (const item of habitsToComplete) {
    // Resolve habit name
    const habit = await resolveHabitName(supabase, userId, item.name)

    if (!habit) {
      failed.push({ habit_name: item.name, error: 'No matching habit found' })
      continue
    }

    // Skip health-linked habits
    if (habit.health_link) {
      failed.push({ habit_name: habit.name, error: 'Cannot manually complete health-linked habit' })
      continue
    }

    // Check for existing completion
    const { data: existing } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habit.id)
      .eq('user_id', userId)
      .eq('completion_date', date)
      .single()

    const percentage = Math.min(100, Math.max(0, item.percentage))

    if (existing) {
      // Update existing completion
      const { error: updateError } = await supabase
        .from('habit_completions')
        .update({
          completion_percentage: percentage,
          notes: item.notes || null,
          completed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        failed.push({ habit_name: habit.name, error: updateError.message })
      } else {
        completed.push({
          habit_name: habit.name,
          habit_id: habit.id,
          completion_percentage: percentage,
          action: 'updated',
        })
      }
    } else {
      // Insert new completion
      const completedAt =
        date === new Date().toLocaleDateString('en-CA')
          ? new Date().toISOString()
          : `${date}T12:00:00.000Z`

      const { error: insertError } = await supabase.from('habit_completions').insert({
        habit_id: habit.id,
        user_id: userId,
        completion_date: date,
        completion_percentage: percentage,
        completed_at: completedAt,
        notes: item.notes || null,
      })

      if (insertError) {
        failed.push({ habit_name: habit.name, error: insertError.message })
      } else {
        completed.push({
          habit_name: habit.name,
          habit_id: habit.id,
          completion_percentage: percentage,
          action: 'created',
        })
      }
    }
  }

  // Get updated stats
  const stats = await computeCompletionStats(supabase, userId, date)

  return NextResponse.json({
    success: true,
    date,
    completed,
    failed,
    stats: {
      total_habits: stats.total,
      completed_now: stats.completed,
      percentage: stats.percentage,
    },
  })
}
