import { createClient } from '@/lib/supabase/server'
import WebSocket from 'ws'

interface CronJob {
  id: string
  name: string
  description?: string
  enabled: boolean
  createdAtMs: number
  updatedAtMs: number
  schedule: {
    kind: string
    expr: string
    tz?: string
  }
  sessionTarget?: string
  wakeMode?: string
  payload?: {
    kind: string
    message?: string
    thinking?: string
    timeoutSeconds?: number
  }
  delivery?: {
    mode: string
    channel?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
  }
}

/**
 * GET /api/cron — Fetch cron jobs from OpenClaw gateway via WebSocket.
 * Auth-gated: requires Supabase session.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const gatewayUrl = (process.env.OPENCLAW_GATEWAY_URL || 'wss://kai.darlington.dev')
    .replace(/^https:\/\//, 'wss://')
    .replace(/^http:\/\//, 'ws://')
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || ''

  try {
    const jobs = await fetchCronJobs(gatewayUrl, gatewayToken)
    return Response.json({ jobs })
  } catch (err) {
    console.error('Failed to fetch cron jobs:', err)
    return Response.json({ error: 'Failed to fetch cron jobs' }, { status: 502 })
  }
}

function fetchCronJobs(wsUrl: string, token: string): Promise<CronJob[]> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error('Gateway timeout'))
    }, 15000)

    const ws = new WebSocket(wsUrl)
    const reqId = crypto.randomUUID()
    let authenticated = false

    ws.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })

    ws.on('close', () => {
      clearTimeout(timeout)
      if (!authenticated) reject(new Error('Connection closed before auth'))
    })

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString())

        // Handle challenge → authenticate
        if (msg.type === 'event' && msg.method === 'connect.challenge') {
          ws.send(JSON.stringify({
            type: 'req',
            id: crypto.randomUUID(),
            method: 'connect',
            params: {
              clientType: 'api',
              token,
              name: 'darlington-cron-api',
            },
          }))
          return
        }

        // Handle connect response
        if (msg.type === 'res' && msg.result?.status === 'hello-ok') {
          authenticated = true
          // Now request cron list
          ws.send(JSON.stringify({
            type: 'req',
            id: reqId,
            method: 'cron.list',
            params: { all: true },
          }))
          return
        }

        // Handle cron.list response
        if (msg.type === 'res' && msg.id === reqId) {
          clearTimeout(timeout)
          ws.close()
          resolve(msg.result?.jobs || [])
          return
        }
      } catch {
        // ignore parse errors
      }
    })
  })
}
