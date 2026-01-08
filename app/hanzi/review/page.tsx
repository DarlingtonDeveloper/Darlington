import { supabase } from '@/lib/supabase'
import { ReviewClient } from './review-client'
import type { Word, UserWordProgress, WordWithProgress } from '@/lib/hanzi/types'
import { getWordStatus, SCORE_THRESHOLDS } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'

async function loadReviewData(): Promise<{ masteredWords: WordWithProgress[]; allHanzi: string[] }> {
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

  // Get all hanzi for multiple choice options
  const allHanzi = words.map(w => w.hanzi)

  // Create a map for quick progress lookup
  const progressMap = new Map<string, UserWordProgress>()
  progress.forEach(p => progressMap.set(p.word_id, p))

  // Merge words with progress and filter to mastered only (score >= 6)
  const masteredWords: WordWithProgress[] = words
    .map(word => {
      const wordProgress = progressMap.get(word.id) || null
      const score = wordProgress?.score ?? 0
      return {
        ...word,
        progress: wordProgress,
        status: getWordStatus(score),
      }
    })
    .filter(w => w.progress && w.progress.score >= SCORE_THRESHOLDS.MASTERED_MIN)

  // Sort by last_seen (oldest first) for spaced repetition
  masteredWords.sort((a, b) => {
    const seenA = a.progress?.last_seen
      ? new Date(a.progress.last_seen).getTime()
      : 0
    const seenB = b.progress?.last_seen
      ? new Date(b.progress.last_seen).getTime()
      : 0
    return seenA - seenB
  })

  return { masteredWords, allHanzi }
}

export default async function ReviewPage() {
  const { masteredWords, allHanzi } = await loadReviewData()

  return <ReviewClient initialWords={masteredWords} allHanzi={allHanzi} />
}
