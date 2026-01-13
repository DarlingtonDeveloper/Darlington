import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')

  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(days)

  if (error) {
    console.error('Error fetching weight entries:', error)
    return NextResponse.json({ error: 'Failed to fetch weight entries' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  let { weight_kg } = body
  const { notes } = body

  // Support pounds input - convert to kg
  if (body.weight_lbs) {
    weight_kg = body.weight_lbs * 0.453592
  }

  if (!weight_kg || weight_kg <= 0) {
    return NextResponse.json({ error: 'Invalid weight value' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('weight_entries')
    .insert({
      user_id: user.id,
      weight_kg: Math.round(weight_kg * 100) / 100, // Round to 2 decimal places
      notes,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving weight entry:', error)
    return NextResponse.json({ error: 'Failed to save weight entry' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
