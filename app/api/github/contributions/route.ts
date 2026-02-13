import { NextResponse } from "next/server";

let cache: { value: number; ts: number } | null = null;
const TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json({ total: cache.value });
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

    const json = await res.json();
    const total =
      json?.data?.user?.contributionsCollection?.contributionCalendar
        ?.totalContributions ?? 0;

    cache = { value: total, ts: Date.now() };
    return NextResponse.json({ total });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
