"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { PanelWrapper } from "./panel-wrapper";

const MODULES = [
  "Habits",
  "Health",
  "Finance",
  "Calendar",
  "Hanzi",
  "Goals",
  "Tasks",
  "Ship Log",
  "Cron",
  "Activity",
];

const SYSTEMS = [
  {
    icon: "⚡",
    name: "The Swarm",
    desc: "Coordinated AI agent network led by Kai, built on OpenClaw (open-source contributor). Warren (reverse proxy + lifecycle), Alexandria (knowledge + secrets), PromptForge (prompt VCS), Dispatch (task broker), Chronicle (observability), DLQ (dead letter recovery). Kai orchestrates via web, WhatsApp, and Slack with device-bound identity and persistent memory.",
    stack: ["Go", "Python", "Docker Swarm", "NATS", "OpenClaw"],
  },
  {
    icon: "🧠",
    name: "Cortex",
    desc: "Embedded graph memory engine for AI agents. Typed knowledge nodes, HNSW vector similarity, auto-linking via embeddings, decay of unused knowledge. One crate, one SQLite file, zero dependencies. Won the Imperial College CEOClaw hackathon. Powers judge-intel (MCP server) and the Cede agent framework.",
    stack: ["Rust", "SQLite", "HNSW"],
    href: "https://github.com/MikeSquared-Agency/cortex",
    award: "Imperial CEOClaw Winner",
  },
  {
    icon: "◈",
    name: "MissionControl",
    desc: "10-stage agentic workflow engine. Discovery → Plan → Design → Implement → Verify → Validate → Release → Retro → Maintain → Archive. Worker fleet management, checkpoint/restore, audit trail. DutyBound is its chat-first frontend.",
    stack: ["Go", "WebSocket", "React"],
    href: "https://github.com/MikeSquared-Agency/MissionControl",
  },
  {
    icon: "📊",
    name: "PolyBans",
    desc: "Real-time prediction market arbitrage using Meta Ray-Bans smart glasses. Live video + audio transcription streamed through a relay server to Mistral AI for Polymarket opportunity detection. 1st Place for Best Use of Data at the MistralAI × Jump Trading hackathon.",
    stack: ["TypeScript", "Swift", "Mistral AI", "Next.js", "WebSocket"],
    href: "https://github.com/JerryWu0430/PolyBans",
    award: "1st Place — MistralAI × Jump Trading",
  },
  {
    icon: "👓",
    name: "OpenGlass",
    desc: "Real-time AI-powered smart glasses interface. Meta Ray-Bans connected to Gemini Live and OpenClaw for always-on visual understanding, voice interaction, and agentic task execution from a native Swift app.",
    stack: ["Swift", "Gemini Live", "OpenClaw", "AVFoundation"],
    href: "https://github.com/DarlingtonDeveloper/OpenGlass",
  },
  {
    icon: "◎",
    name: "darlington.dev",
    desc: "Life operating system — 10 modules sharing one database, one auth system, one design language. Habits, Health (iOS Shortcuts automation), Finance (auto-categorisation), Calendar (Google API), Hanzi (Mandarin SRS), Goals, Tasks, Ship Log, and more.",
    stack: ["Next.js 16", "React 19", "Supabase", "Vercel"],
  },
];

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* The Swarm — full width hero card */}
          <motion.div className="md:col-span-2" variants={fadeUp}>
            <SystemCard system={SYSTEMS[0]} featured />
          </motion.div>

          {/* Cortex + MissionControl */}
          <motion.div variants={fadeUp}>
            <SystemCard system={SYSTEMS[1]} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <SystemCard system={SYSTEMS[2]} />
          </motion.div>

          {/* PolyBans + OpenGlass */}
          <motion.div variants={fadeUp}>
            <SystemCard system={SYSTEMS[3]} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <SystemCard system={SYSTEMS[4]} />
          </motion.div>

          {/* darlington.dev — full width with module badges */}
          <motion.div className="md:col-span-2" variants={fadeUp}>
            <SystemCard system={SYSTEMS[5]} modules={MODULES} />
          </motion.div>
        </div>
      </motion.div>
    </PanelWrapper>
  );
}

function SystemCard({
  system,
  featured,
  modules,
}: {
  system: (typeof SYSTEMS)[number] & { award?: string };
  featured?: boolean;
  modules?: string[];
}) {
  const isExternal = system.href?.startsWith("http");
  const Tag = system.href ? "a" : "div";
  const linkProps = system.href
    ? isExternal
      ? {
          href: system.href,
          target: "_blank" as const,
          rel: "noopener noreferrer",
        }
      : { href: system.href }
    : {};

  return (
    <Tag
      {...linkProps}
      className={`relative group block p-5 rounded-xl border border-white/5 hover:border-white/10
                    bg-[#07070e]/80 backdrop-blur-xl transition-all duration-300 h-full
                    ${featured ? "md:text-center" : ""}`}
    >
      <div
        className={`flex items-center gap-3 mb-3 ${featured ? "md:justify-center" : ""}`}
      >
        <span
          className={`text-[var(--accent)] ${featured ? "text-3xl" : "text-2xl"}`}
        >
          {system.icon}
        </span>
        <div className="flex items-center gap-2">
          <h4
            className={`font-medium text-[var(--fg)] ${featured ? "text-[17px]" : "text-[15px]"}`}
          >
            {system.name}
          </h4>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--status-green)] bg-[var(--status-green)]/10 px-1.5 py-0.5 rounded-full">
            Active
          </span>
          {system.award && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
              {system.award}
            </span>
          )}
          {system.href && (
            <ExternalLink
              size={12}
              className="text-[var(--fg2)] opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>
      </div>
      <p
        className={`text-[13px] leading-relaxed text-[var(--fg2)] mb-4 ${featured ? "max-w-2xl md:mx-auto" : ""}`}
      >
        {system.desc}
      </p>
      {modules && (
        <div
          className={`flex flex-wrap gap-1.5 mb-4 ${featured ? "md:justify-center" : ""}`}
        >
          {modules.map((mod) => (
            <span
              key={mod}
              className="text-[10px] font-medium text-[var(--fg)] bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full"
            >
              {mod}
            </span>
          ))}
        </div>
      )}
      <div
        className={`flex flex-wrap gap-1.5 ${featured ? "md:justify-center" : ""}`}
      >
        {system.stack.map((tech) => (
          <span
            key={tech}
            className="font-mono text-[10px] text-[var(--fg2)] bg-white/5 px-2 py-0.5 rounded"
          >
            {tech}
          </span>
        ))}
      </div>
    </Tag>
  );
}
