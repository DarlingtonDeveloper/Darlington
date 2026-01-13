import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsClient } from './stats-client'
import type { Word, UserWordProgress, HanziProfile, WordWithProgress } from '@/lib/hanzi/types'
import { getWordStatus } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

async function loadStatsData(userId: string): Promise<{
  words: WordWithProgress[]
  profile: HanziProfile | null
}> {
  const supabase = await createClient()

  // Fetch words, progress, and profile in parallel
  const [wordsResult, progressResult, profileResult] = await Promise.all([
    supabase.from('words').select('*').eq('section', 1).order('unit').order('id'),
    supabase.from('user_word_progress').select('*').eq('user_id', userId),
    supabase.from('hanzi_profiles').select('*').eq('user_id', userId).single(),
  ])

  if (wordsResult.error) {
    console.error('Error fetching words:', wordsResult.error)
  }

  const words = (wordsResult.data || []) as Word[]
  const progress = (progressResult.data || []) as UserWordProgress[]
  const profile = profileResult.data as HanziProfile | null

  // Create a map for quick progress lookup
  const progressMap = new Map<string, UserWordProgress>()
  progress.forEach(p => progressMap.set(p.word_id, p))

  // Merge words with progress
  const wordsWithProgress: WordWithProgress[] = words.map(word => {
    const wordProgress = progressMap.get(word.id) || null
    const score = wordProgress?.score ?? 0
    return {
      ...word,
      progress: wordProgress,
      status: getWordStatus(score),
    }
  })

  return { words: wordsWithProgress, profile }
}

export default async function StatsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { words, profile } = await loadStatsData(user.id)

  return <StatsClient words={words} profile={profile} />
}
