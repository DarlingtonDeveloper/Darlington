'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-safe pt-safe bg-black">
      <div className="w-full max-w-[340px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-neutral-900 border border-neutral-800/60 mb-4">
            <svg
              className="size-6 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-5">
          {/* OAuth buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2.5
                         bg-neutral-800/50 hover:bg-neutral-800 active:bg-neutral-700/50
                         border border-neutral-700/50 rounded-md text-[13px] font-medium text-neutral-200
                         transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2.5
                         bg-neutral-800/50 hover:bg-neutral-800 active:bg-neutral-700/50
                         border border-neutral-700/50 rounded-md text-[13px] font-medium text-neutral-200
                         transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-600 bg-neutral-900/50">
                or
              </span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-md bg-red-950/30 border border-red-900/50">
                <svg
                  className="size-4 text-red-400 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <p className="text-[12px] text-red-300 leading-snug">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full h-10 px-3 bg-neutral-800/50 border border-neutral-700/50 rounded-md
                           text-[13px] text-neutral-200 placeholder-neutral-600
                           focus:outline-none focus:border-neutral-600 focus:bg-neutral-800/70
                           transition-colors duration-150"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full h-10 px-3 bg-neutral-800/50 border border-neutral-700/50 rounded-md
                           text-[13px] text-neutral-200 placeholder-neutral-600
                           focus:outline-none focus:border-neutral-600 focus:bg-neutral-800/70
                           transition-colors duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-600
                         rounded-md text-[13px] font-medium text-white
                         transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none
                         flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="size-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[13px] text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
