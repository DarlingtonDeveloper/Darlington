import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

interface ActivityEvent {
  id: string
  timestamp: string
  type: 'commit' | 'cron' | 'deploy' | 'agent' | 'message' | 'pr'
  description: string
  repo?: string
  link?: string
  author?: string
  hash?: string
}

async function getGitCommits(repoPath: string, repoName: string, limit: number): Promise<ActivityEvent[]> {
  try {
    const { stdout } = await execAsync(
      `git -C ${repoPath} log --format="%H|||%aI|||%an|||%s" -n ${limit} 2>/dev/null`,
      { timeout: 5000 }
    )
    return stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, timestamp, author, message] = line.split('|||')
        return {
          id: `commit-${repoName}-${hash.slice(0, 8)}`,
          timestamp,
          type: 'commit' as const,
          description: message,
          repo: repoName,
          author,
          hash: hash.slice(0, 8),
        }
      })
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const cursor = searchParams.get('cursor') // ISO timestamp for pagination
  const limitParam = searchParams.get('limit')
  const limit = Math.min(parseInt(limitParam || '30', 10), 100)

  const homedir = process.env.HOME || '/home/mike'

  // Fetch commits from both repos
  const [darlingtonCommits, mcCommits] = await Promise.all([
    getGitCommits(path.join(homedir, 'Darlington'), 'Darlington', limit),
    getGitCommits(path.join(homedir, 'MissionControl'), 'MissionControl', limit),
  ])

  // Merge and sort all events
  let events: ActivityEvent[] = [...darlingtonCommits, ...mcCommits]
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Apply cursor-based pagination
  if (cursor) {
    const cursorTime = new Date(cursor).getTime()
    events = events.filter((e) => new Date(e.timestamp).getTime() < cursorTime)
  }

  // Trim to limit
  events = events.slice(0, limit)

  const nextCursor = events.length === limit ? events[events.length - 1].timestamp : null

  return NextResponse.json({ events, nextCursor })
}
