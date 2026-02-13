import { NextResponse } from "next/server";

let cache: { value: number; ts: number } | null = null;
const TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" };

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return NextResponse.json({ total: cache.value }, { headers: CACHE_HEADERS });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "No GitHub token" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{ user(login: "DarlingtonDeveloper") { contributionsCollection { contributionCalendar { totalContributions } } } }`,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "GitHub API error" }, { status: 502 });
    }

    const json = await res.json();

    if (json.errors) {
      console.error("GraphQL errors:", json.errors);
      return NextResponse.json({ error: "GraphQL query failed" }, { status: 502 });
    }

    const total =
      json?.data?.user?.contributionsCollection?.contributionCalendar
        ?.totalContributions ?? 0;

    cache = { value: total, ts: Date.now() };
    return NextResponse.json({ total }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
