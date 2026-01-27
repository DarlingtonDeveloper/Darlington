-- Migration: Split highscores into 4 separate columns
-- Replace single review_lifetime_high_score with mode-specific columns

-- Add new highscore columns
ALTER TABLE hanzi_profiles
  ADD COLUMN IF NOT EXISTS high_score_words_tap INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS high_score_words_type INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS high_score_sentences_tap INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS high_score_sentences_type INTEGER DEFAULT 0;

-- Migrate existing data: copy review_lifetime_high_score to words_tap (the default mode)
UPDATE hanzi_profiles
SET high_score_words_tap = COALESCE(review_lifetime_high_score, 0)
WHERE review_lifetime_high_score IS NOT NULL AND review_lifetime_high_score > 0;

-- Add comments for documentation
COMMENT ON COLUMN hanzi_profiles.high_score_words_tap IS 'Best streak in review mode: words + tap input';
COMMENT ON COLUMN hanzi_profiles.high_score_words_type IS 'Best streak in review mode: words + typing input';
COMMENT ON COLUMN hanzi_profiles.high_score_sentences_tap IS 'Best streak in review mode: sentences + tap input';
COMMENT ON COLUMN hanzi_profiles.high_score_sentences_type IS 'Best streak in review mode: sentences + typing input';
