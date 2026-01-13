import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface MorningPayload {
  secret: string
  wake_time: string // ISO 8601 timestamp
}

/**
 * Calculate wake score based on deviation from 7:00 AM target
 * 60% weight in total sleep score (consistency > duration)
 */
function calculateWakeScore(wakeTime: Date, targetMinutes: number = 420): number {
  const wakeMinutes = wakeTime.getHours() * 60 + wakeTime.getMinutes()
  const deviation = Math.abs(wakeMinutes - targetMinutes)

  if (deviation <= 15) return 100
  if (deviation <= 30) return 85
  if (deviation <= 60) return 60
  if (deviation <= 90) return 30
  return 0
}

export async function POST(request: Request) {
  try {
    const { secret, wake_time }: MorningPayload = await request.json()

    // Validate webhook secret
    if (secret !== process.env.HEALTH_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (!wake_time) {
      return NextResponse.json({ error: 'wake_time is required' }, { status: 400 })
    }

    // Get user from health_settings by webhook_secret
    const { data: settings, error: settingsError } = await supabase
      .from('health_settings')
      .select('user_id, wake_target_time')
      .eq('webhook_secret', secret)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'No user found for this webhook secret' },
        { status: 404 }
      )
    }

    const wakeDate = new Date(wake_time)
    // Sleep date is the previous day (we woke up from last night's sleep)
    const sleepDate = new Date(wakeDate)
    sleepDate.setDate(sleepDate.getDate() - 1)
    const sleepDateStr = sleepDate.toISOString().split('T')[0]

    // Calculate wake score
    const targetMinutes = settings.wake_target_time
      ? parseInt(settings.wake_target_time.split(':')[0]) * 60 +
        parseInt(settings.wake_target_time.split(':')[1])
      : 420 // 7:00 AM default

    const wakeScore = calculateWakeScore(wakeDate, targetMinutes)

    // Upsert sleep entry with wake_time
    const { data, error } = await supabase
      .from('sleep_entries')
      .upsert(
        {
          user_id: settings.user_id,
          sleep_date: sleepDateStr,
          wake_time: wake_time,
          wake_score: wakeScore,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,sleep_date' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error upserting sleep entry:', error)
      return NextResponse.json({ error: 'Failed to save wake time' }, { status: 500 })
    }

    // If bedtime exists, calculate duration and total score
    if (data?.bedtime) {
      const bedtimeDate = new Date(data.bedtime)
      const durationMinutes = Math.round(
        (wakeDate.getTime() - bedtimeDate.getTime()) / (1000 * 60)
      )
      const durationHours = durationMinutes / 60

      // Duration score (40% weight)
      let durationScore: number
      if (durationHours >= 7 && durationHours <= 9) durationScore = 100
      else if (durationHours >= 6) durationScore = 75
      else if (durationHours >= 5) durationScore = 50
      else durationScore = 25

      const totalScore = Math.round(wakeScore * 0.6 + durationScore * 0.4)

      await supabase
        .from('sleep_entries')
        .update({
          duration_minutes: durationMinutes,
          duration_score: durationScore,
          total_score: totalScore,
        })
        .eq('id', data.id)
    }

    return NextResponse.json({
      success: true,
      sleep_date: sleepDateStr,
      wake_time,
      wake_score: wakeScore,
    })
  } catch (error) {
    console.error('Morning webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
