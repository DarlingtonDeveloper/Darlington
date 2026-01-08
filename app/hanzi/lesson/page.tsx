import { supabase } from '@/lib/supabase'
import { LessonClient } from './lesson-client'
import type { Word, UserWordProgress, WordWithProgress } from '@/lib/hanzi/types'
import { getWordStatus } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

interface LessonData {
  learningWords: WordWithProgress[]
  unseenWords: Word[]
}

async function loadLessonData(): Promise<LessonData> {
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

  // Merge words with progress
  const allWordsWithProgress: WordWithProgress[] = words.map(word => {
    const wordProgress = progressMap.get(word.id) || null
    const score = wordProgress?.score ?? 0
    return {
      ...word,
      progress: wordProgress,
      status: getWordStatus(score),
    }
  })

  // Filter to struggling + learning (score < 3)
  const learningWords = allWordsWithProgress
    .filter(w => w.progress && w.progress.score < 3)
    .sort((a, b) => (a.progress?.score ?? 0) - (b.progress?.score ?? 0))

  // Get unseen words (no progress record)
  const unseenWords = words.filter(w => !progressMap.has(w.id))

  return { learningWords, unseenWords }
}

export default async function LessonPage() {
  const { learningWords, unseenWords } = await loadLessonData()

  return <LessonClient initialWords={learningWords} unseenWords={unseenWords} />
}
