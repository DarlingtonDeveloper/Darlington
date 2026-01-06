import { supabase } from '@/lib/supabase'
import { AnalyticsClient } from './analytics-client'
import type { HabitStreak, WeeklyStat, CompletionTimePattern } from '@/types/database'

export const dynamic = 'force-dynamic'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

interface AnalyticsData {
    streaks: HabitStreak[]
    weeklyStats: WeeklyStat[]
    timePatterns: CompletionTimePattern[]
    totalCompletions: number
}

async function loadAnalytics(): Promise<AnalyticsData> {
    try {
        // Fetch all analytics data in parallel
        const [streaksRes, weeklyRes, patternsRes, completionsRes] = await Promise.all([
            supabase
                .from('habit_streaks')
                .select('*'),
            supabase
                .from('weekly_stats')
                .select('*')
                .order('week_start', { ascending: false })
                .limit(56), // 8 weeks * 7 habits max shown
            supabase
                .from('completion_time_patterns')
                .select('*'),
            supabase
                .from('habit_completions')
                .select('id', { count: 'exact' })
                .eq('user_id', USER_ID),
        ])

        if (streaksRes.error) console.error('Streaks error:', streaksRes.error)
        if (weeklyRes.error) console.error('Weekly error:', weeklyRes.error)
        if (patternsRes.error) console.error('Patterns error:', patternsRes.error)

        return {
            streaks: (streaksRes.data || []) as HabitStreak[],
            weeklyStats: (weeklyRes.data || []) as WeeklyStat[],
            timePatterns: (patternsRes.data || []) as CompletionTimePattern[],
            totalCompletions: completionsRes.count || 0,
        }
    } catch (error) {
        console.error('Error loading analytics:', error)
        return {
            streaks: [],
            weeklyStats: [],
            timePatterns: [],
            totalCompletions: 0,
        }
    }
}

export default async function AnalyticsPage() {
    const data = await loadAnalytics()

    return <AnalyticsClient {...data} />
}
