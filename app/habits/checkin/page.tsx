import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckinClient } from './checkin-client'
import { format, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

interface YesterdayData {
    completionRate: number
    completedCount: number
    totalHabits: number
    missedHabits: { id: string; name: string; category: string }[]
    notesFromYesterday: { habitName: string; note: string }[]
}

interface HabitWithStats {
    id: string
    name: string
    category: string | null
    completionRate7d: number
    missedYesterday: boolean
}

async function getYesterdayData(userId: string): Promise<YesterdayData> {
    const supabase = await createClient()
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    // Get all habits
    const { data: habits } = await supabase
        .from('habits')
        .select('id, name, category')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('display_order')

    // Get yesterday's completions
    const { data: completions } = await supabase
        .from('habit_completions')
        .select('habit_id, completion_percentage, notes')
        .eq('user_id', userId)
        .eq('completion_date', yesterday)

    const completedIds = new Set(completions?.map(c => c.habit_id) || [])
    const missedHabits = (habits || [])
        .filter(h => !completedIds.has(h.id))
        .map(h => ({ id: h.id, name: h.name, category: h.category || 'uncategorized' }))

    // Collect notes from yesterday
    const notesFromYesterday = (completions || [])
        .filter(c => c.notes)
        .map(c => {
            const habit = habits?.find(h => h.id === c.habit_id)
            return { habitName: habit?.name || 'Unknown', note: c.notes! }
        })

    const totalHabits = habits?.length || 0
    const completedCount = completions?.length || 0
    const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0

    return {
        completionRate,
        completedCount,
        totalHabits,
        missedHabits,
        notesFromYesterday,
    }
}

async function getHabitsWithStats(userId: string): Promise<HabitWithStats[]> {
    const supabase = await createClient()
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

    // Get all habits
    const { data: habits } = await supabase
        .from('habits')
        .select('id, name, category')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('display_order')

    // Get last 7 days of completions
    const { data: completions } = await supabase
        .from('habit_completions')
        .select('habit_id, completion_date')
        .eq('user_id', userId)
        .gte('completion_date', weekAgo)
        .lte('completion_date', yesterday)

    // Get yesterday's completions for missed check
    const { data: yesterdayCompletions } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', userId)
        .eq('completion_date', yesterday)

    const yesterdayIds = new Set(yesterdayCompletions?.map(c => c.habit_id) || [])

    // Calculate 7-day completion rate per habit
    const completionsByHabit = new Map<string, number>()
    completions?.forEach(c => {
        const count = completionsByHabit.get(c.habit_id) || 0
        completionsByHabit.set(c.habit_id, count + 1)
    })

    return (habits || []).map(h => ({
        id: h.id,
        name: h.name,
        category: h.category,
        completionRate7d: Math.round(((completionsByHabit.get(h.id) || 0) / 7) * 100),
        missedYesterday: !yesterdayIds.has(h.id),
    }))
}

async function getTodayCheckin(userId: string) {
    const supabase = await createClient()
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .single()

    return data
}

export default async function CheckinPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const serverToday = format(new Date(), 'yyyy-MM-dd')

    const [yesterdayData, existingCheckin, habitsWithStats] = await Promise.all([
        getYesterdayData(user.id),
        getTodayCheckin(user.id),
        getHabitsWithStats(user.id),
    ])

    return (
        <CheckinClient
            yesterdayData={yesterdayData}
            existingCheckin={existingCheckin}
            habitsWithStats={habitsWithStats}
            serverDate={serverToday}
            userId={user.id}
        />
    )
}
