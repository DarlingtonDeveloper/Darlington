import { NextResponse } from 'next/server'
import {
  checkApiAuth,
  createServiceClient,
  validateDate,
  resolveHabitName,
} from '@/lib/api-utils'

interface CheckinRequest {
  date?: string
  yesterday_reflection?: string
  today_intention?: string
  focus_habits?: string[] // Habit names or IDs (max 3)
}

interface ResolvedHabit {
  id: string
  name: string
}

export async function POST(request: Request) {
  // Check auth
  const auth = checkApiAuth(request)
  if (!auth.success) {
    return auth.response
  }
  const { userId } = auth

  // Parse body
  let body: CheckinRequest
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

  // Validate at least one field provided
  if (!body.yesterday_reflection && !body.today_intention && !body.focus_habits) {
    return NextResponse.json(
      { success: false, error: 'Must provide at least one of: yesterday_reflection, today_intention, focus_habits' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  try {
    // Resolve focus habits if provided
    const focusHabitIds: string[] = []
    const resolvedFocusHabits: ResolvedHabit[] = []
    const failedFocusHabits: string[] = []

    if (body.focus_habits && body.focus_habits.length > 0) {
      // Limit to 3 focus habits
      const habitsToResolve = body.focus_habits.slice(0, 3)

      for (const input of habitsToResolve) {
        // Check if input is a UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)

        if (isUuid) {
          // Direct ID lookup
          const { data: habit } = await supabase
            .from('habits')
            .select('id, name')
            .eq('id', input)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single()

          if (habit) {
            focusHabitIds.push(habit.id)
            resolvedFocusHabits.push({ id: habit.id, name: habit.name })
          } else {
            failedFocusHabits.push(input)
          }
        } else {
          // Fuzzy match by name
          const habit = await resolveHabitName(supabase, userId, input)
          if (habit) {
            focusHabitIds.push(habit.id)
            resolvedFocusHabits.push({ id: habit.id, name: habit.name })
          } else {
            failedFocusHabits.push(input)
          }
        }
      }
    }

    // Check for existing check-in
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', userId)
      .eq('checkin_date', date)
      .single()

    // Build check-in data
    const checkinData = {
      user_id: userId,
      checkin_date: date,
      yesterday_reflection: body.yesterday_reflection ?? null,
      today_intention: body.today_intention ?? null,
      focus_habit_ids: focusHabitIds.length > 0 ? focusHabitIds : null,
      updated_at: new Date().toISOString(),
    }

    let action: 'created' | 'updated'
    let checkinId: string

    if (existing) {
      // Update existing check-in
      const { error } = await supabase
        .from('daily_checkins')
        .update(checkinData)
        .eq('id', existing.id)

      if (error) {
        console.error('Error updating check-in:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to update check-in' },
          { status: 500 }
        )
      }

      action = 'updated'
      checkinId = existing.id
    } else {
      // Insert new check-in
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert(checkinData)
        .select('id')
        .single()

      if (error) {
        console.error('Error creating check-in:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to create check-in' },
          { status: 500 }
        )
      }

      action = 'created'
      checkinId = data.id
    }

    const response: Record<string, unknown> = {
      success: true,
      date,
      checkin: {
        id: checkinId,
        yesterday_reflection: body.yesterday_reflection ?? null,
        today_intention: body.today_intention ?? null,
        focus_habits: resolvedFocusHabits,
      },
      action,
    }

    // Include failed focus habits if any
    if (failedFocusHabits.length > 0) {
      response.warnings = {
        unresolved_focus_habits: failedFocusHabits,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in check-in:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process check-in' },
      { status: 500 }
    )
  }
}
