import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ exists: false }, { status: 400 })
  }

  // Use admin API to list users filtered by email
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  })

  if (error) {
    return NextResponse.json({ exists: false })
  }

  const exists = data.users.some(u => u.email === email)

  // If not found in first page, do a targeted search
  if (!exists) {
    const { data: allData } = await supabaseAdmin.auth.admin.listUsers()
    const found = allData?.users?.some(u => u.email === email) ?? false
    return NextResponse.json({ exists: found })
  }

  return NextResponse.json({ exists })
}
