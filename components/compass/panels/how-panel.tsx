"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PanelWrapper } from "./panel-wrapper";
import { ExternalLink } from "lucide-react";

const BLOG_POSTS = [
  {
    title: "The Markdown Attack Nobody's Talking About.",
    tag: "Security",
    href: "https://blog.darlington.dev/the-markdown-attack-nobodys-talking-about",
  },
  {
    title: "The Architect's Illusion",
    tag: "Architecture",
    href: "https://blog.darlington.dev/the-architects-illusion",
  },
  {
    title: "AI Won't Teach You to Think Like a Developer (Unless you ask it).",
    tag: "AI",
    href: "https://blog.darlington.dev/ai-wont-teach-you-to-think-like-a-developer-unless-you-ask-it",
  },
  {
    title: "The Best Architecture Is the One You Can Maintain",
    tag: "Architecture",
    href: "https://blog.darlington.dev/the-best-architecture-is-the-one-you-can-maintain",
  },
];

interface ActivityEntry {
  time: string;
  msg: string;
  org: string;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function HowPanel() {
  const [activity, setActivity] = useState<ActivityEntry[] | null>(null);

  useEffect(() => {
    fetch("/api/github/activity")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setActivity(data);
      })
      .catch(() => {});
  }, []);

  return (
    <PanelWrapper direction="right" noScroll>
      <motion.div
        className="max-w-[560px] ml-auto h-full flex flex-col pt-16 md:pt-12"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Writing section header — fixed */}
        <motion.h3
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--fg2)] mb-4 shrink-0"
          variants={fadeUp}
        >
          Writing
        </motion.h3>

        {/* Articles — scrollable, shows ~3 at a time */}
        <div className="overflow-y-auto no-scrollbar min-h-0 flex-1 space-y-3">
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

        {/* Divider */}
        <motion.div
          className="border-t border-white/5 my-6 shrink-0"
          variants={fadeUp}
        />

        {/* Ship Log — live from GitHub */}
        <div className="flex flex-col shrink-0">
          <motion.div
            className="font-mono text-[12px] text-[var(--fg2)] mb-3 flex items-center gap-1 shrink-0"
            variants={fadeUp}
          >
            <span className="text-[var(--status-green)]">$</span>{" "}
            <span>kai@darlington ~ $ cat ship.log</span>
            <span className="inline-block w-[6px] h-[14px] bg-[var(--status-green)] ml-0.5 animate-pulse" />
          </motion.div>
          <div className="space-y-1">
            {activity === null ? (
              // Skeleton loading
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-[1.1rem] rounded bg-white/5 animate-pulse"
                  style={{ width: `${60 + Math.random() * 30}%` }}
                  variants={fadeUp}
                />
              ))
            ) : activity.length === 0 ? (
              <motion.div
                className="font-mono text-[11px] text-[var(--fg2)]"
                variants={fadeUp}
              >
                No recent activity
              </motion.div>
            ) : (
              activity.map((entry, i) => (
                <motion.div
                  key={`${entry.time}-${i}`}
                  className="font-mono text-[11px] leading-relaxed"
                  variants={fadeUp}
                >
                  <span className="text-[var(--fg2)] tabular-nums">
                    [{formatTime(entry.time)}]
                  </span>{" "}
                  <span
                    className={
                      entry.org === "agency"
                        ? "text-[var(--accent)]"
                        : "text-[var(--status-green)]"
                    }
                  >
                    {entry.msg}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </PanelWrapper>
  );
}
