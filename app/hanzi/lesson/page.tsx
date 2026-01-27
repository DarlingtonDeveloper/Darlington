import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LessonClient } from './lesson-client'
import type { Word, UserWordProgress, WordWithProgress, HanziProfile, Sentence, UserSentenceProgress, SentenceWithProgress } from '@/lib/hanzi/types'
import { getWordStatus } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

interface LessonData {
  contentMode: 'words' | 'sentences'
  // Word mode
  learningWords: WordWithProgress[]
  unseenWords: Word[]
  // Sentence mode
  learningSentences: SentenceWithProgress[]
  unseenSentences: Sentence[]
}

async function loadLessonData(userId: string): Promise<LessonData> {
  const supabase = await createClient()

  // First fetch profile to get content_filter and content_mode settings
  const { data: profileData } = await supabase
    .from('hanzi_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  const profile = profileData as HanziProfile | null
  const contentFilter = profile?.content_filter ?? 'hsk1'
  const contentMode = (profile?.content_mode as 'words' | 'sentences') ?? 'words'

  if (contentMode === 'sentences') {
    // Load sentences for sentence mode
    let sentencesQuery = supabase.from('sentences').select('*')

    if (contentFilter === 'hsk1') {
      sentencesQuery = sentencesQuery.eq('hsk_level', 1)
    }

    sentencesQuery = sentencesQuery.order('difficulty').order('id')

    const [sentencesResult, progressResult] = await Promise.all([
      sentencesQuery,
      supabase.from('user_sentence_progress').select('*').eq('user_id', userId),
    ])

    if (sentencesResult.error) {
      console.error('Error fetching sentences:', sentencesResult.error)
    }

    const sentences = (sentencesResult.data || []) as Sentence[]
    const progress = (progressResult.data || []) as UserSentenceProgress[]

    // Create a map for quick progress lookup
    const progressMap = new Map<string, UserSentenceProgress>()
    progress.forEach(p => progressMap.set(p.sentence_id, p))

    // Merge sentences with progress
    const allSentencesWithProgress: SentenceWithProgress[] = sentences.map(sentence => {
      const sentenceProgress = progressMap.get(sentence.id) || null
      const score = sentenceProgress?.score ?? 0
      return {
        ...sentence,
        progress: sentenceProgress,
        status: getWordStatus(score),
      }
    })

    // Filter to struggling + learning (score < 3)
    const learningSentences = allSentencesWithProgress
      .filter(s => s.progress && s.progress.score < 3)
      .sort((a, b) => (a.progress?.score ?? 0) - (b.progress?.score ?? 0))

    // Get unseen sentences (no progress record)
    const unseenSentences = sentences.filter(s => !progressMap.has(s.id))

    return {
      contentMode: 'sentences',
      learningWords: [],
      unseenWords: [],
      learningSentences,
      unseenSentences,
    }
  }

  // Default: Load words for word mode
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

  return {
    contentMode: 'words',
    learningWords,
    unseenWords,
    learningSentences: [],
    unseenSentences: [],
  }
}

export default async function LessonPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await loadLessonData(user.id)

  return (
    <LessonClient
      contentMode={data.contentMode}
      initialWords={data.learningWords}
      unseenWords={data.unseenWords}
      initialSentences={data.learningSentences}
      unseenSentences={data.unseenSentences}
      userId={user.id}
    />
  )
}
