-- Migration: Hanzi Linker - Core Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- WORDS TABLE - Seeded character data
-- ============================================================================
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hanzi TEXT NOT NULL,
  pinyin TEXT NOT NULL,                    -- With tone marks: shuǐ
  pinyin_numbered TEXT NOT NULL,           -- Numeric tones: shui3
  english TEXT NOT NULL,
  tone INTEGER NOT NULL CHECK (tone BETWEEN 1 AND 5),  -- 5 = neutral
  stroke_count INTEGER NOT NULL,
  section INTEGER NOT NULL DEFAULT 1,
  unit INTEGER NOT NULL,
  unit_name TEXT,
  category TEXT CHECK (category IN ('introduced', 'reused')),
  difficulty INTEGER DEFAULT 1,
  mnemonic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER WORD PROGRESS - Per-word scoring and tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_word_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,                  -- Can go negative
  attempts INTEGER DEFAULT 0,
  correct_streak INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ,
  introduced_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, word_id)
);

-- ============================================================================
-- HANZI PROFILES - User progression and stats
-- ============================================================================
CREATE TABLE IF NOT EXISTS hanzi_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_section INTEGER DEFAULT 1,
  current_unit INTEGER DEFAULT 1,
  total_words_seen INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  mastered_count INTEGER DEFAULT 0,         -- score >= 6
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GAME SESSIONS - Session tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('link', 'lesson', 'review')),
  section INTEGER,
  unit INTEGER,
  words_attempted INTEGER DEFAULT 0,
  words_correct INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_words_section_unit ON words(section, unit);
CREATE INDEX IF NOT EXISTS idx_words_hanzi ON words(hanzi);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_user ON user_word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_score ON user_word_progress(user_id, score);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_word ON user_word_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_hanzi_profiles_user ON hanzi_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hanzi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Words are readable by everyone (no user-specific data)
CREATE POLICY "Anyone can view words" ON words
  FOR SELECT USING (true);

-- User word progress policies (hardcoded user ID pattern)
CREATE POLICY "Users can view own word progress" ON user_word_progress
  FOR SELECT USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can insert own word progress" ON user_word_progress
  FOR INSERT WITH CHECK (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can update own word progress" ON user_word_progress
  FOR UPDATE USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

-- Hanzi profiles policies
CREATE POLICY "Users can view own hanzi profile" ON hanzi_profiles
  FOR SELECT USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can insert own hanzi profile" ON hanzi_profiles
  FOR INSERT WITH CHECK (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can update own hanzi profile" ON hanzi_profiles
  FOR UPDATE USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

-- Game sessions policies
CREATE POLICY "Users can view own game sessions" ON game_sessions
  FOR SELECT USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can insert own game sessions" ON game_sessions
  FOR INSERT WITH CHECK (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can update own game sessions" ON game_sessions
  FOR UPDATE USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');
