'use client'

import { useState, useEffect } from 'react'

const TARGET = new Date('2027-01-01T00:00:00').getTime()
const YEAR_START = new Date('2026-01-01T00:00:00').getTime()
const YEAR_END = TARGET

function getTimeLeft() {
  const now = Date.now()
  const diff = Math.max(0, TARGET - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  const yearProgress = Math.min(1, Math.max(0, (now - YEAR_START) / (YEAR_END - YEAR_START)))
  return { days, hours, minutes, seconds, yearProgress }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function CountdownTimer() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null)

  useEffect(() => {
    setTime(getTimeLeft())
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="font-mono text-[13px] tabular-nums tracking-wide text-[var(--fg)] opacity-0">
          000:00:00:00
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className="font-mono text-[1.3rem] tabular-nums tracking-wide text-[var(--fg)]"
        style={{ textShadow: '0 0 12px var(--accent)' }}
      >
        <span>{String(time.days).padStart(3, '0')}</span>
        <span className="text-[var(--fg2)] mx-0.5">:</span>
        <span>{pad(time.hours)}</span>
        <span className="text-[var(--fg2)] mx-0.5">:</span>
        <span>{pad(time.minutes)}</span>
        <span className="text-[var(--fg2)] mx-0.5">:</span>
        <span>{pad(time.seconds)}</span>
      </div>
      <div className="w-20 h-[2px] bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-1000"
          style={{
            width: `${time.yearProgress * 100}%`,
            boxShadow: '0 0 6px var(--accent)',
          }}
        />
      </div>
      <span className="font-mono text-[0.8rem] tracking-[0.2em] text-[var(--fg2)] uppercase">
        Until 2027.
      </span>
    </div>
  )
}
