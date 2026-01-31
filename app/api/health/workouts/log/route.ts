import { NextResponse } from 'next/server'
import {
  checkApiAuth,
  createServiceClient,
  validateDate,
  resolveWorkoutTemplate,
} from '@/lib/api-utils'

interface ExerciseCompleted {
  name: string
  completed: boolean
  actual?: number
}

interface WorkoutLogRequest {
  template_name?: string
  template_id?: string
  duration_minutes?: number
  exercises_completed?: ExerciseCompleted[]
  notes?: string
  date?: string
}

export async function POST(request: Request) {
  // Check auth
  const auth = checkApiAuth(request)
  if (!auth.success) {
    return auth.response
  }
  const { userId } = auth

  // Parse body
  let body: WorkoutLogRequest
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

  // Must provide template_name or template_id
  if (!body.template_name && !body.template_id) {
    return NextResponse.json(
      { success: false, error: 'Must provide template_name or template_id' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  try {
    let templateId: string | null = null
    let templateName: string | null = null
    let exercisesCompleted: ExerciseCompleted[]

    if (body.template_id) {
      // Direct template ID lookup
      const { data: template, error } = await supabase
        .from('workout_templates')
        .select('id, name, exercises')
        .eq('id', body.template_id)
        .eq('user_id', userId)
        .single()

      if (error || !template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        )
      }

      templateId = template.id
      templateName = template.name

      // Default exercises if not provided
      exercisesCompleted = body.exercises_completed ??
        (template.exercises as { name: string }[]).map((e) => ({
          name: e.name,
          completed: true,
        }))
    } else if (body.template_name) {
      // Fuzzy match template name
      const template = await resolveWorkoutTemplate(supabase, userId, body.template_name)

      if (!template) {
        return NextResponse.json(
          { success: false, error: `No matching template found for: ${body.template_name}` },
          { status: 404 }
        )
      }

      templateId = template.id
      templateName = template.name

      // Default exercises if not provided
      exercisesCompleted = body.exercises_completed ??
        template.exercises.map((e) => ({
          name: e.name,
          completed: true,
        }))
    } else {
      exercisesCompleted = body.exercises_completed || []
    }

    // Insert workout log
    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        user_id: userId,
        template_id: templateId,
        template_name: templateName,
        logged_at: new Date().toISOString(),
        duration_minutes: body.duration_minutes,
        exercises_completed: exercisesCompleted,
        notes: body.notes,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error inserting workout log:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to log workout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      date,
      workout: {
        id: data.id,
        template_name: templateName,
        exercises_completed: exercisesCompleted,
        duration_minutes: body.duration_minutes,
      },
      action: 'created',
    })
  } catch (error) {
    console.error('Error in workout log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log workout' },
      { status: 500 }
    )
  }
}
