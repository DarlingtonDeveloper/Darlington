"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "./card";
import { SectionLabel } from "./section-label";

type Tab = "findings" | "briefing";

interface FindingsViewProps {
  taskId: string | null;
  baseUrl: string;
}

export function FindingsView({ taskId, baseUrl }: FindingsViewProps) {
  const [tab, setTab] = useState<Tab>("findings");
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<Record<string, unknown> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMarkdown(null);
    setBriefing(null);
    setError(null);
    if (!taskId) return;

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);

    Promise.all([
      fetch(`${baseUrl}/api/tasks/${taskId}/findings`, { signal }).then((r) =>
        r.ok ? r.text() : null,
      ),
      fetch(`${baseUrl}/api/tasks/${taskId}/briefing`, { signal }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([md, brief]) => {
        if (signal.aborted) return;
        setMarkdown(md);
        setBriefing(brief);
        if (!md && brief) setTab("briefing");
        else setTab("findings");
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Failed to load task data");
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [taskId, baseUrl]);

  if (!taskId) return null;

  const hasFindings = markdown !== null;
  const hasBriefing = briefing !== null;

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Task {taskId.slice(0, 10)}</SectionLabel>
        <div className="flex gap-1">
          {(["findings", "briefing"] as const).map((t) => {
            const active = tab === t;
            const hasData = t === "findings" ? hasFindings : hasBriefing;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-[#c4b5a0]/20 text-[#c4b5a0] border border-[#c4b5a0]/30"
                    : "text-[#6b6560] hover:text-[#a89880] border border-transparent"
                } ${!hasData ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={!hasData}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 text-sm text-[#6b6560]">
          Loading…
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-10 text-sm text-red-400/80">
          {error}
        </div>
      )}

      {!loading && !error && !hasFindings && !hasBriefing && (
        <div className="flex items-center justify-center py-10 text-sm text-[#6b6560]">
          No findings or briefing available for this task.
        </div>
      )}

      {!loading && !error && tab === "findings" && hasFindings && (
        <div className="prose-dark max-h-[60vh] overflow-auto pr-2">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            urlTransform={(url) => {
              const trimmed = url.trim().toLowerCase();
              if (trimmed.startsWith("javascript:")) return "";
              return url;
            }}
            components={{
              h1: ({ children }) => (
                <h1
                  className="mb-3 text-lg font-semibold text-[#e8e4df]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  className="mb-2 mt-4 text-sm font-semibold text-[#c4b5a0]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  className="mb-1.5 mt-3 text-xs font-semibold text-[#a89880]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p
                  className="mb-2 text-[12px] leading-relaxed text-[#b0a898]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-2 ml-4 list-disc text-[12px] text-[#b0a898] space-y-0.5">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-2 ml-4 list-decimal text-[12px] text-[#b0a898] space-y-0.5">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-[12px] text-[#b0a898]">{children}</li>
              ),
              code: ({ className, children, ...props }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <pre className="mb-3 mt-1 overflow-auto rounded-lg border border-white/[0.06] bg-black/40 p-3">
                      <code
                        className="text-[11px] text-[#c4b5a0]/90"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {children}
                      </code>
                    </pre>
                  );
                }
                return (
                  <code
                    className="rounded bg-white/[0.06] px-1 py-0.5 text-[11px] text-[#c4b5a0]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <>{children}</>,
              table: ({ children }) => (
                <div className="mb-3 overflow-auto">
                  <table className="w-full border-collapse text-[11px]">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-wider text-[#6b6560]">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-white/[0.06] px-2 py-1 text-[#b0a898]">
                  {children}
                </td>
              ),
              hr: () => <hr className="my-4 border-white/[0.06]" />,
              blockquote: ({ children }) => (
                <blockquote className="mb-2 border-l-2 border-[#c4b5a0]/30 pl-3 text-[12px] italic text-[#6b6560]">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-[#c4b5a0] underline decoration-[#c4b5a0]/30 hover:decoration-[#c4b5a0]/60 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-[#e8e4df]">
                  {children}
                </strong>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      )}

      {!loading && !error && tab === "briefing" && hasBriefing && (
        <div className="max-h-[60vh] overflow-auto">
          <pre
            className="rounded-lg border border-white/[0.06] bg-black/40 p-3 text-[11px] text-[#c4b5a0]/90 leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {JSON.stringify(briefing, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}
