import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface DoomscrollLog {
  app: string
  duration_minutes: number
  timestamp: string
}

interface EveningPayload {
  secret: string
  bedtime: string // ISO 8601 timestamp
  steps?: number
  doomscroll_logs?: DoomscrollLog[]
}

export async function POST(request: Request) {
  try {
    const { secret, bedtime, steps, doomscroll_logs }: EveningPayload =
      await request.json()

    // Validate webhook secret
    if (secret !== process.env.HEALTH_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    // Get user from health_settings by webhook_secret
    const { data: settings, error: settingsError } = await supabase
      .from('health_settings')
      .select('user_id, steps_target')
      .eq('webhook_secret', secret)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'No user found for this webhook secret' },
        { status: 404 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const results: Record<string, unknown> = {}

    // 1. Save bedtime (for tonight's sleep entry)
    if (bedtime) {
      const { data: sleepData, error: sleepError } = await supabase
        .from('sleep_entries')
        .upsert(
          {
            user_id: settings.user_id,
            sleep_date: today,
            bedtime: bedtime,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,sleep_date' }
        )
        .select()
        .single()

      if (sleepError) {
        console.error('Error saving bedtime:', sleepError)
      }
      results.sleep = { saved: !sleepError, data: sleepData }
    }

    // 2. Save steps
    if (steps !== undefined) {
      const stepTarget = settings.steps_target || 10000

      const { data: stepsData, error: stepsError } = await supabase
        .from('steps_entries')
        .upsert(
          {
            user_id: settings.user_id,
            entry_date: today,
            step_count: steps,
            target: stepTarget,
            source: 'ios_shortcut',
          },
          { onConflict: 'user_id,entry_date' }
        )
        .select()
        .single()

      if (stepsError) {
        console.error('Error saving steps:', stepsError)
      }
      results.steps = {
        saved: !stepsError,
        count: steps,
        target: stepTarget,
        score: stepsData?.score,
      }
    }

    // 3. Save doomscroll logs
    if (doomscroll_logs && doomscroll_logs.length > 0) {
      const events = doomscroll_logs.map((log) => ({
        user_id: settings.user_id,
        event_date: new Date(log.timestamp).toISOString().split('T')[0],
        event_time: log.timestamp,
        app_name: log.app,
        duration_minutes: log.duration_minutes,
      }))

      const { error: screentimeError } = await supabase
        .from('screen_time_events')
        .insert(events)

      if (screentimeError) {
        console.error('Error saving screen time events:', screentimeError)
      }
      results.screentime = {
        saved: !screentimeError,
        count: events.length,
      }
    }

    return NextResponse.json({
      success: true,
      date: today,
      results,
    })
  } catch (error) {
    console.error('Evening webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
