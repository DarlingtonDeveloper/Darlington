-- Migration: Add habit steps support
-- Run this in Supabase SQL Editor

-- Create habit_steps table (template for each habit's sub-steps)
CREATE TABLE IF NOT EXISTS habit_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_id, display_order)
);

-- Create habit_step_completions table (daily completion tracking per step)
CREATE TABLE IF NOT EXISTS habit_step_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES habit_steps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  completion_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(step_id, user_id, completion_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_steps_habit ON habit_steps(habit_id);
CREATE INDEX IF NOT EXISTS idx_step_completions_date ON habit_step_completions(step_id, user_id, completion_date);

-- Enable RLS
ALTER TABLE habit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_step_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using hardcoded user ID - same pattern as other tables)
CREATE POLICY "Users can view habit steps" ON habit_steps
  FOR SELECT USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281')
  );

CREATE POLICY "Users can manage step completions" ON habit_step_completions
  FOR ALL USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

-- Seed Yoga habit steps
INSERT INTO habit_steps (habit_id, name, display_order, duration_seconds)
SELECT
  h.id,
  s.step_name,
  s.step_order,
  s.duration
FROM habits h
CROSS JOIN (VALUES
  ('Sun salutation A (5x)', 0, 300),
  ('Sun salutation B (5x)', 1, 300),
  ('Standing poses', 2, 600),
  ('Balance poses', 3, 300),
  ('Seated poses', 4, 600),
  ('Hip openers', 5, 600),
  ('Backbends', 6, 300),
  ('Savasana', 7, 300)
) AS s(step_name, step_order, duration)
WHERE h.name = 'Yoga'
  AND h.user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
ON CONFLICT DO NOTHING;
