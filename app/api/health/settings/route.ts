import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('health_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
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
  const {
    steps_target,
    wake_target_time,
    sleep_duration_target_hours,
    generate_new_secret,
  } = body

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (steps_target !== undefined) updateData.steps_target = steps_target
  if (wake_target_time !== undefined) updateData.wake_target_time = wake_target_time
  if (sleep_duration_target_hours !== undefined)
    updateData.sleep_duration_target_hours = sleep_duration_target_hours

  // Generate new webhook secret if requested
  if (generate_new_secret) {
    updateData.webhook_secret = `hlth_${randomBytes(32).toString('hex')}`
  }

  const { data, error } = await supabase
    .from('health_settings')
    .upsert(
      {
        user_id: user.id,
        ...updateData,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
