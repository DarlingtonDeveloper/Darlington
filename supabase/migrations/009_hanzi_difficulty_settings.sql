-- Migration: Hanzi Difficulty Settings
-- Adds user-configurable difficulty settings to hanzi_profiles

-- Add difficulty settings columns
ALTER TABLE hanzi_profiles
  ADD COLUMN IF NOT EXISTS base_difficulty INTEGER DEFAULT 5
    CHECK (base_difficulty >= 1 AND base_difficulty <= 10),
  ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 4
    CHECK (word_count >= 3 AND word_count <= 8),
  ADD COLUMN IF NOT EXISTS show_difficulty_score BOOLEAN DEFAULT false;

-- Comment on columns for documentation
COMMENT ON COLUMN hanzi_profiles.base_difficulty IS 'User difficulty setting 1-10 (1=very easy, 10=expert)';
COMMENT ON COLUMN hanzi_profiles.word_count IS 'Number of words displayed on board (3-8)';
COMMENT ON COLUMN hanzi_profiles.show_difficulty_score IS 'Debug option to show difficulty score overlay';
