const CACHE_KEY = 'habits_cache'
const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes - after this, force refresh in background

interface HabitStep {
  id: string
  habit_id: string
  name: string
  display_order: number
  duration_seconds: number | null
  description: string | null
}

interface CachedHabit {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string | null
  target_frequency: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  completed_today: boolean
  completion_id?: string
  completed_at?: string
  completion_percentage?: number
  notes?: string | null
  steps?: HabitStep[]
  completedStepIds?: string[]
}

interface HabitsCache {
  habits: CachedHabit[]
  date: string
  hasCheckedInToday: boolean
  focusHabitIds: string[]
  timestamp: number
}

export function getCachedHabits(): HabitsCache | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const data: HabitsCache = JSON.parse(cached)
    const today = new Date().toLocaleDateString('en-CA')

    // Invalidate cache if it's from a different day
    if (data.date !== today) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return data
  } catch {
    return null
  }
}

export function setCachedHabits(
  habits: CachedHabit[],
  date: string,
  hasCheckedInToday: boolean,
  focusHabitIds: string[]
): void {
  if (typeof window === 'undefined') return

  try {
    const cache: HabitsCache = {
      habits,
      date,
      hasCheckedInToday,
      focusHabitIds,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage might be full or unavailable
  }
}

export function isCacheStale(cache: HabitsCache): boolean {
  return Date.now() - cache.timestamp > CACHE_EXPIRY_MS
}

export function clearHabitsCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CACHE_KEY)
}
