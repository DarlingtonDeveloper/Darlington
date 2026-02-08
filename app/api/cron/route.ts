import { createClient } from "@/lib/supabase/server";

interface CronJob {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  schedule: {
    kind: string;
    expr: string;
    tz?: string;
  };
  sessionTarget?: string;
  wakeMode?: string;
  payload?: {
    kind: string;
    message?: string;
    thinking?: string;
    timeoutSeconds?: number;
  };
  delivery?: {
    mode: string;
    channel?: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastRunStatus?: string;
  };
}

/**
 * GET /api/cron — Fetch cron jobs from OpenClaw gateway via REST API.
 * Auth-gated: requires Supabase session.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gatewayUrl = (
    process.env.OPENCLAW_GATEWAY_URL || "https://kai.darlington.dev"
  )
    .replace(/^wss:\/\//, "https://")
    .replace(/^ws:\/\//, "http://");
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || "";

  // Try known REST endpoints in order
  const endpoints = [`${gatewayUrl}/api/cron/list`, `${gatewayUrl}/v1/cron`];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${gatewayToken}` },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const jobs: CronJob[] = data.jobs || data || [];
        return Response.json({ jobs });
      }
    } catch {
      // Try next endpoint
    }
  }

  return Response.json(
    { error: "Cron API not available — gateway REST endpoints unreachable" },
    { status: 502 },
  );
}
