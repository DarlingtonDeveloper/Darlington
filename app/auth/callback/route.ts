import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/habits'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    // Store Google OAuth tokens for Calendar API access
    if (!error && data.session?.provider_token) {
      const { user, session } = data

      await supabase.from('user_oauth_tokens').upsert({
        user_id: user.id,
        provider: 'google',
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token || null,
        expires_at: session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : null,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`)
}
