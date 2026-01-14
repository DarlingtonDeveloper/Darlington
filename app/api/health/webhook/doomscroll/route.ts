import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface DoomscrollPayload {
  secret: string
  user_id: string
  app: string
  duration_minutes?: number
}

export async function POST(request: Request) {
  try {
    const { secret, user_id, app, duration_minutes = 3 }: DoomscrollPayload =
      await request.json()

    if (secret !== process.env.HEALTH_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    if (!app) {
      return NextResponse.json({ error: 'app is required' }, { status: 400 })
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('screen_time_events')
      .insert({
        user_id,
        event_date: today,
        event_time: now.toISOString(),
        app_name: app,
        duration_minutes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving doomscroll event:', error)
      return NextResponse.json({ error: 'Failed to save event' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      app,
      duration_minutes,
      event_id: data.id,
    })
  } catch (error) {
    console.error('Doomscroll webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
