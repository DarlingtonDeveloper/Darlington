'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google') => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pb-safe pt-safe bg-black">
        <div className="w-full max-w-[340px] text-center">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-950/50 border border-emerald-900/50 mb-5">
            <svg
              className="size-7 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight mb-2">
            Check your email
          </h1>
          <p className="text-[13px] text-neutral-400 leading-relaxed mb-6">
            We sent a confirmation link to{' '}
            <span className="text-neutral-200 font-mono">{email}</span>.
            <br />
            Click the link to complete your signup.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to login
          </Link>
        </div>
      </div>
    )
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
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">
            Create an account
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Get started with your personal dashboard
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
          <form onSubmit={handleEmailSignup} className="space-y-3">
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
                minLength={6}
                autoComplete="new-password"
                className="w-full h-10 px-3 bg-neutral-800/50 border border-neutral-700/50 rounded-md
                           text-[13px] text-neutral-200 placeholder-neutral-600
                           focus:outline-none focus:border-neutral-600 focus:bg-neutral-800/70
                           transition-colors duration-150"
              />
              <p className="text-[11px] text-neutral-600">Minimum 6 characters</p>
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
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[13px] text-neutral-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
