import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LessonClient } from './lesson-client'
import type { Word, UserWordProgress, WordWithProgress, HanziProfile } from '@/lib/hanzi/types'
import { getWordStatus } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

interface LessonData {
  learningWords: WordWithProgress[]
  unseenWords: Word[]
}

async function loadLessonData(userId: string): Promise<LessonData> {
  const supabase = await createClient()

  // First fetch profile to get content_filter setting
  const { data: profileData } = await supabase
    .from('hanzi_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  const profile = profileData as HanziProfile | null
  const contentFilter = profile?.content_filter ?? 'hsk1'

  // Build words query with HSK1 filter if enabled
  let wordsQuery = supabase.from('words').select('*').eq('section', 1)

  if (contentFilter === 'hsk1') {
    wordsQuery = wordsQuery.or('hsk_level.is.null,hsk_level.eq.1')
  }

  wordsQuery = wordsQuery.order('unit').order('id')

  // Fetch words and user progress in parallel
  const [wordsResult, progressResult] = await Promise.all([
    wordsQuery,
    supabase.from('user_word_progress').select('*').eq('user_id', userId),
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { learningWords, unseenWords } = await loadLessonData(user.id)

  return <LessonClient initialWords={learningWords} unseenWords={unseenWords} userId={user.id} />
}
