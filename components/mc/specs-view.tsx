"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "./card";
import { SectionLabel } from "./section-label";
import { Badge } from "./badge";

interface SpecInfo {
  id: string;
  title: string;
  filename: string;
  stage?: string;
  linked_tasks: string[];
}

interface SpecsViewProps {
  baseUrl: string;
}

export function SpecsView({ baseUrl }: SpecsViewProps) {
  const [specs, setSpecs] = useState<SpecInfo[]>([]);
  const [orphanIds, setOrphanIds] = useState<Set<string>>(new Set());
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${baseUrl}/api/specs`).then((r) => r.json()),
      fetch(`${baseUrl}/api/specs/orphans`).then((r) => r.json()),
    ])
      .then(([allSpecs, orphans]) => {
        setSpecs(allSpecs);
        setOrphanIds(new Set((orphans as SpecInfo[]).map((o) => o.id)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [baseUrl]);

  const handleSelect = async (id: string) => {
    setSelectedSpec(id);
    try {
      const res = await fetch(`${baseUrl}/api/specs/${id}`);
      setContent(res.ok ? await res.text() : "Failed to load spec.");
    } catch {
      setContent("Failed to load spec.");
    }
  };

  if (loading) return null;

  if (specs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[#6b6560]">
        No specs found. Add .md files to .mission/specs/.
      </div>
    );
  }

  return (
    <div className="flex gap-4 pt-4" style={{ minHeight: "60vh" }}>
      {/* Sidebar — spec list */}
      <div className="w-[280px] shrink-0 space-y-1">
        <SectionLabel>Specifications</SectionLabel>
        {specs.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className={[
              "w-full rounded-lg px-3 py-2 text-left text-xs transition cursor-pointer border-none",
              selectedSpec === s.id
                ? "bg-white/[0.08] text-[#e8e4df]"
                : "text-[#a89880] hover:bg-white/[0.04] bg-transparent",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium font-[family-name:var(--font-sans)]">
                {s.title}
              </span>
              {orphanIds.has(s.id) && <Badge variant="danger">orphan</Badge>}
            </div>
            {s.linked_tasks.length > 0 && (
              <div className="mt-0.5 font-mono text-[10px] text-[#6b6560]">
                → {s.linked_tasks.join(", ")}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Detail — markdown rendered */}
      <Card className="flex-1 p-5 overflow-auto">
        {selectedSpec ? (
          <article className="prose prose-invert prose-sm max-w-none specs-markdown">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg font-semibold text-[#e8e4df] mb-3 mt-0 border-b border-white/[0.06] pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-semibold text-[#c4b5a0] mb-2 mt-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-semibold text-[#a89880] mb-1 mt-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-xs text-[#a89880] leading-relaxed mb-2">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="text-xs text-[#a89880] list-disc pl-4 mb-2 space-y-0.5">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-xs text-[#a89880] list-decimal pl-4 mb-2 space-y-0.5">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-xs text-[#a89880]">{children}</li>
                ),
                code: ({ className, children }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <code className="block bg-black/40 border border-white/[0.06] rounded-md p-3 text-[11px] font-mono text-[#c4b5a0] overflow-x-auto whitespace-pre">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="bg-white/[0.06] rounded px-1 py-0.5 text-[11px] font-mono text-[#c4b5a0]">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-transparent mb-2 overflow-x-auto">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <table className="text-xs border-collapse w-full mb-2">
                    {children}
                  </table>
                ),
                th: ({ children }) => (
                  <th className="text-left text-[10px] font-mono uppercase tracking-wider text-[#6b6560] border-b border-white/[0.06] py-1 px-2">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="text-xs text-[#a89880] border-b border-white/[0.04] py-1 px-2">
                    {children}
                  </td>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#c4b5a0]/30 pl-3 my-2 text-xs text-[#6b6560] italic">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-[#c4b5a0] underline underline-offset-2 hover:text-[#e8e4df] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="border-white/[0.06] my-4" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="flex items-center justify-center h-full py-20 text-sm text-[#6b6560]">
            Select a spec to view its contents.
          </div>
        )}
      </Card>
    </div>
  );
}
