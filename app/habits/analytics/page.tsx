import { supabase } from '@/lib/supabase'
import { AnalyticsClient } from './analytics-client'
import type { HabitStreak, WeeklyStat, CompletionTimePattern, DailyCompletionRate, PersonalRecords } from '@/types/database'

export const dynamic = 'force-dynamic'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

interface AnalyticsData {
    streaks: HabitStreak[]
    weeklyStats: WeeklyStat[]
    timePatterns: CompletionTimePattern[]
    totalCompletions: number
    // New data for enhanced Overview
    dailyRates: DailyCompletionRate[]
    personalRecords: PersonalRecords | null
    todayCompletedHabitIds: string[]
    totalActiveHabits: number
}

async function loadAnalytics(): Promise<AnalyticsData> {
    const today = new Date().toISOString().split('T')[0]

    try {
        // Fetch all analytics data in parallel
        const [
            streaksRes,
            weeklyRes,
            patternsRes,
            completionsRes,
            dailyRatesRes,
            personalRecordsRes,
            todayCompletionsRes,
            activeHabitsRes,
        ] = await Promise.all([
            // Existing queries
            supabase
                .from('habit_streaks')
                .select('*'),
            supabase
                .from('weekly_stats')
                .select('*')
                .order('week_start', { ascending: false })
                .limit(56),
            supabase
                .from('completion_time_patterns')
                .select('*'),
            supabase
                .from('habit_completions')
                .select('id', { count: 'exact' })
                .eq('user_id', USER_ID),
            // New queries for enhanced Overview
            supabase
                .from('daily_completion_rates')
                .select('*')
                .order('completion_date', { ascending: false })
                .limit(30),
            supabase
                .from('personal_records')
                .select('*')
                .single(),
            supabase
                .from('habit_completions')
                .select('habit_id')
                .eq('user_id', USER_ID)
                .eq('completion_date', today),
            supabase
                .from('habits')
                .select('id', { count: 'exact' })
                .eq('user_id', USER_ID)
                .eq('is_active', true),
        ])

        if (streaksRes.error) console.error('Streaks error:', streaksRes.error)
        if (weeklyRes.error) console.error('Weekly error:', weeklyRes.error)
        if (patternsRes.error) console.error('Patterns error:', patternsRes.error)
        // Don't log errors for new views that may not exist yet
        if (dailyRatesRes.error && !dailyRatesRes.error.message.includes('does not exist')) {
            console.error('Daily rates error:', dailyRatesRes.error)
        }
        if (personalRecordsRes.error && !personalRecordsRes.error.message.includes('does not exist')) {
            console.error('Personal records error:', personalRecordsRes.error)
        }

        const todayCompletedIds = (todayCompletionsRes.data || []).map(c => c.habit_id)

        return {
            streaks: (streaksRes.data || []) as HabitStreak[],
            weeklyStats: (weeklyRes.data || []) as WeeklyStat[],
            timePatterns: (patternsRes.data || []) as CompletionTimePattern[],
            totalCompletions: completionsRes.count || 0,
            dailyRates: (dailyRatesRes.data || []) as DailyCompletionRate[],
            personalRecords: personalRecordsRes.data as PersonalRecords | null,
            todayCompletedHabitIds: todayCompletedIds,
            totalActiveHabits: activeHabitsRes.count || 0,
        }
    } catch (error) {
        console.error('Error loading analytics:', error)
        return {
            streaks: [],
            weeklyStats: [],
            timePatterns: [],
            totalCompletions: 0,
            dailyRates: [],
            personalRecords: null,
            todayCompletedHabitIds: [],
            totalActiveHabits: 0,
        }
    }
}

export default async function AnalyticsPage() {
    const data = await loadAnalytics()

    return <AnalyticsClient {...data} />
}
