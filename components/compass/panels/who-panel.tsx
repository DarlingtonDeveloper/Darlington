'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { PanelWrapper } from './panel-wrapper'
import { ExternalLink } from 'lucide-react'

const TRAJECTORY = [
  { year: '2025', role: 'Lead Backend Engineer', company: 'Cox Automotive', desc: 'Serverless remittance. EventBridge, Lambda, Open Banking, SEPA. Introduced Claude AI agents with MCP tools across microservices.', current: true },
  { year: '2022', role: 'Senior Backend Engineer', company: 'Finova', desc: '.NET 9, GraphQL, CosmosDB. Led 8 developers across four contract-driven microservices. Reduced production incidents 85%.', current: false },
  { year: '2021', role: 'Cloud Platform Engineer', company: 'BNY Mellon', desc: 'Cross-cloud Kubernetes on Azure & AWS. Python LLM chatbot. Go observability tooling. Terraform IaC — onboarding from 2 weeks to 2 days.', current: false },
  { year: '2020', role: 'Cloud Software Engineer', company: 'Cloud Design Box', desc: 'GPT-3 tutor chatbot serving 1M+ students. Real-time collaborative whiteboard. <100ms sync nationwide.', current: false },
  { year: '2018', role: 'Full-Stack Developer', company: 'LabLogic Systems', desc: 'ISO 9001-compliant nuclear medicine backend. C#, SQL Server. Systems can be life-critical.', current: false },
  { year: '2015', role: 'BSc Computer Science (First Class)', company: 'Hull University', desc: 'Machine vision weather prediction. Natural language to C compiler.', current: false },
]

const LIVE_SITES = [
  { name: 'Aeroknite', tech: ['React', 'Next.js'], href: 'https://aeroknite.com', image: '/aa.png' },
  { name: 'Psychedelics Anonymous', tech: ['React', 'Web3'], href: 'https://psychedelicsanonymous.com', image: '/PA.jpg' },
  { name: 'PsyPay', tech: ['React', 'Solidity', 'Web3.js'], href: 'https://psypay.xyz', image: '/PP.png' },
]

const REPOS = [
  { name: 'MissionControl', lang: 'Go', href: 'https://github.com/DarlingtonDeveloper/MissionControl' },
  { name: 'MindMap', lang: 'TypeScript', href: 'https://github.com/DarlingtonDeveloper/MindMap' },
  { name: 'ArchAngel', lang: 'Go', href: 'https://github.com/DarlingtonDeveloper/ArchAngel' },
  { name: 'Sprout', lang: 'TypeScript', href: 'https://github.com/DarlingtonDeveloper/Sprout' },
  { name: 'EIII', lang: 'TypeScript', href: 'https://github.com/DarlingtonDeveloper/EIII' },
  { name: 'TelexistenceAPI', lang: '.NET', href: 'https://github.com/DarlingtonDeveloper/TelexistenceAPI' },
  { name: 'Arise', lang: 'TypeScript', href: 'https://github.com/DarlingtonDeveloper/Arise' },
  { name: 'fraud-detection-system', lang: 'TypeScript', href: 'https://github.com/DarlingtonDeveloper/fraud-detection-system' },
  { name: 'resume-optimization-crew', lang: 'Python', href: 'https://github.com/DarlingtonDeveloper/resume-optimization-crew' },
  { name: 'oru-backend', lang: 'TypeScript', href: 'https://github.com/DarlingtonDeveloper/oru-backend' },
  { name: 'type-persona-link', lang: 'TypeScript', href: 'https://github.com/DarlingtonDeveloper/type-persona-link' },
  { name: 'ConnectFourRL', lang: 'Python', href: 'https://github.com/DarlingtonDeveloper/ConnectFourRL' },
  { name: 'VARCalculator', lang: 'Python', href: 'https://github.com/DarlingtonDeveloper/VARCalculator' },
  { name: 'Technical_Analysis_Plotter', lang: 'Python', href: 'https://github.com/DarlingtonDeveloper/Technical_Analysis_Plotter' },
  { name: 'Twitter-Keyword-Tracker', lang: 'Python', href: 'https://github.com/DarlingtonDeveloper/Twitter-Keyword-Tracker' },
  { name: 'Discord-Activity-Bot', lang: 'Python', href: 'https://github.com/DarlingtonDeveloper/Discord-Activity-Bot' },
  { name: 'PageLoadTimeExtension', lang: 'TypeScript', href: 'https://github.com/DarlingtonDeveloper/PageLoadTimeExtension' },
]

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  Python: '#3572A5',
  Go: '#00ADD8',
  '.NET': '#512BD4',
}

const FILTERS = ['All', 'TypeScript', 'Python', 'Go', '.NET'] as const

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export function WhoPanel() {
  const [langFilter, setLangFilter] = useState<string>('All')

  const filteredRepos = langFilter === 'All'
    ? REPOS
    : REPOS.filter(r => r.lang === langFilter)

  return (
    <PanelWrapper direction="left" noScroll>
      <motion.div
        className="h-full flex flex-col pt-16 md:pt-12"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Bio — full width, fixed */}
        <motion.div className="space-y-3 shrink-0" variants={fadeUp}>
          <h2 className="font-display text-2xl md:text-3xl font-light text-[var(--fg)]">
            29. London. Backend engineer turned{' '}
            <em className="text-[var(--accent)]">agent architect</em>.
          </h2>
          <p className="text-[14px] leading-relaxed text-[var(--fg2)] max-w-[600px]">
            Lead Backend Engineer designing cloud-native architectures, event-driven microservices,
            and scalable platforms across Azure and AWS. Polyglot developer — C#, Go, Python, Java, Rust.{' '}
            <a
              href="#"
              className="text-[var(--accent)] hover:underline underline-offset-4 font-mono text-[13px]"
            >
              Full CV →
            </a>
          </p>
        </motion.div>

        {/* Two-column content area — fills remaining height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 min-h-0 flex-1">
          {/* Left column — Trajectory (fixed, not scrollable) */}
          <motion.div className="space-y-0 overflow-hidden" variants={stagger}>
            <motion.h3
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--fg2)] mb-4"
              variants={fadeUp}
            >
              Trajectory
            </motion.h3>
            {TRAJECTORY.map((entry) => (
              <motion.div
                key={entry.year}
                className={`relative pl-4 pb-4 border-l-[1.5px] ${entry.current ? 'border-[var(--accent)]' : 'border-white/10'}`}
                variants={fadeUp}
              >
                <span className="font-mono text-[12px] text-[var(--accent)] tabular-nums">
                  {entry.year}
                </span>
                <p className="text-[14px] font-medium text-[var(--fg)]">
                  {entry.role}{' '}
                  <span className="text-[var(--fg2)]">@ {entry.company}</span>
                </p>
                <p className="text-[12px] text-[var(--fg2)]">{entry.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Right column — Projects (source list scrollable) */}
          <motion.div className="flex flex-col min-h-0" variants={stagger}>
            {/* Live Sites — fixed */}
            <div className="shrink-0">
              <motion.h3
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--fg2)] mb-3"
                variants={fadeUp}
              >
                Live Sites
              </motion.h3>
              <div className="space-y-2">
                {LIVE_SITES.map((site) => (
                  <motion.a
                    key={site.name}
                    href={site.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block p-3 rounded-lg border border-white/5 hover:border-white/10
                               bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 overflow-hidden"
                    variants={fadeUp}
                  >
                    {/* Hover preview image */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
                      <Image
                        src={site.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                    </div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-medium text-[var(--fg)]">{site.name}</p>
                        <div className="flex gap-1.5 mt-1">
                          {site.tech.map(t => (
                            <span key={t} className="font-mono text-[10px] text-[var(--fg2)] bg-white/5 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[12px] font-mono text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Visit <ExternalLink size={12} />
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Source / GitHub repos — scrollable */}
            <div className="flex flex-col min-h-0 flex-1 mt-6">
              <motion.h3
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--fg2)] mb-3 shrink-0"
                variants={fadeUp}
              >
                Source
              </motion.h3>
              {/* Language filters */}
              <motion.div className="flex gap-1.5 mb-3 shrink-0" variants={fadeUp}>
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setLangFilter(f)}
                    className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border transition-all duration-150
                      ${langFilter === f
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-white/10 text-[var(--fg2)] hover:border-white/20'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </motion.div>
              <div className="overflow-y-auto no-scrollbar flex-1 min-h-0 space-y-0.5">
                {filteredRepos.map((repo) => (
                  <motion.a
                    key={repo.name}
                    href={repo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between py-2 px-2 -mx-2 rounded hover:bg-white/[0.03] transition-colors"
                    variants={fadeUp}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: LANG_COLORS[repo.lang] }}
                      />
                      <span className="text-[13px] text-[var(--fg)]">{repo.name}</span>
                      <span className="font-mono text-[10px] text-[var(--fg2)]">{repo.lang}</span>
                    </div>
                    <span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                      →
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PanelWrapper>
  )
}
