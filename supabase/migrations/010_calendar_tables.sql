-- Migration: Calendar OS tables
-- Description: Creates tables for storing Google OAuth tokens and calendar daily summaries

-- OAuth tokens table for storing Google Calendar API access
CREATE TABLE IF NOT EXISTS user_oauth_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own tokens
CREATE POLICY "Users can manage own tokens" ON user_oauth_tokens
  FOR ALL USING (user_id = auth.uid());

-- Calendar daily summaries for cross-domain analytics
-- Note: Event data is fetched live from Google, only summaries are stored
CREATE TABLE IF NOT EXISTS calendar_daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- Event counts
  total_events INTEGER DEFAULT 0,
  all_day_events INTEGER DEFAULT 0,

  -- Time stats (in hours, decimal)
  meeting_hours DECIMAL(4,2) DEFAULT 0,
  free_hours DECIMAL(4,2) DEFAULT 0,

  -- Schedule shape
  first_event_time TIME,
  last_event_time TIME,
  longest_free_block_hours DECIMAL(4,2),

  -- Metadata
  calendars_included TEXT[],
  synced_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_calendar_summaries_user_date
  ON calendar_daily_summaries(user_id, date);

-- Enable RLS
ALTER TABLE calendar_daily_summaries ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own calendar summaries
CREATE POLICY "Users can manage own calendar summaries"
  ON calendar_daily_summaries
  FOR ALL USING (user_id = auth.uid());
