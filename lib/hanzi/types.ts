// Hanzi Linker - TypeScript Types

// ============================================================================
// Database Types
// ============================================================================

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
  englishId: string
  pinyinId: string
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

export function getScoreChange(mode: GameMode, wasCorrect: boolean): number {
  switch (mode) {
    case 'link':
      return wasCorrect ? 1 : -1
    case 'lesson':
      return wasCorrect ? 1 : 0 // No penalty for "still hard"
    case 'review':
      return wasCorrect ? 1 : -2 // Mastered words should be known
    default:
      return 0
  }
}
