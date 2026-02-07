'use client'

import { motion } from 'framer-motion'
import { PanelWrapper } from './panel-wrapper'
import { ExternalLink } from 'lucide-react'

const BLOG_POSTS = [
  {
    title: 'Building Autonomous Agents with Go',
    tag: 'Engineering',
    href: 'https://frtr.hashnode.dev/',
  },
  {
    title: 'Why I Built My Own Personal OS',
    tag: 'Systems',
    href: 'https://frtr.hashnode.dev/',
  },
  {
    title: 'From Payments to Pipelines',
    tag: 'Career',
    href: 'https://frtr.hashnode.dev/',
  },
]

const SHIP_LOG = [
  { time: '2025-06-04 02:14', msg: 'compass: redesign shipped to production' },
  { time: '2025-06-03 18:30', msg: 'health: added screen time tracking webhook' },
  { time: '2025-06-02 11:45', msg: 'habits: health-linked auto-complete live' },
  { time: '2025-06-01 09:20', msg: 'calendar: google calendar sync operational' },
  { time: '2025-05-30 22:10', msg: 'hanzi: spaced repetition engine deployed' },
  { time: '2025-05-28 14:55', msg: 'finance: weekly spending summary added' },
]

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export function HowPanel() {
  return (
    <PanelWrapper direction="right">
      <motion.div
        className="max-w-[560px] ml-auto space-y-8 pt-16 md:pt-12"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Writing section */}
        <div>
          <motion.h3
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--fg2)] mb-4"
            variants={fadeUp}
          >
            Writing
          </motion.h3>
          <div className="space-y-3">
            {BLOG_POSTS.map((post) => (
              <motion.a
                key={post.title}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 rounded-lg border border-white/5 hover:border-white/10
                           bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                variants={fadeUp}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-display text-lg md:text-xl font-light text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                      {post.title}
                    </h4>
                    <span className="inline-block mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--fg2)] bg-white/5 px-2 py-0.5 rounded">
                      {post.tag}
                    </span>
                  </div>
                  <span className="text-[12px] font-mono text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 mt-1">
                    Read <ExternalLink size={12} />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <motion.div className="border-t border-white/5" variants={fadeUp} />

        {/* Ship Log */}
        <div>
          <motion.div
            className="font-mono text-[12px] text-[var(--fg2)] mb-3 flex items-center gap-1"
            variants={fadeUp}
          >
            <span className="text-[var(--status-green)]">$</span>{' '}
            <span>kai@darlington ~ $ cat ship.log</span>
            <span className="inline-block w-[6px] h-[14px] bg-[var(--status-green)] ml-0.5 animate-pulse" />
          </motion.div>
          <div className="space-y-1">
            {SHIP_LOG.map((entry) => (
              <motion.div
                key={entry.time}
                className="font-mono text-[11px] leading-relaxed"
                variants={fadeUp}
              >
                <span className="text-[var(--fg2)] tabular-nums">[{entry.time}]</span>{' '}
                <span className="text-[var(--status-green)]">{entry.msg}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </PanelWrapper>
  )
}
