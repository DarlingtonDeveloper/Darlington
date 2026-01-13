import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'templates' or 'logs'

  if (type === 'templates') {
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

  // Default: fetch logs
  const days = parseInt(searchParams.get('days') || '30')
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(days)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 })
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
  const { template_id, template_name, duration_minutes, exercises_completed, notes } = body

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: user.id,
      template_id,
      template_name,
      duration_minutes,
      exercises_completed: exercises_completed || [],
      notes,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving workout log:', error)
    return NextResponse.json({ error: 'Failed to save workout log' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
