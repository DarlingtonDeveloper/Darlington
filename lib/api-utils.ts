import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthResult {
  success: true
  userId: string
}

export interface AuthError {
  success: false
  response: NextResponse
}

export interface HabitMatch {
  id: string
  name: string
  category: string | null
  health_link: string | null
}

export interface DateValidation {
  valid: boolean
  date: string
  error?: string
}

export const DIET_SIGNALS = [
  'no_alcohol',
  'no_snacking',
  'no_sugar',
  'no_junk',
  'protein_focus',
  'hydration',
  'no_late_eating',
  'ate_vegetables',
  'caffeine_cutoff',
  'mindful_portions',
] as const

export type DietSignal = (typeof DIET_SIGNALS)[number]

export type EnergyLevel = 'low' | 'medium' | 'high'

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Check API authentication via X-Summary-Secret header and user_id query param.
 * Returns userId on success, or a NextResponse error on failure.
 */
export function checkApiAuth(request: Request): AuthResult | AuthError {
  const secret = request.headers.get('X-Summary-Secret')
  if (secret !== process.env.HEALTH_WEBHOOK_SECRET) {
    return {
      success: false,
      response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      ),
    }
  }

  return { success: true, userId }
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

/**
 * Validate and resolve a date string.
 * - Defaults to today if not provided
 * - Rejects future dates
 * - Rejects dates older than 24 hours (backfill limit)
 */
export function validateDate(dateInput?: string | null): DateValidation {
  const now = new Date()
  const today = now.toLocaleDateString('en-CA') // YYYY-MM-DD

  if (!dateInput) {
    return { valid: true, date: today }
  }

  // Validate format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateInput)) {
    return { valid: false, date: today, error: 'Invalid date format. Use YYYY-MM-DD' }
  }

  // Parse date (use noon to avoid timezone issues)
  const targetDate = new Date(dateInput + 'T12:00:00')
  if (isNaN(targetDate.getTime())) {
    return { valid: false, date: today, error: 'Invalid date' }
  }

  // Check for future date
  const todayStart = new Date(today + 'T00:00:00')
  if (targetDate > todayStart) {
    return { valid: false, date: today, error: 'Cannot set data for future dates' }
  }

  // Check 24-hour backfill limit (allow yesterday with grace period)
  const hoursSinceTarget = (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60)
  if (hoursSinceTarget > 48) {
    return {
      valid: false,
      date: today,
      error: 'Cannot backfill more than 24 hours',
    }
  }

  return { valid: true, date: dateInput }
}

// ============================================================================
// HABIT NAME RESOLUTION
// ============================================================================

/**
 * Fuzzy match a habit name against user's active habits.
 * Priority: exact match > partial match > shortest partial match
 */
export async function resolveHabitName(
  supabase: SupabaseClient,
  userId: string,
  searchTerm: string
): Promise<HabitMatch | null> {
  const { data: habits, error } = await supabase
    .from('habits')
    .select('id, name, category, health_link')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error || !habits?.length) return null

  const normalized = searchTerm.toLowerCase().trim()

  // 1. Exact match (case-insensitive)
  const exactMatch = habits.find((h) => h.name.toLowerCase() === normalized)
  if (exactMatch) return exactMatch

  // 2. Partial match (contains)
  const partialMatches = habits.filter((h) => h.name.toLowerCase().includes(normalized))

  if (partialMatches.length === 1) {
    return partialMatches[0]
  }

  // 3. Multiple partial matches - return shortest (most specific)
  if (partialMatches.length > 1) {
    return partialMatches.reduce((shortest, current) =>
      current.name.length < shortest.name.length ? current : shortest
    )
  }

  return null
}

/**
 * Get all active habits in a category for a user.
 */
export async function resolveHabitsByCategory(
  supabase: SupabaseClient,
  userId: string,
  category: string
): Promise<HabitMatch[]> {
  const { data: habits, error } = await supabase
    .from('habits')
    .select('id, name, category, health_link')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('category', category.toLowerCase())

  if (error || !habits?.length) return []

  return habits
}

// ============================================================================
// WORKOUT TEMPLATE RESOLUTION
// ============================================================================

export interface WorkoutTemplate {
  id: string
  name: string
  exercises: { name: string; type: string; target: number }[]
}

/**
 * Fuzzy match a workout template name.
 */
export async function resolveWorkoutTemplate(
  supabase: SupabaseClient,
  userId: string,
  templateName: string
): Promise<WorkoutTemplate | null> {
  const { data: templates, error } = await supabase
    .from('workout_templates')
    .select('id, name, exercises')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error || !templates?.length) return null

  const normalized = templateName.toLowerCase().trim()

  // Exact match
  const exactMatch = templates.find((t) => t.name.toLowerCase() === normalized)
  if (exactMatch) return exactMatch

  // Partial match
  const partialMatch = templates.find((t) => t.name.toLowerCase().includes(normalized))
  return partialMatch || null
}

// ============================================================================
// HABIT COMPLETION STATS
// ============================================================================

/**
 * Compute completion stats for a user on a given date.
 */
export async function computeCompletionStats(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<{ total: number; completed: number; percentage: number }> {
  const [habitsResult, completionsResult] = await Promise.all([
    supabase
      .from('habits')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true),
    supabase
      .from('habit_completions')
      .select('completion_percentage')
      .eq('user_id', userId)
      .eq('completion_date', date),
  ])

  const total = habitsResult.count || 0
  const completions = completionsResult.data || []
  const completed = completions.filter((c) => c.completion_percentage === 100).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, percentage }
}
