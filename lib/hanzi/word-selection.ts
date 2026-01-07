// Hanzi Linker - Adaptive Word Selection Algorithm

import { Word, WordWithProgress, SCORE_THRESHOLDS } from './types'

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export interface WordSelectionOptions {
  roundSize?: number
  maxStruggling?: number
  maxLearning?: number
  includeReview?: boolean
}

/**
 * Select words for a round based on adaptive priority:
 * 1. Struggling words (score < 0) - max 2
 * 2. Learning words (score 0-2) - fill to max 3 total
 * 3. New words at user's level - fill remainder
 * 4. Familiar words if still not enough
 */
export function selectWordsForRound(
  allWords: WordWithProgress[],
  currentUnit: number,
  options: WordSelectionOptions = {}
): Word[] {
  const {
    roundSize = 4,
    maxStruggling = 2,
    maxLearning = 2,
    includeReview = false,
  } = options

  // Filter to words at or below current unit
  const availableWords = allWords.filter(w => w.unit <= currentUnit)

  if (availableWords.length === 0) {
    return []
  }

  // Categorize by score
  const struggling = availableWords.filter(
    w => w.progress && w.progress.score < SCORE_THRESHOLDS.LEARNING_MIN
  )

  const learning = availableWords.filter(w => {
    const score = w.progress?.score ?? 0
    return (
      w.progress !== null &&
      score >= SCORE_THRESHOLDS.LEARNING_MIN &&
      score <= SCORE_THRESHOLDS.LEARNING_MAX
    )
  })

  const newWords = availableWords.filter(w => w.progress === null)

  const familiar = availableWords.filter(w => {
    const score = w.progress?.score ?? 0
    return (
      w.progress !== null &&
      score >= SCORE_THRESHOLDS.FAMILIAR_MIN &&
      score <= SCORE_THRESHOLDS.FAMILIAR_MAX
    )
  })

  const mastered = availableWords.filter(
    w => w.progress && w.progress.score >= SCORE_THRESHOLDS.MASTERED_MIN
  )

  const selected: WordWithProgress[] = []

  // Priority 1: Struggling (max 2)
  const struggleCount = Math.min(maxStruggling, struggling.length)
  selected.push(...shuffle(struggling).slice(0, struggleCount))

  // Priority 2: Learning (fill to max learning)
  const learningNeeded = Math.min(maxLearning, roundSize - selected.length)
  if (learningNeeded > 0 && learning.length > 0) {
    selected.push(...shuffle(learning).slice(0, learningNeeded))
  }

  // Priority 3: New words
  const newNeeded = roundSize - selected.length
  if (newNeeded > 0 && newWords.length > 0) {
    selected.push(...shuffle(newWords).slice(0, newNeeded))
  }

  // Priority 4: Familiar words if still not enough
  const familiarNeeded = roundSize - selected.length
  if (familiarNeeded > 0 && familiar.length > 0) {
    selected.push(...shuffle(familiar).slice(0, familiarNeeded))
  }

  // Priority 5: Mastered words for review if still not enough
  if (includeReview) {
    const masteredNeeded = roundSize - selected.length
    if (masteredNeeded > 0 && mastered.length > 0) {
      selected.push(...shuffle(mastered).slice(0, masteredNeeded))
    }
  }

  // Shuffle final selection so struggling words aren't always first
  return shuffle(selected)
}

/**
 * Get words specifically for lesson mode (struggling words only)
 */
export function selectWordsForLesson(
  allWords: WordWithProgress[],
  limit: number = 10
): WordWithProgress[] {
  const struggling = allWords.filter(
    w => w.progress && w.progress.score < SCORE_THRESHOLDS.LEARNING_MIN
  )

  // Sort by score (worst first) then by last_seen (oldest first)
  struggling.sort((a, b) => {
    const scoreA = a.progress?.score ?? 0
    const scoreB = b.progress?.score ?? 0
    if (scoreA !== scoreB) return scoreA - scoreB

    const seenA = a.progress?.last_seen
      ? new Date(a.progress.last_seen).getTime()
      : 0
    const seenB = b.progress?.last_seen
      ? new Date(b.progress.last_seen).getTime()
      : 0
    return seenA - seenB
  })

  return struggling.slice(0, limit)
}

/**
 * Get words for review mode (mastered words due for review)
 */
export function selectWordsForReview(
  allWords: WordWithProgress[],
  limit: number = 10
): WordWithProgress[] {
  const mastered = allWords.filter(
    w => w.progress && w.progress.score >= SCORE_THRESHOLDS.MASTERED_MIN
  )

  // Sort by last_seen (oldest first) for spaced repetition
  mastered.sort((a, b) => {
    const seenA = a.progress?.last_seen
      ? new Date(a.progress.last_seen).getTime()
      : 0
    const seenB = b.progress?.last_seen
      ? new Date(b.progress.last_seen).getTime()
      : 0
    return seenA - seenB
  })

  return mastered.slice(0, limit)
}

/**
 * Prepare round data with scrambled columns
 */
export function prepareRoundData(words: Word[]) {
  const englishItems = shuffle(
    words.map(w => ({
      id: `english-${w.id}`,
      wordId: w.id,
      content: w.english,
      type: 'english' as const,
    }))
  )

  const pinyinItems = shuffle(
    words.map(w => ({
      id: `pinyin-${w.id}`,
      wordId: w.id,
      content: w.pinyin,
      type: 'pinyin' as const,
    }))
  )

  const hanziItems = shuffle(
    words.map(w => ({
      id: `hanzi-${w.id}`,
      wordId: w.id,
      content: w.hanzi,
      type: 'hanzi' as const,
    }))
  )

  return { englishItems, pinyinItems, hanziItems }
}
