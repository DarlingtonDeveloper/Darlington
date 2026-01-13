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
  const date = searchParams.get('date') || new Date().toLocaleDateString('en-CA')

  const { data, error } = await supabase
    .from('diet_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('entry_date', date)
    .maybeSingle()

  if (error) {
    console.error('Error fetching diet entry:', error)
    return NextResponse.json({ error: 'Failed to fetch diet entry' }, { status: 500 })
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
  const { date, ...signals } = body

  const entryDate = date || new Date().toLocaleDateString('en-CA')

  const { data, error } = await supabase
    .from('diet_entries')
    .upsert(
      {
        user_id: user.id,
        entry_date: entryDate,
        ...signals,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,entry_date' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error saving diet entry:', error)
    return NextResponse.json({ error: 'Failed to save diet entry' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
