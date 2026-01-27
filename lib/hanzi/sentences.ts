// Hanzi Linker - Sentence Data Layer

import type { Sentence, UserSentenceProgress, SentenceWithProgress, SentenceCategory } from './types'
import { getWordStatus } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Load all sentences with user progress
 */
export async function loadSentenceData(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    hskLevel?: number
    category?: SentenceCategory
  }
): Promise<SentenceWithProgress[]> {
  // Build sentence query
  let sentenceQuery = supabase.from('sentences').select('*')

  if (options?.hskLevel) {
    sentenceQuery = sentenceQuery.eq('hsk_level', options.hskLevel)
  }
  if (options?.category) {
    sentenceQuery = sentenceQuery.eq('category', options.category)
  }

  sentenceQuery = sentenceQuery.order('difficulty').order('id')

  // Fetch sentences and progress in parallel
  const [sentencesResult, progressResult] = await Promise.all([
    sentenceQuery,
    supabase.from('user_sentence_progress').select('*').eq('user_id', userId),
  ])

  if (sentencesResult.error) {
    console.error('Error fetching sentences:', sentencesResult.error)
    return []
  }

  const sentences = (sentencesResult.data || []) as Sentence[]
  const progress = (progressResult.data || []) as UserSentenceProgress[]

  // Create progress map
  const progressMap = new Map<string, UserSentenceProgress>()
  progress.forEach(p => progressMap.set(p.sentence_id, p))

  // Merge sentences with progress
  return sentences.map(sentence => {
    const sentenceProgress = progressMap.get(sentence.id) || null
    const score = sentenceProgress?.score ?? 0
    return {
      ...sentence,
      progress: sentenceProgress,
      status: getWordStatus(score),
    }
  })
}

/**
 * Load mastered sentences for review mode
 */
export async function loadMasteredSentences(
  supabase: SupabaseClient,
  userId: string
): Promise<SentenceWithProgress[]> {
  const allSentences = await loadSentenceData(supabase, userId)

  // Filter to mastered sentences (score >= 6)
  const masteredSentences = allSentences.filter(
    s => s.progress && s.progress.score >= 6
  )

  // Sort by last_seen (oldest first) for spaced repetition
  masteredSentences.sort((a, b) => {
    const seenA = a.progress?.last_seen
      ? new Date(a.progress.last_seen).getTime()
      : 0
    const seenB = b.progress?.last_seen
      ? new Date(b.progress.last_seen).getTime()
      : 0
    return seenA - seenB
  })

  return masteredSentences
}

/**
 * Update sentence progress after answering
 */
export async function updateSentenceProgress(
  supabase: SupabaseClient,
  userId: string,
  sentenceId: string,
  wasCorrect: boolean,
  currentProgress: UserSentenceProgress | null
): Promise<void> {
  const now = new Date().toISOString()
  const currentScore = currentProgress?.score ?? 0

  // Calculate score change (same as word scoring)
  const scoreChange = wasCorrect ? 1 : (currentScore >= 6 ? -3 : -2)
  const newScore = currentScore + scoreChange

  if (currentProgress) {
    // Update existing progress
    await supabase
      .from('user_sentence_progress')
      .update({
        score: newScore,
        attempts: currentProgress.attempts + 1,
        correct_streak: wasCorrect ? currentProgress.correct_streak + 1 : 0,
        last_seen: now,
        updated_at: now,
      })
      .eq('id', currentProgress.id)
  } else {
    // Insert new progress record
    await supabase
      .from('user_sentence_progress')
      .insert({
        user_id: userId,
        sentence_id: sentenceId,
        score: wasCorrect ? 1 : -1,
        attempts: 1,
        correct_streak: wasCorrect ? 1 : 0,
        last_seen: now,
        introduced_at: now,
        updated_at: now,
      })
  }
}

/**
 * Get sentences for Link mode (select N sentences for the board)
 */
export async function selectSentencesForRound(
  supabase: SupabaseClient,
  userId: string,
  count: number = 4,
  excludeIds: string[] = []
): Promise<SentenceWithProgress[]> {
  const allSentences = await loadSentenceData(supabase, userId, { hskLevel: 1 })

  // Filter out excluded sentences
  const availableSentences = allSentences.filter(s => !excludeIds.includes(s.id))

  if (availableSentences.length === 0) {
    return []
  }

  // Prioritize: struggling > learning > unseen > familiar > mastered
  const struggling = availableSentences.filter(s => s.status === 'struggling')
  const learning = availableSentences.filter(s => s.status === 'learning')
  const unseen = availableSentences.filter(s => !s.progress)
  const familiar = availableSentences.filter(s => s.status === 'familiar')
  const mastered = availableSentences.filter(s => s.status === 'mastered')

  const selected: SentenceWithProgress[] = []

  // Add struggling first (max 2)
  shuffleArray(struggling)
  selected.push(...struggling.slice(0, Math.min(2, count - selected.length)))

  // Add learning (max 2)
  if (selected.length < count) {
    shuffleArray(learning)
    selected.push(...learning.slice(0, Math.min(2, count - selected.length)))
  }

  // Add unseen
  if (selected.length < count) {
    shuffleArray(unseen)
    selected.push(...unseen.slice(0, count - selected.length))
  }

  // Add familiar
  if (selected.length < count) {
    shuffleArray(familiar)
    selected.push(...familiar.slice(0, count - selected.length))
  }

  // Add mastered as last resort
  if (selected.length < count) {
    shuffleArray(mastered)
    selected.push(...mastered.slice(0, count - selected.length))
  }

  return selected
}

/**
 * Get all unique English translations for multiple choice options
 */
export async function getAllEnglishTranslations(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from('sentences')
    .select('english')
    .order('id')

  if (error) {
    console.error('Error fetching English translations:', error)
    return []
  }

  return (data || []).map(s => s.english)
}

// Helper: shuffle array in place
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
