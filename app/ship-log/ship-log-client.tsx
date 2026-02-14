"use client";

import { useState, useCallback } from "react";
import { ShipLogEntry } from "@/components/ship-log/ship-log-entry";

export interface ShipLogEntryData {
  id: string;
  date: string;
  narrative: string;
  projects: {
    name: string;
    repo: string;
    summary: string;
    commits: {
      sha: string;
      message: string;
      author: string;
      timestamp: string;
    }[];
    prs: { number: number; title: string; merged_at: string; url: string }[];
  }[];
  stats: { total_commits: number; prs_merged: number; repos_active: number };
}

export function ShipLogClient({
  initialEntries,
}: {
  initialEntries: ShipLogEntryData[];
}) {
  const [entries, setEntries] = useState<ShipLogEntryData[]>(initialEntries);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialEntries.length === 30);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const lastDate = entries[entries.length - 1]?.date;
    const res = await fetch(`/api/ship-log?limit=30&before=${lastDate}`);
    const data: ShipLogEntryData[] = await res.json();

    if (data.length < 30) setHasMore(false);
    setEntries((prev) => [...prev, ...data]);
    setLoading(false);
  }, [entries, loading, hasMore]);

  if (entries.length === 0) {
    return (
      <p className="text-neutral-500 text-center py-20">No entries yet.</p>
    );
  }

  return (
    <div className="space-y-8">
      {entries.map((entry) => (
        <ShipLogEntry key={entry.id} entry={entry} />
      ))}
      {hasMore && (
        <div className="flex justify-center pb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 text-sm text-neutral-400 border border-neutral-800 rounded-lg hover:text-neutral-200 hover:border-neutral-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
