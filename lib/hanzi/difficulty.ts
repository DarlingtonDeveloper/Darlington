// Hanzi Linker - Adaptive Difficulty System
//
// Difficulty is derived entirely from USER PERFORMANCE (score history),
// not intrinsic word properties like stroke count. This is intentional:
// - Stroke count matters for writing, less so for recognition
// - Some "simple" characters are abstract and hard; some "complex" ones are intuitive
// - The algorithm learns which characters YOU find hard based on YOUR history

import {
  WordWithProgress,
  DifficultySettings,
  HanziSettings,
  BoardDifficultyResult,
  DivergenceResult,
  DIVERGENCE_THRESHOLDS,
  DEFAULT_DIFFICULTY_SETTINGS,
  DEFAULT_HANZI_SETTINGS,
} from './types'

// ============================================================================
// Word Difficulty Calculation
// ============================================================================

/**
 * Calculate difficulty for a word based purely on user performance.
 *
 * Score ranges map to difficulty (inverse relationship):
 *   score <= -4  → difficulty 10 (very hard for this user)
 *   score -3 to -1 → difficulty 8-10
 *   score 0 to 2  → difficulty 5-7 (learning)
 *   score 3 to 5  → difficulty 2-4 (familiar)
 *   score >= 6    → difficulty 1 (mastered)
 *   unseen (null) → difficulty 6 (unknown, assume moderate)
 */
export function calculateWordDifficulty(word: WordWithProgress): number {
  const score = word.progress?.score ?? null

  // Unseen words: moderate difficulty (we don't know yet)
  if (score === null) {
    return 6
  }

  // Map score to difficulty (inverse relationship)
  // score -6 → difficulty 13 (clamped to 10)
  // score 0  → difficulty 7
  // score +6 → difficulty 1
  const difficulty = 7 - score

  // Clamp to 1-10 range
  return Math.max(1, Math.min(10, difficulty))
}

// ============================================================================
// Board Difficulty Calculation
// ============================================================================

/**
 * Calculate the average difficulty of all visible words on the board.
 */
export function calculateBoardDifficulty(
  visibleWords: WordWithProgress[]
): BoardDifficultyResult {
  if (visibleWords.length === 0) {
    return { score: 5, breakdown: [] }
  }

  const breakdown = visibleWords.map(word => ({
    wordId: word.id,
    difficulty: calculateWordDifficulty(word)
  }))

  const avgDifficulty = breakdown.reduce(
    (sum, b) => sum + b.difficulty,
    0
  ) / breakdown.length

  return {
    score: avgDifficulty,
    breakdown
  }
}

// ============================================================================
// Expected Difficulty Calculation
// ============================================================================

/**
 * Calculate the expected board difficulty based on user settings and game score.
 *
 * Expected difficulty starts from the user's base setting and is modified
 * by their current session performance (game score).
 */
export function calculateExpectedDifficulty(
  settings: DifficultySettings,
  gameScore: number
): number {
  // Base from user setting
  let expected = settings.baseDifficulty

  // Game score modifier:
  // Positive score = doing well = expect higher difficulty
  // Negative score = struggling = expect lower difficulty
  // Every 10 points shifts expected difficulty by 1
  const scoreModifier = gameScore / 10

  expected += scoreModifier

  // Clamp to valid range
  return Math.max(1, Math.min(10, expected))
}

// ============================================================================
// Divergence Detection
// ============================================================================

/**
 * Calculate how far the current board difficulty is from what's expected.
 *
 * Returns severity levels:
 * - normal: Within acceptable range
 * - warning: Slight mismatch (±2.0)
 * - critical: Trigger board reset (±3.5)
 */
export function calculateDivergence(
  boardDifficulty: number,
  expectedDifficulty: number
): DivergenceResult {
  const delta = boardDifficulty - expectedDifficulty
  const absDelta = Math.abs(delta)

  let severity: DivergenceResult['severity'] = 'normal'
  if (absDelta >= DIVERGENCE_THRESHOLDS.CRITICAL) {
    severity = 'critical'
  } else if (absDelta >= DIVERGENCE_THRESHOLDS.WARNING) {
    severity = 'warning'
  }

  return {
    current: boardDifficulty,
    expected: expectedDifficulty,
    delta,
    severity,
    shouldReset: severity === 'critical'
  }
}

// ============================================================================
// Word Selection Helpers
// ============================================================================

/**
 * Calculate what difficulty a new word should ideally be to help
 * move the board toward the expected difficulty.
 */
export function calculateWordTargetDifficulty(
  currentBoardDifficulty: number,
  expectedDifficulty: number,
  wordCount: number
): number {
  // If board is too hard, we need an easier word
  // If board is too easy, we need a harder word
  // The magnitude depends on word count (more words = less impact per word)

  const delta = expectedDifficulty - currentBoardDifficulty
  const impactFactor = wordCount // Higher word count = need bigger adjustment

  // Target difficulty for the new word to help correct the imbalance
  const target = expectedDifficulty + (delta * impactFactor / 2)

  // Clamp to valid range
  return Math.max(1, Math.min(10, target))
}

/**
 * Determine if we should introduce new (unseen) words based on
 * the difficulty delta and current mastery levels.
 *
 * This is based on DIFFICULTY score, not game score.
 */
export function shouldIntroduceNewWords(
  available: WordWithProgress[],
  currentBoardDifficulty: number,
  expectedDifficulty: number,
  settings: DifficultySettings
): boolean {
  // Introduce new words when:
  // 1. Board difficulty is BELOW expected (player needs more challenge)
  // 2. AND difficulty setting is >= 5 (medium or higher)

  const difficultyDelta = expectedDifficulty - currentBoardDifficulty

  if (difficultyDelta > 1 && settings.baseDifficulty >= 5) {
    return true
  }

  // Also introduce if most available words are mastered
  if (available.length === 0) return false

  const masteredRatio = available.filter(
    w => (w.progress?.score ?? 0) >= 6
  ).length / available.length

  return masteredRatio > 0.7 && settings.baseDifficulty >= 4
}

/**
 * Select words for a board reset that match the expected difficulty.
 *
 * Key insight: If expected difficulty is high but all current words are mastered,
 * we need to pull in unseen words from the next unit (difficulty 6) or
 * struggling words (difficulty 8-10).
 */
export function selectWordsForReset(
  allWords: WordWithProgress[],
  currentUnit: number,
  expectedDifficulty: number,
  wordCount: number
): WordWithProgress[] {
  // Start with current unit and below
  const available = allWords.filter(w => w.unit <= currentUnit)

  // Calculate difficulty for each
  const withDifficulty = available.map(w => ({
    word: w,
    difficulty: calculateWordDifficulty(w)
  }))

  // Check if we have enough words near the expected difficulty
  const closeEnough = withDifficulty.filter(
    ({ difficulty }) => Math.abs(difficulty - expectedDifficulty) <= 2
  )

  // If expected difficulty is high (>= 5) and we don't have enough matching words,
  // include unseen words from the next unit (they have difficulty 6)
  if (expectedDifficulty >= 5 && closeEnough.length < wordCount) {
    const nextUnitWords = allWords.filter(w => w.unit === currentUnit + 1)
    const nextUnitWithDiff = nextUnitWords.map(w => ({
      word: w,
      difficulty: calculateWordDifficulty(w) // Will be 6 for unseen
    }))
    withDifficulty.push(...nextUnitWithDiff)
  }

  // If expected difficulty is very high (>= 7) and still not enough,
  // look even further ahead
  if (expectedDifficulty >= 7 && closeEnough.length < wordCount) {
    const futureWords = allWords.filter(w => w.unit > currentUnit + 1)
    const futureWithDiff = futureWords.map(w => ({
      word: w,
      difficulty: calculateWordDifficulty(w)
    }))
    withDifficulty.push(...futureWithDiff)
  }

  if (withDifficulty.length === 0) return []

  // Score by proximity to expected difficulty
  // Use a sharper falloff to more strongly prefer exact matches
  const scored = withDifficulty.map(({ word, difficulty }) => {
    const delta = Math.abs(difficulty - expectedDifficulty)
    // Exponential falloff: exact match = 100, delta 1 = 50, delta 2 = 25, etc.
    const proximityScore = 100 / Math.pow(2, delta)
    return { word, difficulty, proximityScore }
  })

  // Sort by proximity (best matches first)
  scored.sort((a, b) => b.proximityScore - a.proximityScore)

  // Select top N words, but ensure variety by not picking duplicates
  const selected: WordWithProgress[] = []
  const selectedIds = new Set<string>()

  for (const { word } of scored) {
    if (selected.length >= wordCount) break
    if (!selectedIds.has(word.id)) {
      selected.push(word)
      selectedIds.add(word.id)
    }
  }

  // Shuffle for variety
  return shuffle(selected)
}

/**
 * Calculate combined weight for word selection considering both
 * spaced repetition (struggling words) and difficulty targeting.
 *
 * The difficulty weight is now stronger to ensure we actually move
 * toward the target difficulty, not just favor struggling words.
 */
export function calculateSelectionWeight(
  word: WordWithProgress,
  targetDifficulty: number
): number {
  const score = word.progress?.score ?? 0
  const wordDiff = calculateWordDifficulty(word)

  // Spaced repetition weight (existing logic from word-selection.ts)
  let srWeight: number
  if (score < 0) {
    srWeight = Math.pow(2, Math.abs(score) + 2)
  } else {
    srWeight = Math.max(0.5, 4 - score)
  }

  // Difficulty proximity weight - use exponential falloff for stronger targeting
  // Words closer to target difficulty get MUCH higher weight
  const diffDelta = Math.abs(wordDiff - targetDifficulty)
  // Exponential: delta 0 = 16, delta 1 = 8, delta 2 = 4, delta 3 = 2, etc.
  const diffWeight = Math.pow(2, Math.max(0, 4 - diffDelta))

  // Combined weight - multiply, but cap SR weight to prevent it from
  // completely overriding difficulty targeting
  const cappedSrWeight = Math.min(srWeight, 8)
  return cappedSrWeight * diffWeight
}

/**
 * Weighted random selection considering both SR and difficulty.
 */
export function weightedDifficultySelect(
  words: WordWithProgress[],
  targetDifficulty: number
): WordWithProgress | null {
  if (words.length === 0) return null

  const weights = words.map(word => ({
    word,
    weight: calculateSelectionWeight(word, targetDifficulty)
  }))

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
  let random = Math.random() * totalWeight

  for (const { word, weight } of weights) {
    random -= weight
    if (random <= 0) return word
  }

  return words[0]
}

// ============================================================================
// Settings Helpers
// ============================================================================

/**
 * Extract difficulty settings from a HanziProfile, using defaults for null values.
 * Returns DifficultySettings for backward compatibility with existing code.
 */
export function getSettingsFromProfile(profile: {
  base_difficulty: number | null
  word_count: number | null
  show_difficulty_score: boolean | null
} | null): DifficultySettings {
  if (!profile) {
    return DEFAULT_DIFFICULTY_SETTINGS
  }

  return {
    baseDifficulty: profile.base_difficulty ?? DEFAULT_DIFFICULTY_SETTINGS.baseDifficulty,
    wordCount: profile.word_count ?? DEFAULT_DIFFICULTY_SETTINGS.wordCount,
    showDifficultyScore: profile.show_difficulty_score ?? DEFAULT_DIFFICULTY_SETTINGS.showDifficultyScore,
  }
}

/**
 * Extract all hanzi settings from a HanziProfile, using defaults for null values.
 */
export function getHanziSettingsFromProfile(profile: {
  base_difficulty: number | null
  word_count: number | null
  show_difficulty_score: boolean | null
  content_mode: string | null
  input_method: string | null
  view_by: string | null
  content_filter: string | null
} | null): HanziSettings {
  if (!profile) {
    return DEFAULT_HANZI_SETTINGS
  }

  return {
    baseDifficulty: profile.base_difficulty ?? DEFAULT_HANZI_SETTINGS.baseDifficulty,
    wordCount: profile.word_count ?? DEFAULT_HANZI_SETTINGS.wordCount,
    showDifficultyScore: profile.show_difficulty_score ?? DEFAULT_HANZI_SETTINGS.showDifficultyScore,
    contentMode: (profile.content_mode as 'words' | 'sentences') ?? DEFAULT_HANZI_SETTINGS.contentMode,
    inputMethod: (profile.input_method as 'tap' | 'type') ?? DEFAULT_HANZI_SETTINGS.inputMethod,
    viewBy: (profile.view_by as 'units' | 'word_type') ?? DEFAULT_HANZI_SETTINGS.viewBy,
    contentFilter: (profile.content_filter as 'hsk1' | 'all') ?? DEFAULT_HANZI_SETTINGS.contentFilter,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Fisher-Yates shuffle
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
