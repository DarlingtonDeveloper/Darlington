import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ActivityEvent {
  id: string;
  timestamp: string;
  type: "commit" | "cron" | "deploy" | "agent" | "message" | "pr";
  description: string;
  repo?: string;
  link?: string;
  author?: string;
  hash?: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

const REPOS = [
  { owner: "DarlingtonDeveloper", repo: "Darlington", name: "Darlington" },
  {
    owner: "DarlingtonDeveloper",
    repo: "MissionControl",
    name: "MissionControl",
  },
];

async function getGitHubCommits(
  owner: string,
  repo: string,
  repoName: string,
  limit: number,
  until?: string | null,
): Promise<ActivityEvent[]> {
  const token = process.env.GITHUB_PAT;
  if (!token) return [];

  const params = new URLSearchParams({ per_page: String(limit) });
  if (until) params.set("until", until);

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?${params}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 0 },
    },
  );

  if (!res.ok) return [];

  const commits: GitHubCommit[] = await res.json();
  return commits.map((c) => ({
    id: `commit-${repoName}-${c.sha.slice(0, 8)}`,
    timestamp: c.commit.author.date,
    type: "commit" as const,
    description: c.commit.message.split("\n")[0],
    repo: repoName,
    author: c.commit.author.name,
    hash: c.sha.slice(0, 8),
    link: c.html_url,
  }));
}

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GITHUB_PAT) {
    return NextResponse.json(
      { error: "GITHUB_PAT not configured" },
      { status: 500 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor"); // ISO timestamp for pagination
  const limitParam = searchParams.get("limit");
  const limit = Math.min(parseInt(limitParam || "30", 10), 100);

  // Fetch commits from both repos via GitHub API
  const results = await Promise.all(
    REPOS.map((r) => getGitHubCommits(r.owner, r.repo, r.name, limit, cursor)),
  );

  // Merge and sort all events
  let events: ActivityEvent[] = results.flat();
  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  // When using cursor, the GitHub API already filters by `until`,
  // but since we merge two repos we need to re-trim
  events = events.slice(0, limit);

  const nextCursor =
    events.length === limit ? events[events.length - 1].timestamp : null;

  return NextResponse.json({ events, nextCursor });
}
