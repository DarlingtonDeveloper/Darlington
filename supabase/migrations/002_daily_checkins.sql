-- Migration 002: Daily Check-ins
-- Run this in Supabase SQL Editor after 001

-- Create daily check-ins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL,
  yesterday_reflection TEXT,
  today_intention TEXT,
  focus_habit_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON daily_checkins(user_id, checkin_date);

-- RLS policy
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checkins" ON daily_checkins
  FOR ALL USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');
