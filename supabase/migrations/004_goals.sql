-- Migration: Add goals table and goal_habits junction table
-- Run this in Supabase SQL Editor

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal-Habits junction table
CREATE TABLE IF NOT EXISTS goal_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  contribution_weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(goal_id, habit_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goal_habits_goal ON goal_habits(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_habits_habit ON goal_habits(habit_id);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using hardcoded user ID - same pattern as other tables)
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');

CREATE POLICY "Users can view goal habits" ON goal_habits
  FOR SELECT USING (
    goal_id IN (SELECT id FROM goals WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281')
  );

-- Seed goals
INSERT INTO goals (user_id, title, description, display_order)
VALUES
  ('d4f6f192-41ff-4c66-a07a-f9ebef463281', 'Health & Fitness', 'Build consistent exercise and movement habits', 0),
  ('d4f6f192-41ff-4c66-a07a-f9ebef463281', 'Sleep Quality', 'Protect sleep for energy and focus', 1)
ON CONFLICT DO NOTHING;

-- Seed goal_habits for Health & Fitness
INSERT INTO goal_habits (goal_id, habit_id, contribution_weight)
SELECT g.id, h.id, 1
FROM goals g, habits h
WHERE g.title = 'Health & Fitness'
  AND g.user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  AND h.user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  AND h.name IN ('Yoga', 'Physical activity', 'Press-ups', '10k steps', 'Walk after 1 meal')
ON CONFLICT DO NOTHING;

-- Seed goal_habits for Sleep Quality
INSERT INTO goal_habits (goal_id, habit_id, contribution_weight)
SELECT g.id, h.id,
  CASE WHEN h.name = 'Bed by 11pm' THEN 2 ELSE 1 END
FROM goals g, habits h
WHERE g.title = 'Sleep Quality'
  AND g.user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  AND h.user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  AND h.name IN ('Bed by 11pm', 'Wake 7am', 'No phone in bed')
ON CONFLICT DO NOTHING;
