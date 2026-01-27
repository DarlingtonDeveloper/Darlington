import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsClient } from './stats-client'
import type { Word, UserWordProgress, HanziProfile, WordWithProgress, Sentence, UserSentenceProgress, SentenceWithProgress } from '@/lib/hanzi/types'
import { getWordStatus } from '@/lib/hanzi/types'

export const dynamic = 'force-dynamic'

interface HighScores {
  wordsTap: number
  wordsType: number
  sentencesTap: number
  sentencesType: number
}

async function loadStatsData(userId: string): Promise<{
  words: WordWithProgress[]
  sentences: SentenceWithProgress[]
  profile: HanziProfile | null
  highScores: HighScores
}> {
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

  // Build sentences query with HSK1 filter if enabled
  let sentencesQuery = supabase.from('sentences').select('*')
  if (contentFilter === 'hsk1') {
    sentencesQuery = sentencesQuery.eq('hsk_level', 1)
  }
  sentencesQuery = sentencesQuery.order('difficulty').order('id')

  // Fetch all data in parallel
  const [wordsResult, wordProgressResult, sentencesResult, sentenceProgressResult] = await Promise.all([
    wordsQuery,
    supabase.from('user_word_progress').select('*').eq('user_id', userId),
    sentencesQuery,
    supabase.from('user_sentence_progress').select('*').eq('user_id', userId),
  ])

  if (wordsResult.error) {
    console.error('Error fetching words:', wordsResult.error)
  }
  if (sentencesResult.error) {
    console.error('Error fetching sentences:', sentencesResult.error)
  }

  const words = (wordsResult.data || []) as Word[]
  const wordProgress = (wordProgressResult.data || []) as UserWordProgress[]
  const sentences = (sentencesResult.data || []) as Sentence[]
  const sentenceProgress = (sentenceProgressResult.data || []) as UserSentenceProgress[]

  // Create maps for quick progress lookup
  const wordProgressMap = new Map<string, UserWordProgress>()
  wordProgress.forEach(p => wordProgressMap.set(p.word_id, p))

  const sentenceProgressMap = new Map<string, UserSentenceProgress>()
  sentenceProgress.forEach(p => sentenceProgressMap.set(p.sentence_id, p))

  // Merge words with progress
  const wordsWithProgress: WordWithProgress[] = words.map(word => {
    const progress = wordProgressMap.get(word.id) || null
    const score = progress?.score ?? 0
    return {
      ...word,
      progress,
      status: getWordStatus(score),
    }
  })

  // Merge sentences with progress
  const sentencesWithProgress: SentenceWithProgress[] = sentences.map(sentence => {
    const progress = sentenceProgressMap.get(sentence.id) || null
    const score = progress?.score ?? 0
    return {
      ...sentence,
      progress,
      status: getWordStatus(score),
    }
  })

  // Extract all 4 highscores
  const highScores: HighScores = {
    wordsTap: profile?.high_score_words_tap ?? 0,
    wordsType: profile?.high_score_words_type ?? 0,
    sentencesTap: profile?.high_score_sentences_tap ?? 0,
    sentencesType: profile?.high_score_sentences_type ?? 0,
  }

  return { words: wordsWithProgress, sentences: sentencesWithProgress, profile, highScores }
}

export default async function StatsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { words, sentences, profile, highScores } = await loadStatsData(user.id)

  return (
    <StatsClient
      words={words}
      sentences={sentences}
      profile={profile}
      highScores={highScores}
    />
  )
}
