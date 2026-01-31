import { NextResponse } from 'next/server'
import { checkApiAuth, createServiceClient } from '@/lib/api-utils'

interface HabitWithStatus {
  id: string
  name: string
  category: string | null
  completed_today: boolean
  completion_percentage: number
  health_linked: boolean
}

interface HabitsByCategory {
  [category: string]: string[]
}

export async function GET(request: Request) {
  // Check auth
  const auth = checkApiAuth(request)
  if (!auth.success) {
    return auth.response
  }
  const { userId } = auth

  // Get optional date param (defaults to today)
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')
  const date = dateParam || new Date().toLocaleDateString('en-CA')

  const supabase = createServiceClient()

  try {
    // Fetch habits and completions in parallel
    const [habitsRes, completionsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('id, name, category, health_link')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('display_order'),
      supabase
        .from('habit_completions')
        .select('habit_id, completion_percentage')
        .eq('user_id', userId)
        .eq('completion_date', date),
    ])

    if (habitsRes.error) {
      console.error('Error fetching habits:', habitsRes.error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch habits' },
        { status: 500 }
      )
    }

    const habits = habitsRes.data || []
    const completions = completionsRes.data || []

    // Create completion lookup
    const completionMap = new Map(
      completions.map((c) => [c.habit_id, c.completion_percentage])
    )

    // Build habit list with status
    const habitsWithStatus: HabitWithStatus[] = habits.map((h) => ({
      id: h.id,
      name: h.name,
      category: h.category,
      completed_today: (completionMap.get(h.id) || 0) === 100,
      completion_percentage: completionMap.get(h.id) || 0,
      health_linked: h.health_link !== null,
    }))

    // Group by category
    const byCategory: HabitsByCategory = {}
    const incompleteByCategory: HabitsByCategory = {}

    for (const habit of habits) {
      const cat = habit.category || 'uncategorized'
      const isHealthLinked = habit.health_link !== null
      const isComplete = (completionMap.get(habit.id) || 0) === 100

      // Add to by_category
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(habit.name)

      // Add to incomplete_by_category (skip health-linked habits)
      if (!isHealthLinked && !isComplete) {
        if (!incompleteByCategory[cat]) incompleteByCategory[cat] = []
        incompleteByCategory[cat].push(habit.name)
      }
    }

    // Calculate stats
    const total = habits.length
    const completed = completions.filter((c) => c.completion_percentage === 100).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return NextResponse.json({
      success: true,
      date,
      habits: habitsWithStatus,
      by_category: byCategory,
      incomplete_by_category: incompleteByCategory,
      stats: {
        total,
        completed,
        percentage,
      },
    })
  } catch (error) {
    console.error('Error in habits list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}
