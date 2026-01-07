import { supabase } from '@/lib/supabase'
import { StatsClient } from './stats-client'
import type { Word, UserWordProgress, HanziProfile, WordWithProgress } from '@/lib/hanzi/types'
import { getWordStatus } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

async function loadStatsData(): Promise<{
  words: WordWithProgress[]
  profile: HanziProfile | null
}> {
  // Fetch words, progress, and profile in parallel
  const [wordsResult, progressResult, profileResult] = await Promise.all([
    supabase.from('words').select('*').eq('section', 1).order('unit').order('id'),
    supabase.from('user_word_progress').select('*').eq('user_id', USER_ID),
    supabase.from('hanzi_profiles').select('*').eq('user_id', USER_ID).single(),
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
  const { words, profile } = await loadStatsData()

  return <StatsClient words={words} profile={profile} />
}
