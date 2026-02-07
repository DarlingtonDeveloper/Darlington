'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCompass } from '@/contexts/compass-context'
import { PanelWrapper } from './panel-wrapper'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}

type Step = 'email' | 'login' | 'contact'

export function WhyPanel() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contactSent, setContactSent] = useState(false)
  const router = useRouter()
  const { closePanel } = useCompass()
  const supabase = createClient()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const { exists } = await res.json()

      setIsLoading(false)
      if (exists) {
        setStep('login')
      } else {
        setStep('contact')
      }
    } catch {
      setIsLoading(false)
      setStep('contact')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      closePanel()
      router.refresh()
    }
  }

  const handleOAuth = async () => {
    setIsLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/`,
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Hello from ${contactName || email}`)
    const body = encodeURIComponent(`From: ${contactName}\nEmail: ${email}\n\n${contactMessage}`)
    window.location.href = `mailto:hello@darlington.dev?subject=${subject}&body=${body}`
    setContactSent(true)
  }

  return (
    <PanelWrapper direction="zoom-in">
      <motion.div
        className="w-full max-w-[360px] mx-auto px-4 pt-[55vh]"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {step === 'email' && (
          <>
            <motion.h2
              className="font-display text-3xl md:text-4xl font-light text-[var(--fg)] text-center mb-2"
              variants={fadeUp}
            >
              Reach out.
            </motion.h2>
            <motion.p
              className="text-[13px] text-[var(--fg2)] text-center mb-6"
              variants={fadeUp}
            >
              Or log in.
            </motion.p>

            <motion.form onSubmit={handleEmailSubmit} className="space-y-3" variants={fadeUp}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                autoFocus
                className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-lg
                           text-[14px] text-[var(--fg)] placeholder:text-[var(--fg2)]
                           focus:outline-none focus:border-[var(--accent)] transition-colors duration-200
                           font-sans"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[var(--accent)] hover:bg-[var(--accent2)] text-[var(--bg)]
                           rounded-lg text-[13px] font-medium transition-all duration-150
                           disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </button>
            </motion.form>

            {/* Divider */}
            <motion.div className="relative my-5" variants={fadeUp}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 font-mono text-[10px] uppercase tracking-wider text-[var(--fg2)] bg-[var(--bg)]">
                  or
                </span>
              </div>
            </motion.div>

            {/* Google OAuth */}
            <motion.button
              onClick={handleOAuth}
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2.5
                         bg-white/[0.03] hover:bg-white/[0.06] border border-white/10
                         rounded-lg text-[13px] font-medium text-[var(--fg)]
                         transition-all duration-150 disabled:opacity-50"
              variants={fadeUp}
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </motion.button>
          </>
        )}

        {step === 'login' && (
          <>
            <motion.h2
              className="font-display text-3xl font-light text-[var(--fg)] text-center mb-2"
              variants={fadeUp}
            >
              Welcome back.
            </motion.h2>
            <motion.p
              className="text-[13px] text-[var(--fg2)] text-center mb-6 font-mono"
              variants={fadeUp}
            >
              {email}
            </motion.p>

            {error && (
              <motion.div
                className="mb-3 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-[12px] text-red-300"
                variants={fadeUp}
              >
                {error}
              </motion.div>
            )}

            <motion.form onSubmit={handleLogin} className="space-y-3" variants={fadeUp}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
                autoFocus
                className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-lg
                           text-[14px] text-[var(--fg)] placeholder:text-[var(--fg2)]
                           focus:outline-none focus:border-[var(--accent)] transition-colors duration-200
                           font-sans"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[var(--accent)] hover:bg-[var(--accent2)] text-[var(--bg)]
                           rounded-lg text-[13px] font-medium transition-all duration-150
                           disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="size-3.5 border-[1.5px] border-[var(--bg)]/30 border-t-[var(--bg)] rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </motion.form>

            <motion.button
              onClick={() => { setStep('email'); setError(null) }}
              className="mt-4 w-full text-center text-[12px] text-[var(--fg2)] hover:text-[var(--fg)] transition-colors"
              variants={fadeUp}
            >
              ← Back
            </motion.button>
          </>
        )}

        {step === 'contact' && (
          <>
            <motion.h2
              className="font-display text-3xl font-light text-[var(--fg)] text-center mb-2"
              variants={fadeUp}
            >
              {contactSent ? 'Sent.' : "I'll pass this along."}
            </motion.h2>
            <motion.p
              className="text-[13px] text-[var(--fg2)] text-center mb-6"
              variants={fadeUp}
            >
              {contactSent
                ? 'Thanks for reaching out.'
                : "That email isn't in my system. Want to get in touch?"}
            </motion.p>

            {!contactSent && (
              <motion.form onSubmit={handleContact} className="space-y-3" variants={fadeUp}>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                  required
                  autoFocus
                  className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-lg
                             text-[14px] text-[var(--fg)] placeholder:text-[var(--fg2)]
                             focus:outline-none focus:border-[var(--accent)] transition-colors duration-200
                             font-sans"
                />
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg
                             text-[14px] text-[var(--fg)] placeholder:text-[var(--fg2)]
                             focus:outline-none focus:border-[var(--accent)] transition-colors duration-200
                             font-sans resize-none"
                />
                <button
                  type="submit"
                  className="w-full h-11 bg-[var(--accent)] hover:bg-[var(--accent2)] text-[var(--bg)]
                             rounded-lg text-[13px] font-medium transition-all duration-150"
                >
                  Send →
                </button>
              </motion.form>
            )}

            <motion.button
              onClick={() => { setStep('email'); setError(null); setContactSent(false); setContactName(''); setContactMessage('') }}
              className="mt-4 w-full text-center text-[12px] text-[var(--fg2)] hover:text-[var(--fg)] transition-colors"
              variants={fadeUp}
            >
              ← Back
            </motion.button>
          </>
        )}
      </motion.div>
    </PanelWrapper>
  )
}
