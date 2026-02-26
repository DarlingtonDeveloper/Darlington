"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { PanelWrapper } from "./panel-wrapper";

const SYSTEMS = [
  {
    icon: "⚡",
    name: "The Swarm",
    desc: "A network of specialised AI agents coordinated through NATS messaging, managed by Warren, and orchestrated by MissionControl. Each agent has persistent memory, defined capabilities, and a soul.",
    stack: ["Go", "Docker Swarm", "NATS", "WebSocket"],
  },
  {
    icon: "🦊",
    name: "Kai",
    desc: "King of the swarm. Orchestrates work, reviews output, manages infrastructure. Runs 24/7 on dedicated hardware with persistent memory and WhatsApp/Slack/web connectivity.",
    stack: ["Claude Opus", "OpenClaw", "TypeScript"],
  },
  {
    icon: "◈",
    name: "MissionControl",
    desc: "10-stage agentic workflow engine. Progressive refinement through Discovery → Plan → Design → Implement → Verify → Validate → Release → Retro → Maintain → Archive.",
    stack: ["Go", "Rust", "React", "WebSocket"],
  },
  {
    icon: "🏛️",
    name: "Infrastructure",
    desc: "Warren (reverse proxy + lifecycle), Alexandria (knowledge + secrets), PromptForge (prompt VCS), Dispatch (task broker), Hermes (NATS message bus), Context Graph (identity resolution).",
    stack: ["Go", "Python", "pgvector", "Supabase"],
  },
  {
    icon: "🧠",
    name: "Cortex",
    desc: "Embedded graph memory for AI agents. Typed knowledge nodes, auto-linking via embeddings, decay of unused knowledge, briefings synthesised on demand. One binary. One file. Zero dependencies.",
    stack: ["Rust", "HNSW", "Knowledge Graph"],
    href: "https://github.com/MikeSquared-Agency/cortex",
  },
  {
    icon: "◎",
    name: "Personal OS",
    desc: "Life infrastructure — habits, health, finance, calendar, Mandarin practice. All data flows through a single interface at darlington.dev.",
    stack: ["Next.js 15", "Supabase", "React 19", "Vercel"],
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
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
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

          {/* Kai + MissionControl */}
          <motion.div variants={fadeUp}>
            <SystemCard system={SYSTEMS[1]} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <SystemCard system={SYSTEMS[2]} />
          </motion.div>

          {/* Infrastructure + Cortex */}
          <motion.div variants={fadeUp}>
            <SystemCard system={SYSTEMS[3]} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <SystemCard system={SYSTEMS[4]} />
          </motion.div>

          {/* Personal OS — full width */}
          <motion.div className="md:col-span-2" variants={fadeUp}>
            <SystemCard system={SYSTEMS[5]} />
          </motion.div>
        </div>
      </motion.div>
    </PanelWrapper>
  );
}

function SystemCard({
  system,
  featured,
}: {
  system: (typeof SYSTEMS)[number];
  featured?: boolean;
}) {
  const Tag = system.href ? "a" : "div";
  const linkProps = system.href
    ? {
        href: system.href,
        target: "_blank" as const,
        rel: "noopener noreferrer",
      }
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
