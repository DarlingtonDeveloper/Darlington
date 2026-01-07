import { supabase } from '@/lib/supabase'
import { LessonClient } from './lesson-client'
import type { Word, UserWordProgress, WordWithProgress } from '@/lib/hanzi/types'
import { getWordStatus } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

async function loadStrugglingWords(): Promise<WordWithProgress[]> {
  // Fetch words and user progress in parallel
  const [wordsResult, progressResult] = await Promise.all([
    supabase.from('words').select('*').eq('section', 1).order('unit').order('id'),
    supabase.from('user_word_progress').select('*').eq('user_id', USER_ID),
  ])

  if (wordsResult.error) {
    console.error('Error fetching words:', wordsResult.error)
  }

  const words = (wordsResult.data || []) as Word[]
  const progress = (progressResult.data || []) as UserWordProgress[]

  // Create a map for quick progress lookup
  const progressMap = new Map<string, UserWordProgress>()
  progress.forEach(p => progressMap.set(p.word_id, p))

  // Merge words with progress and filter to struggling only
  const wordsWithProgress: WordWithProgress[] = words
    .map(word => {
      const wordProgress = progressMap.get(word.id) || null
      const score = wordProgress?.score ?? 0
      return {
        ...word,
        progress: wordProgress,
        status: getWordStatus(score),
      }
    })
    .filter(w => w.progress && w.progress.score < 0)

  // Sort by score (worst first)
  wordsWithProgress.sort((a, b) => {
    const scoreA = a.progress?.score ?? 0
    const scoreB = b.progress?.score ?? 0
    return scoreA - scoreB
  })

  return wordsWithProgress
}

export default async function LessonPage() {
  const strugglingWords = await loadStrugglingWords()

  return <LessonClient initialWords={strugglingWords} />
}
