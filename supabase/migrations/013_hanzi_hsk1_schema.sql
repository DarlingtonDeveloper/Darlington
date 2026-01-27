-- Migration: Hanzi HSK 1 Schema Updates
-- Adds char_count, word_type, and hsk_level columns to words table

-- Add new columns to words table
ALTER TABLE words
  ADD COLUMN IF NOT EXISTS char_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS word_type TEXT,
  ADD COLUMN IF NOT EXISTS hsk_level INTEGER;

-- Add check constraint for word_type
-- Using a simple approach since constraint may already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'words_word_type_check'
  ) THEN
    ALTER TABLE words ADD CONSTRAINT words_word_type_check
    CHECK (word_type IS NULL OR word_type IN (
      'pronoun_personal',
      'pronoun_demonstrative',
      'pronoun_interrogative',
      'number',
      'quantifier',
      'adverb',
      'conjunction',
      'preposition',
      'auxiliary',
      'interjection',
      'noun',
      'verb',
      'adjective'
    ));
  END IF;
END $$;

-- Add index for word_type queries
CREATE INDEX IF NOT EXISTS idx_words_word_type ON words(word_type);

-- Add index for hsk_level queries
CREATE INDEX IF NOT EXISTS idx_words_hsk_level ON words(hsk_level);

-- Comments for documentation
COMMENT ON COLUMN words.char_count IS 'Number of characters in the word (1 for single characters, 2+ for compounds)';
COMMENT ON COLUMN words.word_type IS 'Grammatical word type classification';
COMMENT ON COLUMN words.hsk_level IS 'HSK level (1-6), NULL for non-HSK words';
