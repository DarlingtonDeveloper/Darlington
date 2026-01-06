-- Migration 001: Add partial completions and notes support
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vufdabwdnpmxmgugzric/sql

-- Add completion_percentage column (default 100 for full completion)
ALTER TABLE habit_completions
  ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 100
  CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Update existing completions to have 100%
UPDATE habit_completions
SET completion_percentage = 100
WHERE completion_percentage IS NULL;

-- Note: 'notes' column already exists in the table
