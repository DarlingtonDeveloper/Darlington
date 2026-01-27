import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReviewClient } from './review-client'
import type { Word, UserWordProgress, WordWithProgress, HanziProfile, Sentence, UserSentenceProgress, SentenceWithProgress } from '@/lib/hanzi/types'
import { getWordStatus, SCORE_THRESHOLDS, getHighScoreKey } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

interface ReviewData {
  contentMode: 'words' | 'sentences'
  // Word mode data
  masteredWords: WordWithProgress[]
  allHanzi: string[]
  // Sentence mode data
  masteredSentences: SentenceWithProgress[]
  allEnglish: string[]
  // Common
  lifetimeHighScore: number
  inputMethod: 'tap' | 'type'
}

async function loadReviewData(userId: string): Promise<ReviewData> {
  const supabase = await createClient()

  // First get the profile to determine content mode
  const { data: profileData } = await supabase
    .from('hanzi_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  const profile = profileData as HanziProfile | null
  const contentMode = (profile?.content_mode as 'words' | 'sentences') ?? 'words'

  const contentFilter = profile?.content_filter ?? 'hsk1'
  const inputMethod = (profile?.input_method as 'tap' | 'type') ?? 'tap'
  const highScoreKey = getHighScoreKey(contentMode, inputMethod)

  if (contentMode === 'sentences') {
    // Load sentences for sentence mode
    let sentencesQuery = supabase.from('sentences').select('*')

    // Apply HSK1 filter if enabled
    if (contentFilter === 'hsk1') {
      sentencesQuery = sentencesQuery.eq('hsk_level', 1)
    }

    sentencesQuery = sentencesQuery.order('difficulty').order('id')

    const [sentencesResult, sentenceProgressResult] = await Promise.all([
      sentencesQuery,
      supabase.from('user_sentence_progress').select('*').eq('user_id', userId),
    ])

    const sentences = (sentencesResult.data || []) as Sentence[]
    const sentenceProgress = (sentenceProgressResult.data || []) as UserSentenceProgress[]

    // Get all English for multiple choice options
    const allEnglish = sentences.map(s => s.english)

    // Create progress map
    const progressMap = new Map<string, UserSentenceProgress>()
    sentenceProgress.forEach(p => progressMap.set(p.sentence_id, p))

    // Merge and filter to mastered (for now, show all sentences since most won't be mastered yet)
    // In production, you might want to filter to mastered only like words
    const masteredSentences: SentenceWithProgress[] = sentences
      .map(sentence => {
        const progress = progressMap.get(sentence.id) || null
        const score = progress?.score ?? 0
        return {
          ...sentence,
          progress,
          status: getWordStatus(score),
        }
      })
      // For sentences, show all (not just mastered) since user is learning
      // Filter by seen or mastered: .filter(s => s.progress && s.progress.score >= SCORE_THRESHOLDS.MASTERED_MIN)

    // Sort by difficulty, then by last_seen
    masteredSentences.sort((a, b) => {
      // First by difficulty
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty
      // Then by last_seen (oldest first)
      const seenA = a.progress?.last_seen ? new Date(a.progress.last_seen).getTime() : 0
      const seenB = b.progress?.last_seen ? new Date(b.progress.last_seen).getTime() : 0
      return seenA - seenB
    })

    return {
      contentMode: 'sentences',
      masteredWords: [],
      allHanzi: [],
      masteredSentences,
      allEnglish,
      lifetimeHighScore: profile?.[highScoreKey] ?? 0,
      inputMethod,
    }
  }

  // Default: Load words for word mode
  let wordsQuery = supabase.from('words').select('*').eq('section', 1)

  // Apply HSK1 filter if enabled
  if (contentFilter === 'hsk1') {
    wordsQuery = wordsQuery.or('hsk_level.is.null,hsk_level.eq.1')
  }

  wordsQuery = wordsQuery.order('unit').order('id')

  const [wordsResult, progressResult] = await Promise.all([
    wordsQuery,
    supabase.from('user_word_progress').select('*').eq('user_id', userId),
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

  return {
    contentMode: 'words',
    masteredWords,
    allHanzi,
    masteredSentences: [],
    allEnglish: [],
    lifetimeHighScore: profile?.[highScoreKey] ?? 0,
    inputMethod,
  }
}

export default async function ReviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await loadReviewData(user.id)

  return (
    <ReviewClient
      contentMode={data.contentMode}
      initialWords={data.masteredWords}
      allHanzi={data.allHanzi}
      initialSentences={data.masteredSentences}
      allEnglish={data.allEnglish}
      userId={user.id}
      initialLifetimeHighScore={data.lifetimeHighScore}
      inputMethod={data.inputMethod}
    />
  )
}
