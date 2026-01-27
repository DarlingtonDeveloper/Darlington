-- Migration: Hanzi Profiles Expansion
-- Adds new settings and high score tracking to hanzi_profiles

-- Add new profile settings columns
ALTER TABLE hanzi_profiles
  ADD COLUMN IF NOT EXISTS content_mode TEXT DEFAULT 'words'
    CHECK (content_mode IN ('words', 'sentences')),
  ADD COLUMN IF NOT EXISTS input_method TEXT DEFAULT 'tap'
    CHECK (input_method IN ('tap', 'type')),
  ADD COLUMN IF NOT EXISTS view_by TEXT DEFAULT 'units'
    CHECK (view_by IN ('units', 'word_type')),
  ADD COLUMN IF NOT EXISTS content_filter TEXT DEFAULT 'hsk1'
    CHECK (content_filter IN ('hsk1', 'all'));

-- Add high score tracking columns
ALTER TABLE hanzi_profiles
  ADD COLUMN IF NOT EXISTS review_session_high_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_lifetime_high_score INTEGER DEFAULT 0;

-- Comments for documentation
COMMENT ON COLUMN hanzi_profiles.content_mode IS 'Practice content type: words or sentences';
COMMENT ON COLUMN hanzi_profiles.input_method IS 'Answer input method: tap (multiple choice) or type (keyboard)';
COMMENT ON COLUMN hanzi_profiles.view_by IS 'Organization view: units or word_type';
COMMENT ON COLUMN hanzi_profiles.content_filter IS 'Content filter: hsk1 (HSK 1 only) or all (includes extras)';
COMMENT ON COLUMN hanzi_profiles.review_session_high_score IS 'Best streak in current/last review session';
COMMENT ON COLUMN hanzi_profiles.review_lifetime_high_score IS 'Best streak ever in review mode';
