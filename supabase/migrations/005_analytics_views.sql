-- Migration 005: Analytics views for dashboard v2
-- Run this in Supabase SQL Editor

-- ============================================================================
-- View 1: Daily completion rates for Overview tab
-- ============================================================================
CREATE OR REPLACE VIEW daily_completion_rates AS
WITH active_habit_count AS (
  SELECT COUNT(*) as total_habits
  FROM habits
  WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
    AND is_active = true
)
SELECT
  hc.completion_date,
  COUNT(DISTINCT hc.habit_id) as completed_habits,
  ahc.total_habits,
  ROUND(COUNT(DISTINCT hc.habit_id)::numeric / NULLIF(ahc.total_habits, 0) * 100) as completion_rate,
  EXTRACT(DOW FROM hc.completion_date)::integer as day_of_week
FROM habit_completions hc
CROSS JOIN active_habit_count ahc
WHERE hc.user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  AND hc.completion_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY hc.completion_date, ahc.total_habits
ORDER BY hc.completion_date DESC;

-- ============================================================================
-- View 2: Personal records
-- ============================================================================
CREATE OR REPLACE VIEW personal_records AS
WITH daily_totals AS (
  SELECT completion_date, COUNT(DISTINCT habit_id) as habits_completed
  FROM habit_completions
  WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  GROUP BY completion_date
),
weekly_totals AS (
  SELECT DATE_TRUNC('week', completion_date)::date as week_start,
         COUNT(*) as total_completions
  FROM habit_completions
  WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  GROUP BY DATE_TRUNC('week', completion_date)
),
best_day AS (
  SELECT completion_date, habits_completed
  FROM daily_totals
  ORDER BY habits_completed DESC, completion_date DESC
  LIMIT 1
),
best_week AS (
  SELECT week_start, total_completions
  FROM weekly_totals
  ORDER BY total_completions DESC, week_start DESC
  LIMIT 1
)
SELECT
  bd.completion_date as best_day_date,
  bd.habits_completed as best_day_count,
  bw.week_start as best_week_start,
  bw.total_completions as best_week_completions,
  COALESCE((SELECT MAX(current_streak) FROM habit_streaks), 0) as longest_active_streak,
  (SELECT COUNT(*) FROM habit_completions WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281') as total_completions
FROM best_day bd, best_week bw;

-- ============================================================================
-- View 3: Energy correlation (for Insights tab)
-- ============================================================================
CREATE OR REPLACE VIEW energy_correlation AS
SELECT
  ds.energy_level,
  COUNT(DISTINCT ds.summary_date) as days_count,
  ROUND(AVG(ds.completion_percentage)) as avg_completion_rate
FROM daily_summaries ds
WHERE ds.user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  AND ds.energy_level IS NOT NULL
GROUP BY ds.energy_level
ORDER BY CASE ds.energy_level WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 END;

-- ============================================================================
-- View 4: Habit analytics extended (for Habits tab)
-- ============================================================================
CREATE OR REPLACE VIEW habit_analytics_extended AS
WITH daily_completion AS (
  SELECT habit_id, completion_date, MAX(completion_percentage) as pct
  FROM habit_completions
  WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
  GROUP BY habit_id, completion_date
),
habit_stats AS (
  SELECT
    h.id as habit_id,
    h.name as habit_name,
    h.category,
    COUNT(DISTINCT dc.completion_date) as total_completions,
    COUNT(DISTINCT CASE WHEN dc.completion_date >= CURRENT_DATE - 6 THEN dc.completion_date END) as completions_7d,
    COUNT(DISTINCT CASE WHEN dc.completion_date >= CURRENT_DATE - 29 THEN dc.completion_date END) as completions_30d,
    MIN(dc.completion_date) as first_completion
  FROM habits h
  LEFT JOIN daily_completion dc ON h.id = dc.habit_id
  WHERE h.user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
    AND h.is_active = true
  GROUP BY h.id, h.name, h.category
)
SELECT
  hs.*,
  ROUND(hs.completions_7d::numeric / 7 * 100) as rate_7d,
  ROUND(hs.completions_30d::numeric / 30 * 100) as rate_30d
FROM habit_stats hs;

-- ============================================================================
-- Performance indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_completions_date_user ON habit_completions(user_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_summaries_date_user ON daily_summaries(user_id, summary_date);
