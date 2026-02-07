'use client'

import { motion } from 'framer-motion'
import { PanelWrapper } from './panel-wrapper'

const SYSTEMS = [
  {
    icon: '◈',
    name: 'MissionControl',
    desc: 'Distributed command layer for autonomous agents. Manages task orchestration, agent lifecycles, and real-time communication.',
    stack: ['Go', 'React', 'WebSocket', 'TypeScript'],
  },
  {
    icon: '◉',
    name: 'Kai',
    desc: 'Personal AI agent with memory, tool use, and multi-modal reasoning. Acts as the central intelligence for my systems.',
    stack: ['Python', 'Claude API', 'MCP'],
  },
  {
    icon: '◎',
    name: 'Personal OS',
    desc: 'Life infrastructure — habits, health, finance, calendar. All data flows through a single pane of glass.',
    stack: ['Next.js', 'Supabase', 'iOS Shortcuts', 'Vercel'],
  },
]

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function WhatPanel() {
  return (
    <PanelWrapper direction="zoom-out">
      <motion.div
        className="w-full max-w-[900px] mx-auto px-4 md:px-0"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.h3
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--fg2)] mb-6 text-center"
          variants={fadeUp}
        >
          Active Systems
        </motion.h3>

        {/* Grid: one top-centre, two bottom flanking */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {/* Top centre card — spans middle on desktop */}
          <motion.div className="md:col-start-2" variants={fadeUp}>
            <SystemCard system={SYSTEMS[0]} />
          </motion.div>
          {/* Bottom two cards */}
          <motion.div className="md:col-start-1 md:row-start-2" variants={fadeUp}>
            <SystemCard system={SYSTEMS[1]} />
          </motion.div>
          <motion.div className="md:col-start-3 md:row-start-2" variants={fadeUp}>
            <SystemCard system={SYSTEMS[2]} />
          </motion.div>
        </div>
      </motion.div>
    </PanelWrapper>
  )
}

function SystemCard({ system }: { system: typeof SYSTEMS[number] }) {
  return (
    <div className="relative group p-5 rounded-xl border border-white/5 hover:border-white/10
                    bg-[#07070e]/80 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl text-[var(--accent)]">{system.icon}</span>
        <div className="flex items-center gap-2">
          <h4 className="text-[15px] font-medium text-[var(--fg)]">{system.name}</h4>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--status-green)] bg-[var(--status-green)]/10 px-1.5 py-0.5 rounded-full">
            Active
          </span>
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-[var(--fg2)] mb-4">{system.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {system.stack.map(tech => (
          <span key={tech} className="font-mono text-[10px] text-[var(--fg2)] bg-white/5 px-2 py-0.5 rounded">
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}
