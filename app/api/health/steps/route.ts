import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { date, step_count } = body

  const entryDate = date || new Date().toLocaleDateString('en-CA')

  if (!step_count || step_count <= 0) {
    return NextResponse.json({ error: 'Invalid step count' }, { status: 400 })
  }

  // Get user's step target from settings (or use default)
  const { data: settings } = await supabase
    .from('health_settings')
    .select('steps_target')
    .eq('user_id', user.id)
    .single()

  const target = settings?.steps_target || 10000

  const { data, error } = await supabase
    .from('steps_entries')
    .upsert(
      {
        user_id: user.id,
        entry_date: entryDate,
        step_count,
        target,
        source: 'manual',
      },
      { onConflict: 'user_id,entry_date' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error saving steps entry:', error)
    return NextResponse.json({ error: 'Failed to save steps entry' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
