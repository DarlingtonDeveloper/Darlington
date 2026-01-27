-- Migration: Hanzi Sentences Tables
-- Creates tables for sentence practice mode

-- ============================================================================
-- SENTENCES TABLE - Seeded sentence data
-- ============================================================================
CREATE TABLE IF NOT EXISTS sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chinese TEXT NOT NULL,
  pinyin TEXT NOT NULL,
  english TEXT NOT NULL,
  hsk_level INTEGER DEFAULT 1,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  category TEXT CHECK (category IN (
    'greeting',
    'question',
    'statement',
    'negative',
    'time',
    'location',
    'request'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER SENTENCE PROGRESS - Per-sentence scoring and tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sentence_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sentence_id UUID REFERENCES sentences(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  correct_streak INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ,
  introduced_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, sentence_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sentences_hsk_level ON sentences(hsk_level);
CREATE INDEX IF NOT EXISTS idx_sentences_category ON sentences(category);
CREATE INDEX IF NOT EXISTS idx_sentences_difficulty ON sentences(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_sentence_progress_user ON user_sentence_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sentence_progress_score ON user_sentence_progress(user_id, score);
CREATE INDEX IF NOT EXISTS idx_user_sentence_progress_sentence ON user_sentence_progress(sentence_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sentence_progress ENABLE ROW LEVEL SECURITY;

-- Sentences are readable by everyone (no user-specific data)
CREATE POLICY "Anyone can view sentences" ON sentences
  FOR SELECT USING (true);

-- User sentence progress policies (hardcoded user ID pattern matching existing setup)
CREATE POLICY "Users can view own sentence progress" ON user_sentence_progress
  FOR SELECT USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can insert own sentence progress" ON user_sentence_progress
  FOR INSERT WITH CHECK (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can update own sentence progress" ON user_sentence_progress
  FOR UPDATE USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

-- Comments for documentation
COMMENT ON TABLE sentences IS 'HSK sentences for sentence practice mode';
COMMENT ON TABLE user_sentence_progress IS 'User progress tracking for sentences';
COMMENT ON COLUMN sentences.chinese IS 'Chinese sentence text';
COMMENT ON COLUMN sentences.pinyin IS 'Pinyin romanization with tone marks';
COMMENT ON COLUMN sentences.english IS 'English translation';
COMMENT ON COLUMN sentences.category IS 'Sentence category for filtering';
