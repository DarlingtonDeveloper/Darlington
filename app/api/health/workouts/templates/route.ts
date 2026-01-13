import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, scheduled_days, exercises } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('workout_templates')
    .insert({
      user_id: user.id,
      name,
      description,
      scheduled_days: scheduled_days || [],
      exercises: exercises || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, description, scheduled_days, exercises, is_active } = body

  if (!id) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (name !== undefined) updateData.name = name
  if (description !== undefined) updateData.description = description
  if (scheduled_days !== undefined) updateData.scheduled_days = scheduled_days
  if (exercises !== undefined) updateData.exercises = exercises
  if (is_active !== undefined) updateData.is_active = is_active

  const { data, error } = await supabase
    .from('workout_templates')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
  }

  // Soft delete - just mark as inactive
  const { error } = await supabase
    .from('workout_templates')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
