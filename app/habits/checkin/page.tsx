import { supabase } from '@/lib/supabase'
import { CheckinClient } from './checkin-client'
import { format, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

interface YesterdayData {
    completions: {
        habit_id: string
        habit_name: string
        category: string
        completion_percentage: number
        notes: string | null
    }[]
    totalHabits: number
    completedCount: number
    missedHabits: { id: string; name: string; category: string }[]
}

async function getYesterdayData(): Promise<YesterdayData> {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    // Get all habits
    const { data: habits } = await supabase
        .from('habits')
        .select('id, name, category')
        .eq('user_id', USER_ID)
        .eq('is_active', true)
        .order('display_order')

    // Get yesterday's completions
    const { data: completions } = await supabase
        .from('habit_completions')
        .select('habit_id, completion_percentage, notes')
        .eq('user_id', USER_ID)
        .eq('completion_date', yesterday)

    const habitsWithNames = (completions || []).map(c => {
        const habit = habits?.find(h => h.id === c.habit_id)
        return {
            habit_id: c.habit_id,
            habit_name: habit?.name || 'Unknown',
            category: habit?.category || 'uncategorized',
            completion_percentage: c.completion_percentage ?? 100,
            notes: c.notes,
        }
    })

    const completedIds = new Set(completions?.map(c => c.habit_id) || [])
    const missedHabits = (habits || [])
        .filter(h => !completedIds.has(h.id))
        .map(h => ({ id: h.id, name: h.name, category: h.category || 'uncategorized' }))

    return {
        completions: habitsWithNames,
        totalHabits: habits?.length || 0,
        completedCount: completions?.length || 0,
        missedHabits,
    }
}

async function getTodayCheckin() {
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', USER_ID)
        .eq('checkin_date', today)
        .single()

    return data
}

async function getAllHabits() {
    const { data } = await supabase
        .from('habits')
        .select('id, name, category')
        .eq('user_id', USER_ID)
        .eq('is_active', true)
        .order('display_order')

    return data || []
}

export default async function CheckinPage() {
    const [yesterdayData, existingCheckin, allHabits] = await Promise.all([
        getYesterdayData(),
        getTodayCheckin(),
        getAllHabits(),
    ])

    return (
        <CheckinClient
            yesterdayData={yesterdayData}
            existingCheckin={existingCheckin}
            allHabits={allHabits}
        />
    )
}
