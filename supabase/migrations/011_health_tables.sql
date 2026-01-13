-- Migration: Health OS tables
-- Description: Creates tables for health tracking (sleep, steps, diet, weight, workouts, screen time)

-- ============================================
-- SLEEP TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS sleep_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sleep_date DATE NOT NULL,

  bedtime TIMESTAMPTZ,
  wake_time TIMESTAMPTZ,

  duration_minutes INTEGER,

  -- Scoring (consistency > duration)
  wake_target_minutes INTEGER DEFAULT 420,  -- 7:00 AM = 420 min from midnight
  duration_target_minutes INTEGER DEFAULT 480, -- 8 hours

  wake_score INTEGER,      -- 0-100, 60% weight
  duration_score INTEGER,  -- 0-100, 40% weight
  total_score INTEGER,     -- weighted average

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, sleep_date)
);

CREATE INDEX IF NOT EXISTS idx_sleep_user_date ON sleep_entries(user_id, sleep_date DESC);

ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sleep_entries" ON sleep_entries
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- STEPS TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS steps_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,

  step_count INTEGER NOT NULL,
  target INTEGER DEFAULT 10000,

  -- Score: capped at 100 when target reached
  score INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN step_count >= target THEN 100
      ELSE ROUND((step_count::DECIMAL / NULLIF(target, 0)) * 100)
    END
  ) STORED,

  source TEXT DEFAULT 'ios_shortcut',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_steps_user_date ON steps_entries(user_id, entry_date DESC);

ALTER TABLE steps_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own steps_entries" ON steps_entries
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- SCREEN TIME / DOOMSCROLL TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS screen_time_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  event_date DATE NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,

  app_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screentime_user_date ON screen_time_events(user_id, event_date DESC);

ALTER TABLE screen_time_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own screen_time_events" ON screen_time_events
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- DIET SIGNALS
-- ============================================
CREATE TABLE IF NOT EXISTS diet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,

  -- 10 diet signals (0-100 each)
  no_alcohol INTEGER DEFAULT 0 CHECK (no_alcohol >= 0 AND no_alcohol <= 100),
  no_snacking INTEGER DEFAULT 0 CHECK (no_snacking >= 0 AND no_snacking <= 100),
  no_sugar INTEGER DEFAULT 0 CHECK (no_sugar >= 0 AND no_sugar <= 100),
  no_junk INTEGER DEFAULT 0 CHECK (no_junk >= 0 AND no_junk <= 100),
  protein_focus INTEGER DEFAULT 0 CHECK (protein_focus >= 0 AND protein_focus <= 100),
  hydration INTEGER DEFAULT 0 CHECK (hydration >= 0 AND hydration <= 100),
  no_late_eating INTEGER DEFAULT 0 CHECK (no_late_eating >= 0 AND no_late_eating <= 100),
  ate_vegetables INTEGER DEFAULT 0 CHECK (ate_vegetables >= 0 AND ate_vegetables <= 100),
  caffeine_cutoff INTEGER DEFAULT 0 CHECK (caffeine_cutoff >= 0 AND caffeine_cutoff <= 100),
  mindful_portions INTEGER DEFAULT 0 CHECK (mindful_portions >= 0 AND mindful_portions <= 100),

  -- Calculated daily score (average of all signals)
  daily_score INTEGER GENERATED ALWAYS AS (
    (COALESCE(no_alcohol, 0) + COALESCE(no_snacking, 0) + COALESCE(no_sugar, 0) +
     COALESCE(no_junk, 0) + COALESCE(protein_focus, 0) + COALESCE(hydration, 0) +
     COALESCE(no_late_eating, 0) + COALESCE(ate_vegetables, 0) +
     COALESCE(caffeine_cutoff, 0) + COALESCE(mindful_portions, 0)) / 10
  ) STORED,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_diet_user_date ON diet_entries(user_id, entry_date DESC);

ALTER TABLE diet_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diet_entries" ON diet_entries
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- WEIGHT TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_user_date ON weight_entries(user_id, recorded_at DESC);

ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight_entries" ON weight_entries
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- WORKOUT TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,

  -- Schedule: which days this template is suggested
  -- [1,2,4,5] = Mon, Tue, Thu, Fri (1=Monday, 7=Sunday)
  scheduled_days INTEGER[] DEFAULT '{}',

  -- Exercises as JSONB array
  -- [{"name": "Push-ups", "type": "reps", "target": 50}, ...]
  exercises JSONB NOT NULL DEFAULT '[]',

  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user ON workout_templates(user_id);

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout_templates" ON workout_templates
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- WORKOUT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  template_name TEXT,

  logged_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER,

  -- Completed exercises
  -- [{"name": "Push-ups", "completed": true, "actual": 50}, ...]
  exercises_completed JSONB NOT NULL DEFAULT '[]',

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workoutlogs_user_date ON workout_logs(user_id, logged_at DESC);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout_logs" ON workout_logs
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- USER HEALTH SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS health_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Steps
  steps_target INTEGER DEFAULT 10000,

  -- Sleep
  wake_target_time TIME DEFAULT '07:00:00',
  sleep_duration_target_hours DECIMAL(3,1) DEFAULT 8.0,

  -- Webhook secret for iOS shortcuts
  webhook_secret TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE health_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own health_settings" ON health_settings
  FOR ALL USING (user_id = auth.uid());
