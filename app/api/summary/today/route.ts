import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Public summary endpoint - secured by secret header
// Usage: GET /api/summary/today with X-Summary-Secret header

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Mike's user ID (single-user app)
const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

export async function GET(request: Request) {
  // Check secret
  const secret = request.headers.get('X-Summary-Secret')
  if (secret !== process.env.HEALTH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  try {
    // Fetch habits and today's completions
    const [habitsRes, completionsRes, checkinRes, healthRes, stepsRes, sleepRes] = await Promise.all([
      supabase
        .from('habits')
        .select('id, name, category, is_active')
        .eq('user_id', USER_ID)
        .eq('is_active', true),
      supabase
        .from('habit_completions')
        .select('habit_id, completion_percentage, note, completed_at')
        .eq('user_id', USER_ID)
        .eq('completion_date', today),
      supabase
        .from('daily_checkins')
        .select('today_intention, focus_habit_ids, yesterday_reflection')
        .eq('user_id', USER_ID)
        .eq('checkin_date', today)
        .single(),
      supabase
        .from('diet_entries')
        .select('daily_score, no_alcohol, protein_focus, hydration')
        .eq('user_id', USER_ID)
        .eq('entry_date', today)
        .single(),
      supabase
        .from('steps_entries')
        .select('step_count, target, score')
        .eq('user_id', USER_ID)
        .eq('entry_date', today)
        .single(),
      supabase
        .from('sleep_entries')
        .select('wake_time, bedtime, duration_minutes, total_score')
        .eq('user_id', USER_ID)
        .eq('sleep_date', today)
        .single(),
    ])

    const habits = habitsRes.data || []
    const completions = completionsRes.data || []

    // Calculate habit stats
    const totalHabits = habits.length
    const completedHabits = completions.filter(c => c.completion_percentage === 100).length
    const partialHabits = completions.filter(c => c.completion_percentage > 0 && c.completion_percentage < 100).length
    
    // Weighted completion (partials count proportionally)
    const completionSum = completions.reduce((sum, c) => sum + (c.completion_percentage / 100), 0)
    const completionPercentage = totalHabits > 0 ? Math.round((completionSum / totalHabits) * 100) : 0

    // Find incomplete habits
    const completedIds = new Set(completions.map(c => c.habit_id))
    const incompleteHabits = habits
      .filter(h => !completedIds.has(h.id))
      .map(h => ({ name: h.name, category: h.category }))

    // Focus habits from check-in
    const focusHabitIds = checkinRes.data?.focus_habit_ids || []
    const focusHabits = habits
      .filter(h => focusHabitIds.includes(h.id))
      .map(h => {
        const completion = completions.find(c => c.habit_id === h.id)
        return {
          name: h.name,
          completed: completion?.completion_percentage === 100,
          percentage: completion?.completion_percentage || 0
        }
      })

    return NextResponse.json({
      date: today,
      habits: {
        total: totalHabits,
        completed: completedHabits,
        partial: partialHabits,
        percentage: completionPercentage,
        incomplete: incompleteHabits.slice(0, 10), // Top 10
        focus: focusHabits,
      },
      checkin: checkinRes.data ? {
        intention: checkinRes.data.today_intention,
        reflection: checkinRes.data.yesterday_reflection,
      } : null,
      health: {
        sleep: sleepRes.data ? {
          wakeTime: sleepRes.data.wake_time,
          bedtime: sleepRes.data.bedtime,
          durationMinutes: sleepRes.data.duration_minutes,
          score: sleepRes.data.total_score,
        } : null,
        steps: stepsRes.data ? {
          count: stepsRes.data.step_count,
          target: stepsRes.data.target,
          score: stepsRes.data.score,
        } : null,
        diet: healthRes.data ? {
          score: healthRes.data.daily_score,
          alcohol: healthRes.data.no_alcohol === 100,
          protein: healthRes.data.protein_focus,
          hydration: healthRes.data.hydration,
        } : null,
      },
    })
  } catch (error) {
    console.error('Summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
