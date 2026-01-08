// Hanzi Linker - Adaptive Word Selection Algorithm

import { Word, WordWithProgress, SCORE_THRESHOLDS, DifficultySettings, DEFAULT_DIFFICULTY_SETTINGS } from './types'
import {
  calculateBoardDifficulty,
  calculateExpectedDifficulty,
  calculateWordTargetDifficulty,
  shouldIntroduceNewWords as checkShouldIntroduceNew,
  weightedDifficultySelect,
  selectWordsForReset,
} from './difficulty'

// Re-export difficulty functions for convenience
export { selectWordsForReset }

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Weighted random selection - words with lower scores have higher weight
function weightedRandomSelect<T extends WordWithProgress>(
  words: T[],
  count: number
): T[] {
  if (words.length <= count) return shuffle(words)

  const selected: T[] = []
  const remaining = [...words]

  while (selected.length < count && remaining.length > 0) {
    // Calculate weights - lower scores get higher weight
    const weights = remaining.map(w => {
      const score = w.progress?.score ?? 0
      // Negative scores get much higher weight
      // Score -3 = weight 16, score 0 = weight 4, score 3 = weight 1, score 6+ = weight 0.5
      if (score < 0) {
        return Math.pow(2, Math.abs(score) + 2)
      }
      return Math.max(0.5, 4 - score)
    })

    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < remaining.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        selected.push(remaining[i])
        remaining.splice(i, 1)
        break
      }
    }
  }

  return selected
}

export interface WordSelectionOptions {
  roundSize?: number
  maxStruggling?: number
  maxLearning?: number
  includeReview?: boolean
  recentlyCompleted?: string[] // Word IDs to exclude (cooldown)
  cooldownCount?: number // How many completions before word can reappear
  sessionScore?: number // Current session score (for performance-based progression)
  // Difficulty system options
  difficultySettings?: DifficultySettings
  useDifficultyTargeting?: boolean
}

// Threshold for considering a word "mastered enough" to unlock new content
const PROGRESSION_THRESHOLD = 3 // Familiar level

/**
 * Select words for continuous play with:
 * - Weighted selection (negative scores appear more often)
 * - Cooldown for recently completed words
 * - Auto-progression to next section when ready
 */
export function selectWordsForRound(
  allWords: WordWithProgress[],
  currentUnit: number,
  options: WordSelectionOptions = {}
): Word[] {
  const {
    roundSize = 4,
    recentlyCompleted = [],
    cooldownCount = 4,
  } = options

  // Get words on cooldown (last N completed)
  const cooldownIds = new Set(recentlyCompleted.slice(0, cooldownCount))

  // Filter to words at or below current unit, excluding cooldown
  let availableWords = allWords.filter(
    w => w.unit <= currentUnit && !cooldownIds.has(w.id)
  )

  // Check if we should introduce words from next section
  // Conditions (any of these):
  // 1. 50%+ of seen words are above progression threshold
  // 2. Session is going well (positive score)
  // 3. Not enough words available
  const seenWords = availableWords.filter(w => w.progress !== null)
  const wordsAboveThreshold = seenWords.filter(
    w => (w.progress?.score ?? 0) >= PROGRESSION_THRESHOLD
  )
  const percentAboveThreshold = seenWords.length > 0
    ? wordsAboveThreshold.length / seenWords.length
    : 0

  const shouldIntroduceNew =
    percentAboveThreshold >= 0.5 || // 50%+ are familiar
    (options.sessionScore !== undefined && options.sessionScore >= 10) || // Doing well
    availableWords.length < roundSize // Need more words

  if (shouldIntroduceNew) {
    // Try to get words from next unit
    const nextUnitWords = allWords.filter(
      w => w.unit === currentUnit + 1 && !cooldownIds.has(w.id)
    )
    if (nextUnitWords.length > 0) {
      // Add some new words from next unit
      const newFromNext = shuffle(nextUnitWords).slice(0, Math.min(2, roundSize))
      availableWords = [...availableWords, ...newFromNext]
    }

    // If still not enough, try even further units
    if (availableWords.length < roundSize) {
      const furtherWords = allWords.filter(
        w => w.unit > currentUnit + 1 && !cooldownIds.has(w.id)
      )
      if (furtherWords.length > 0) {
        const needed = roundSize - availableWords.length
        availableWords = [...availableWords, ...shuffle(furtherWords).slice(0, needed)]
      }
    }
  }

  if (availableWords.length === 0) {
    // If all words are on cooldown, ignore cooldown
    availableWords = allWords.filter(w => w.unit <= currentUnit)
  }

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

  // Priority 1: Struggling words with weighted selection (higher chance for lower scores)
  if (struggling.length > 0) {
    const struggleCount = Math.min(2, struggling.length, roundSize)
    selected.push(...weightedRandomSelect(struggling, struggleCount))
  }

  // Priority 2: Learning words
  if (selected.length < roundSize && learning.length > 0) {
    const learningCount = Math.min(2, learning.length, roundSize - selected.length)
    const learningPicks = weightedRandomSelect(
      learning.filter(w => !selected.includes(w)),
      learningCount
    )
    selected.push(...learningPicks)
  }

  // Priority 3: New words
  if (selected.length < roundSize && newWords.length > 0) {
    const newCount = roundSize - selected.length
    selected.push(...shuffle(newWords).slice(0, newCount))
  }

  // Priority 4: Familiar words
  if (selected.length < roundSize && familiar.length > 0) {
    const familiarCount = roundSize - selected.length
    selected.push(...shuffle(familiar).slice(0, familiarCount))
  }

  // Priority 5: Mastered words if still not enough
  if (selected.length < roundSize && mastered.length > 0) {
    const masteredCount = roundSize - selected.length
    selected.push(...shuffle(mastered).slice(0, masteredCount))
  }

  // Shuffle final selection
  return shuffle(selected)
}

/**
 * Options for difficulty-aware word selection
 */
export interface NextWordOptions {
  excludeIds: Set<string>
  recentlyCompleted?: string[]
  cooldownCount?: number
  sessionScore?: number
  // Difficulty system options
  difficultySettings?: DifficultySettings
  visibleWords?: WordWithProgress[]  // Current words on board (for difficulty calculation)
  useDifficultyTargeting?: boolean   // Enable difficulty-based selection
}

/**
 * Select a single word for replacement with weighted probability.
 *
 * When useDifficultyTargeting is true, considers both:
 * 1. Spaced repetition (struggling words prioritized)
 * 2. Difficulty targeting (select words that help maintain expected difficulty)
 */
export function selectNextWord(
  allWords: WordWithProgress[],
  currentUnit: number,
  excludeIds: Set<string>,
  recentlyCompleted: string[] = [],
  cooldownCount: number = 4,
  sessionScore: number = 0,
  options?: {
    difficultySettings?: DifficultySettings
    visibleWords?: WordWithProgress[]
    useDifficultyTargeting?: boolean
  }
): Word | null {
  const {
    difficultySettings = DEFAULT_DIFFICULTY_SETTINGS,
    visibleWords = [],
    useDifficultyTargeting = false,
  } = options || {}

  // Get words on cooldown
  const cooldownIds = new Set(recentlyCompleted.slice(0, cooldownCount))
  const allExcluded = new Set([...excludeIds, ...cooldownIds])

  // Filter available words
  let available = allWords.filter(
    w => w.unit <= currentUnit && !allExcluded.has(w.id)
  )

  // Calculate difficulty context if using targeting
  let targetDifficulty = 5 // Default moderate
  let shouldIntroduceNew = false

  if (useDifficultyTargeting && visibleWords.length > 0) {
    const boardDiff = calculateBoardDifficulty(visibleWords)
    const expectedDiff = calculateExpectedDifficulty(difficultySettings, sessionScore)

    // Calculate what difficulty we need
    targetDifficulty = calculateWordTargetDifficulty(
      boardDiff.score,
      expectedDiff,
      difficultySettings.wordCount
    )

    // Check if we should introduce new words based on difficulty
    shouldIntroduceNew = checkShouldIntroduceNew(
      available,
      boardDiff.score,
      expectedDiff,
      difficultySettings
    )
  } else {
    // Original logic for non-difficulty mode
    const seenWords = available.filter(w => w.progress !== null)
    const wordsAboveThreshold = seenWords.filter(
      w => (w.progress?.score ?? 0) >= PROGRESSION_THRESHOLD
    )
    const percentAboveThreshold = seenWords.length > 0
      ? wordsAboveThreshold.length / seenWords.length
      : 0

    shouldIntroduceNew =
      percentAboveThreshold >= 0.5 || // 50%+ are familiar
      sessionScore >= 10 || // Doing well
      available.length === 0 // Need more words
  }

  if (shouldIntroduceNew) {
    // Include words from next unit
    const nextUnitWords = allWords.filter(
      w => w.unit === currentUnit + 1 && !allExcluded.has(w.id)
    )
    available = [...available, ...nextUnitWords]
  }

  if (available.length === 0) {
    // Fall back to any word not currently in play
    available = allWords.filter(w => !excludeIds.has(w.id))
  }

  if (available.length === 0) {
    return null
  }

  // Use difficulty-aware selection if enabled
  if (useDifficultyTargeting) {
    return weightedDifficultySelect(available, targetDifficulty)
  }

  // Otherwise use original weighted selection
  const selected = weightedRandomSelect(available, 1)
  return selected[0] || null
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
