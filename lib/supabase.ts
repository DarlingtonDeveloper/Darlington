import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Create a single supabase client for interacting with your database
// Not using Database type - causes TypeScript inference issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side use with service role key (bypasses RLS)
// Only available on server-side (not in browser)
export const supabaseAdmin =
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    : null