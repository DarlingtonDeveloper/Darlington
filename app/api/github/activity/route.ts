import { NextResponse } from "next/server";

const ACCOUNTS = ["DarlingtonDeveloper", "MikeSquared-Agency"];
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
};

interface GitHubEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    ref?: string;
    commits?: { message: string; sha: string }[];
    action?: string;
    pull_request?: { title: string; number: number; merged: boolean };
  };
}

export interface ActivityEntry {
  time: string;
  msg: string;
  org: string;
}

let cache: { value: ActivityEntry[]; ts: number } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json(cache.value, { headers: CACHE_HEADERS });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "No GitHub token" }, { status: 500 });
  }

  try {
    const allEvents = await Promise.all(
      ACCOUNTS.map(async (account) => {
        // Use /users/ for personal, /orgs/ for org
        const isOrg = account === "MikeSquared-Agency";
        const url = isOrg
          ? `https://api.github.com/orgs/${account}/events?per_page=30`
          : `https://api.github.com/users/${account}/events/public?per_page=30`;

        const res = await fetch(url, {
          headers: {
            Authorization: `bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        });

        if (!res.ok) return [];

        const events: GitHubEvent[] = await res.json();
        return events.map((e) => ({ event: e, account }));
      }),
    );

    const entries: ActivityEntry[] = [];

    for (const { event, account } of allEvents.flat()) {
      const repo = event.repo.name.split("/").pop() ?? event.repo.name;
      const org = account === "MikeSquared-Agency" ? "agency" : "personal";
      const time = event.created_at;

      if (event.type === "PushEvent" && event.payload.commits?.length) {
        const branch = event.payload.ref?.replace("refs/heads/", "") ?? "main";
        const lastCommit =
          event.payload.commits[event.payload.commits.length - 1];
        const msg = lastCommit.message.split("\n")[0];
        entries.push({
          time,
          msg: `${repo}: ${msg}${branch !== "main" ? ` (${branch})` : ""}`,
          org,
        });
      } else if (
        event.type === "PullRequestEvent" &&
        event.payload.action === "closed" &&
        event.payload.pull_request?.merged
      ) {
        entries.push({
          time,
          msg: `${repo}: merged PR #${event.payload.pull_request.number} — ${event.payload.pull_request.title}`,
          org,
        });
      } else if (event.type === "CreateEvent" && event.payload.ref) {
        entries.push({
          time,
          msg: `${repo}: created branch ${event.payload.ref}`,
          org,
        });
      }
    }

    // Sort by time descending, take 8
    entries.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
    const result = entries.slice(0, 8);

    cache = { value: result, ts: Date.now() };
    return NextResponse.json(result, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
