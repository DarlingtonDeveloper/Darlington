import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Summary endpoint for Kai (OpenClaw agent)
// Usage: GET /api/summary/today?user_id=xxx with X-Summary-Secret header
// Rate limited: 1 request per minute per user

// Simple in-memory rate limiting (resets on cold start, but good enough for single user)
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_MS = 60 * 1000 // 1 minute

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const lastRequest = rateLimitMap.get(userId)
  
  if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
    return true
  }
  
  rateLimitMap.set(userId, now)
  return false
}

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check secret
  const secret = request.headers.get('X-Summary-Secret')
  if (secret !== process.env.HEALTH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user_id from query params
  const { searchParams } = new URL(request.url)
  const USER_ID = searchParams.get('user_id')
  
  if (!USER_ID) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  }

  // Rate limiting
  if (isRateLimited(USER_ID)) {
    return NextResponse.json(
      { error: 'Rate limited. Max 1 request per minute.' },
      { status: 429 }
    )
  }

  // Use same date format as habits page
  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format

  try {
    // Fetch habits, today's completions, and recent completions for streaks
    const [habitsRes, completionsRes, checkinRes, healthRes, stepsRes, sleepRes, recentCompletionsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('id, name, category, is_active')
        .eq('user_id', USER_ID)
        .eq('is_active', true)
        .order('display_order'),
      supabase
        .from('habit_completions')
        .select('habit_id, completion_percentage, notes, completed_at')
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
      // Get last 30 days of completions for streak calculation
      supabase
        .from('habit_completions')
        .select('habit_id, completion_date, completion_percentage')
        .eq('user_id', USER_ID)
        .gte('completion_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'))
        .order('completion_date', { ascending: false }),
    ])

    const habits = habitsRes.data || []
    const completions = completionsRes.data || []
    const recentCompletions = recentCompletionsRes.data || []

    // Calculate streaks for each habit
    function calculateStreak(habitId: string): { current: number; atRisk: boolean } {
      const habitCompletions = recentCompletions
        .filter(c => c.habit_id === habitId && c.completion_percentage === 100)
        .map(c => c.completion_date)
      
      if (habitCompletions.length === 0) return { current: 0, atRisk: false }
      
      // Check consecutive days backwards from yesterday
      let streak = 0
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')
      let checkDate = yesterday
      
      // Include today if completed
      const completedToday = completions.some(c => c.habit_id === habitId && c.completion_percentage === 100)
      if (completedToday) {
        streak = 1
        checkDate = yesterday
      }
      
      // Count consecutive days
      for (let i = 0; i < 30; i++) {
        if (habitCompletions.includes(checkDate)) {
          streak++
          // Go back one day
          const d = new Date(checkDate)
          d.setDate(d.getDate() - 1)
          checkDate = d.toLocaleDateString('en-CA')
        } else {
          break
        }
      }
      
      // At risk = had a streak yesterday but not completed today
      const hadStreakYesterday = habitCompletions.includes(yesterday)
      const atRisk = hadStreakYesterday && !completedToday
      
      return { current: streak, atRisk }
    }

    // Calculate habit stats
    const totalHabits = habits.length
    const completedCount = completions.filter(c => c.completion_percentage === 100).length
    const partialCount = completions.filter(c => c.completion_percentage > 0 && c.completion_percentage < 100).length
    
    // Weighted completion (partials count proportionally)
    const completionSum = completions.reduce((sum, c) => sum + (c.completion_percentage / 100), 0)
    const completionPercentage = totalHabits > 0 ? Math.round((completionSum / totalHabits) * 100) : 0

    // Build completed and incomplete habit lists with streaks
    const completedIds = new Set(completions.filter(c => c.completion_percentage === 100).map(c => c.habit_id))
    
    const completedHabits = habits
      .filter(h => completedIds.has(h.id))
      .map(h => {
        const completion = completions.find(c => c.habit_id === h.id)
        const streak = calculateStreak(h.id)
        return {
          name: h.name,
          category: h.category,
          completedAt: completion?.completed_at,
          streak: streak.current,
        }
      })

    const incompleteHabits = habits
      .filter(h => !completedIds.has(h.id))
      .map(h => {
        const streak = calculateStreak(h.id)
        return {
          name: h.name,
          category: h.category,
          streak: streak.current,
          atRisk: streak.atRisk,
        }
      })

    // Habits with streaks at risk (had streak yesterday, not done today)
    const atRiskHabits = incompleteHabits.filter(h => h.atRisk)

    // Focus habits from check-in
    const focusHabitIds = checkinRes.data?.focus_habit_ids || []
    const focusHabits = habits
      .filter(h => focusHabitIds.includes(h.id))
      .map(h => {
        const completion = completions.find(c => c.habit_id === h.id)
        const streak = calculateStreak(h.id)
        return {
          name: h.name,
          completed: completion?.completion_percentage === 100,
          percentage: completion?.completion_percentage || 0,
          streak: streak.current,
        }
      })

    return NextResponse.json({
      date: today,
      generatedAt: new Date().toISOString(),
      habits: {
        total: totalHabits,
        completed: completedCount,
        partial: partialCount,
        percentage: completionPercentage,
        completedList: completedHabits,
        incompleteList: incompleteHabits.slice(0, 15),
        atRisk: atRiskHabits,
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
