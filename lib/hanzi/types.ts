// Hanzi Linker - TypeScript Types

// ============================================================================
// Database Types
// ============================================================================

export type WordType =
  | 'pronoun_personal'
  | 'pronoun_demonstrative'
  | 'pronoun_interrogative'
  | 'number'
  | 'quantifier'
  | 'adverb'
  | 'conjunction'
  | 'preposition'
  | 'auxiliary'
  | 'interjection'
  | 'noun'
  | 'verb'
  | 'adjective'

export type SentenceCategory =
  | 'greeting'
  | 'question'
  | 'statement'
  | 'negative'
  | 'time'
  | 'location'
  | 'request'

export interface Word {
  id: string
  hanzi: string
  pinyin: string
  pinyin_numbered: string
  english: string
  tone: number
  stroke_count: number
  section: number
  unit: number
  unit_name: string | null
  category: 'introduced' | 'reused' | null
  difficulty: number | null
  mnemonic: string | null
  char_count: number
  word_type: WordType | null
  hsk_level: number | null
  created_at: string
}

export interface UserWordProgress {
  id: string
  user_id: string
  word_id: string
  score: number
  attempts: number
  correct_streak: number
  last_seen: string | null
  introduced_at: string
  updated_at: string
}

export interface Sentence {
  id: string
  chinese: string
  pinyin: string
  english: string
  hsk_level: number
  difficulty: number
  category: SentenceCategory | null
  created_at: string
}

export interface UserSentenceProgress {
  id: string
  user_id: string
  sentence_id: string
  score: number
  attempts: number
  correct_streak: number
  last_seen: string | null
  introduced_at: string
  updated_at: string
}

export interface SentenceWithProgress extends Sentence {
  progress: UserSentenceProgress | null
  status: WordStatus
}

export interface HanziProfile {
  id: string
  user_id: string
  current_section: number
  current_unit: number
  total_words_seen: number
  total_correct: number
  mastered_count: number
  current_streak: number
  longest_streak: number
  last_practice_date: string | null
  // Difficulty settings
  base_difficulty: number | null
  word_count: number | null
  show_difficulty_score: boolean | null
  // HSK 1 expansion settings
  content_mode: 'words' | 'sentences' | null
  input_method: 'tap' | 'type' | null
  view_by: 'units' | 'word_type' | null
  content_filter: 'hsk1' | 'all' | null
  // High scores
  review_session_high_score: number | null
  review_lifetime_high_score: number | null
  created_at: string
  updated_at: string
}

export interface GameSession {
  id: string
  user_id: string
  mode: GameMode
  section: number | null
  unit: number | null
  words_attempted: number
  words_correct: number
  duration_seconds: number | null
  created_at: string
}

// ============================================================================
// Game Types
// ============================================================================

export type GameMode = 'link' | 'lesson' | 'review'

export type WordStatus = 'struggling' | 'learning' | 'familiar' | 'mastered'

export interface WordWithProgress extends Word {
  progress: UserWordProgress | null
  status: WordStatus
}

// ============================================================================
// Link Mode Types
// ============================================================================

export type ColumnType = 'english' | 'pinyin' | 'hanzi'

export interface LinkItem {
  id: string
  wordId: string
  content: string
  type: ColumnType
}

export interface Connection {
  englishId: string | null
  pinyinId: string | null
  hanziId: string | null
  wordId: string
  isComplete: boolean
  isCorrect: boolean | null // null = not yet validated
}

export interface RoundResult {
  wordId: string
  wasCorrect: boolean
  responseTimeMs?: number
}

export interface LinkGameState {
  words: Word[]
  englishItems: LinkItem[]
  pinyinItems: LinkItem[]
  hanziItems: LinkItem[]
  connections: Connection[]
  selectedItem: LinkItem | null
  pendingConnection: Partial<Connection> | null
  isSubmitted: boolean
  results: RoundResult[]
}

// ============================================================================
// Lesson Mode Types
// ============================================================================

export interface LessonState {
  words: WordWithProgress[]
  currentIndex: number
  showingAnswer: boolean
}

// ============================================================================
// Stats Types
// ============================================================================

export interface UnitProgress {
  section: number
  unit: number
  unitName: string
  totalWords: number
  wordsSeen: number
  mastered: number
  familiar: number
  learning: number
  struggling: number
  isUnlocked: boolean
  isComplete: boolean
}

export interface OverallStats {
  totalWordsLearned: number
  masteredCount: number
  familiarCount: number
  learningCount: number
  strugglingCount: number
  currentStreak: number
  longestStreak: number
  totalSessions: number
  accuracy: number
}

// ============================================================================
// Score Thresholds
// ============================================================================

export const SCORE_THRESHOLDS = {
  STRUGGLING_MAX: -1,  // score < 0
  LEARNING_MIN: 0,
  LEARNING_MAX: 2,     // score 0-2
  FAMILIAR_MIN: 3,
  FAMILIAR_MAX: 5,     // score 3-5
  MASTERED_MIN: 6,     // score >= 6
} as const

// ============================================================================
// Helper Functions
// ============================================================================

export function getWordStatus(score: number): WordStatus {
  if (score < SCORE_THRESHOLDS.LEARNING_MIN) return 'struggling'
  if (score <= SCORE_THRESHOLDS.LEARNING_MAX) return 'learning'
  if (score <= SCORE_THRESHOLDS.FAMILIAR_MAX) return 'familiar'
  return 'mastered'
}

// ============================================================================
// Difficulty System Types
// ============================================================================

export interface DifficultySettings {
  baseDifficulty: number    // 1-10, user setting
  wordCount: number         // 3-8, user setting
  showDifficultyScore: boolean  // Debug option
}

export interface HanziSettings {
  baseDifficulty: number
  wordCount: number
  showDifficultyScore: boolean
  contentMode: 'words' | 'sentences'
  inputMethod: 'tap' | 'type'
  viewBy: 'units' | 'word_type'
  contentFilter: 'hsk1' | 'all'
}

export const DEFAULT_DIFFICULTY_SETTINGS: DifficultySettings = {
  baseDifficulty: 5,
  wordCount: 4,
  showDifficultyScore: false,
}

export const DEFAULT_HANZI_SETTINGS: HanziSettings = {
  baseDifficulty: 5,
  wordCount: 4,
  showDifficultyScore: false,
  contentMode: 'words',
  inputMethod: 'tap',
  viewBy: 'units',
  contentFilter: 'hsk1',
}

// Word type labels for UI display
export const WORD_TYPE_LABELS: Record<WordType, string> = {
  pronoun_personal: 'Personal Pronouns',
  pronoun_demonstrative: 'Demonstrative Pronouns',
  pronoun_interrogative: 'Interrogative Pronouns',
  number: 'Numbers',
  quantifier: 'Quantifiers',
  adverb: 'Adverbs',
  conjunction: 'Conjunctions',
  preposition: 'Prepositions',
  auxiliary: 'Auxiliary Particles',
  interjection: 'Interjections',
  noun: 'Nouns',
  verb: 'Verbs',
  adjective: 'Adjectives',
}

// Sentence category labels for UI display
export const SENTENCE_CATEGORY_LABELS: Record<SentenceCategory, string> = {
  greeting: 'Greetings',
  question: 'Questions',
  statement: 'Statements',
  negative: 'Negatives',
  time: 'Time Expressions',
  location: 'Location',
  request: 'Requests & Offers',
}

export interface BoardDifficultyResult {
  score: number             // 1-10 scale
  breakdown: {
    wordId: string
    difficulty: number
  }[]
}

export type DivergenceSeverity = 'normal' | 'warning' | 'critical'

export interface DivergenceResult {
  current: number           // Board difficulty score
  expected: number          // Expected difficulty
  delta: number            // current - expected (positive = too hard)
  severity: DivergenceSeverity
  shouldReset: boolean
}

export const DIVERGENCE_THRESHOLDS = {
  WARNING: 2.0,
  CRITICAL: 3.5,
} as const

export type ResetPhase = 'shake' | 'fade-out' | 'fade-in' | null
export type ResetReason = 'too-easy' | 'too-hard'

export interface BoardResetState {
  isResetting: boolean
  phase: ResetPhase
  reason: ResetReason | null
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getScoreChange(mode: GameMode, wasCorrect: boolean, currentScore: number = 0): number {
  switch (mode) {
    case 'link': {
      if (wasCorrect) {
        // Reward scales with how negative the score is (struggling words give more)
        // Score -5 → +3, Score -3 → +2, Score 0+ → +1
        if (currentScore <= -4) return 3
        if (currentScore <= -2) return 2
        return 1
      } else {
        // Penalty scales with how positive the score is (should know better)
        // Score 6+ → -3, Score 3-5 → -2, Score <3 → -1
        if (currentScore >= SCORE_THRESHOLDS.MASTERED_MIN) return -3
        if (currentScore >= SCORE_THRESHOLDS.FAMILIAR_MIN) return -2
        return -1
      }
    }
    case 'lesson':
      return wasCorrect ? 1 : 0 // No penalty for "still hard"
    case 'review': {
      // Review mode: mastered words should be known
      if (wasCorrect) return 1
      // Bigger penalty for forgetting mastered words
      if (currentScore >= SCORE_THRESHOLDS.MASTERED_MIN) return -3
      return -2
    }
    default:
      return 0
  }
}
