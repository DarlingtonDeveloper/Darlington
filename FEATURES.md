# Habits OS - Feature Specification

**Version:** 0.3
**Date:** January 7, 2025
**Author:** Darlington + Claude

---

## Overview

This document specifies the next set of features for Habits OS, prioritized for solo user impact. Features are grouped into tiers based on development order.

### Current State
- 30 habits with categories (morning, anytime, productivity, social, evening)
- Daily completion tracking with timestamps
- Progress bar and completion percentage
- Energy level selector
- Daily summary notes
- Analytics views in Supabase (streaks, weekly stats, patterns)

### Goals
- Increase daily engagement through reflection ritual
- Reduce friction in habit tracking
- Enable partial progress tracking
- Support complex habits (multi-step)
- Build foundation for AI-powered suggestions

---

## Tier 1: Core Experience Improvements

### 1.1 Partial Completions

**Problem:** Habits are binary (done/not done), but real life has partial progress. Did 25 pushups instead of 50? Currently counts as failure.

**Solution:** Allow percentage-based completion tracking.

#### User Stories
- As a user, I want to log partial completion (e.g., 50%) when I don't fully complete a habit
- As a user, I want to see my partial completions reflected in analytics
- As a user, I want partial completions to count toward my daily progress proportionally

#### Data Model Changes

```sql
ALTER TABLE habit_completions
  ADD COLUMN completion_percentage INTEGER DEFAULT 100
  CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
```

#### UI Changes

**On habit tap (completion flow):**
```
┌─────────────────────────────────────┐
│  Push-ups                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━            │
│                                     │
│  How much did you complete?         │
│                                     │
│  [25%] [50%] [75%] [100% ✓]         │
│                                     │
│  Or tap again to mark incomplete    │
└─────────────────────────────────────┘
```

**Quick complete:** Single tap = 100% (current behavior)
**Partial complete:** Long press or second tap = show percentage options

**Display changes:**
- Partial completions show with reduced opacity or partial fill
- "Completed at X" becomes "50% at X"
- Progress bar counts partials proportionally (e.g., 50% completion = 0.5 toward total)

#### Completion Calculation

```typescript
// Current
const percentage = (completedCount / totalCount) * 100

// New
const completionSum = habits.reduce((sum, h) => {
  if (!h.completed_today) return sum
  return sum + (h.completion_percentage / 100)
}, 0)
const percentage = (completionSum / totalCount) * 100
```

---

### 1.2 Habit Notes

**Problem:** When you miss or partially complete a habit, there's no way to capture why. Context is lost.

**Solution:** Optional note field on completions.

#### User Stories
- As a user, I want to add a quick note when completing/skipping a habit
- As a user, I want to see my notes in the daily check-in review
- As a user, I want to search/filter notes to find patterns

#### Data Model Changes

```sql
ALTER TABLE habit_completions
  ADD COLUMN note TEXT;
```

#### UI Changes

**On completion (optional expansion):**
```
┌─────────────────────────────────────┐
│  ✓ Push-ups completed               │
│                                     │
│  Add note (optional)                │
│  ┌─────────────────────────────────┐│
│  │ Only managed 30, shoulder sore  ││
│  └─────────────────────────────────┘│
│                                     │
│  [Done]                             │
└─────────────────────────────────────┘
```

**In habit list:** Small note icon if note exists, expandable on tap.

---

### 1.3 Daily Check-in

**Problem:** No structured reflection or intention-setting ritual. Just a list of habits with no context about yesterday or focus for today.

**Solution:** Daily check-in flow that reviews yesterday and sets today's focus.

#### User Stories
- As a user, I want to see a summary of yesterday's completions when I open the app
- As a user, I want to reflect on why I missed certain habits
- As a user, I want to set 1-3 focus habits for today
- As a user, I want to write a brief intention for the day
- As a user, I want to see my focus habits highlighted throughout the day

#### Data Model

```sql
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  checkin_date DATE NOT NULL,

  -- Yesterday reflection
  yesterday_reflection TEXT,

  -- Today planning
  today_intention TEXT,
  focus_habit_ids UUID[], -- Array of 1-3 habit IDs

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, checkin_date)
);

-- Index for quick lookups
CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, checkin_date);
```

#### UI Flow

**Route:** `/habits/checkin`

**Step 1: Yesterday Review**
```
┌─────────────────────────────────────┐
│  DAILY CHECK-IN                     │
│  Wednesday, Jan 8                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  📊 YESTERDAY                       │
│  Tuesday, Jan 7                     │
│                                     │
│  Completed: 24/30 (80%)             │
│  ████████████████░░░░               │
│                                     │
│  ✅ Strong:                         │
│     Morning routine      10/10      │
│     Productivity         4/5        │
│                                     │
│  ❌ Missed:                         │
│     • Bed by 11pm                   │
│     • Yoga                          │
│     • 10k steps                     │
│                                     │
│  Any notes from yesterday:          │
│     • Push-ups: "shoulder sore"     │
│                                     │
│                        [Continue →] │
└─────────────────────────────────────┘
```

**Step 2: Reflection**
```
┌─────────────────────────────────────┐
│  REFLECT                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  What got in the way yesterday?     │
│  (optional)                         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Late work call ran until 10pm, ││
│  │ then scrolled Twitter instead  ││
│  │ of winding down                 ││
│  └─────────────────────────────────┘│
│                                     │
│                        [Continue →] │
└─────────────────────────────────────┘
```

**Step 3: Today's Focus**
```
┌─────────────────────────────────────┐
│  TODAY'S FOCUS                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  Pick 1-3 habits to prioritize:     │
│                                     │
│  SUGGESTED (missed yesterday):      │
│  ┌─────────────────────────────────┐│
│  │ ◉ Bed by 11pm                   ││
│  │ ○ Yoga                          ││
│  │ ○ 10k steps                     ││
│  └─────────────────────────────────┘│
│                                     │
│  OTHER HABITS:                      │
│  ┌─────────────────────────────────┐│
│  │ ○ Morning sunlight              ││
│  │ ○ Duolingo                      ││
│  │ ○ Project work 30 min           ││
│  │   ...                           ││
│  └─────────────────────────────────┘│
│                                     │
│                        [Continue →] │
└─────────────────────────────────────┘
```

**Step 4: Intention**
```
┌─────────────────────────────────────┐
│  SET INTENTION                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  One line for today:                │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Protect my sleep tonight no     ││
│  │ matter what                      ││
│  └─────────────────────────────────┘│
│                                     │
│                    [Start Day →]    │
└─────────────────────────────────────┘
```

**After check-in:** Redirect to `/habits` with focus habits highlighted (star icon, top of list, or subtle glow).

#### Logic

**When to show check-in:**
- First visit of the day AND no check-in exists for today
- Can also access via button/link anytime

**Yesterday's data:**
```typescript
// Get yesterday's date
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
const yesterdayStr = yesterday.toISOString().split('T')[0]

// Query completions
const { data: completions } = await supabase
  .from('habit_completions')
  .select('*, habits(name, category)')
  .eq('user_id', USER_ID)
  .eq('completion_date', yesterdayStr)
```

**Suggested focus habits:**
1. Habits missed yesterday
2. Habits with declining streaks (if analytics available)
3. Habits with lowest 7-day completion rate

---

## Tier 2: Enhanced Experience

### 2.1 What's Next Button

**Problem:** Decision fatigue. Looking at 30 habits and deciding what to do next is overwhelming.

**Solution:** Smart suggestion for the next habit to complete.

#### User Stories
- As a user, I want a "What's Next?" button that tells me what to do
- As a user, I want suggestions to prioritize my focus habits
- As a user, I want suggestions to respect time of day (morning habits in morning)

#### UI

**On main habits page:**
```
┌─────────────────────────────────────┐
│  WHAT'S NEXT?                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🎯 Yoga                            │
│     Today's focus • Usually 10am   │
│                                     │
│  [Complete] [Skip for now]          │
│                                     │
│  Up after: Knee mobility            │
└─────────────────────────────────────┘
```

**Collapsed state (floating button):**
```
┌──────────────────┐
│  ▶ What's Next?  │
└──────────────────┘
```

#### Logic

```typescript
function getNextHabit(
  habits: Habit[],
  completions: Completion[],
  focusHabitIds: string[],
  currentHour: number
): Habit | null {

  // Filter to incomplete habits
  const incomplete = habits.filter(h =>
    !completions.find(c => c.habit_id === h.id)
  )

  if (incomplete.length === 0) return null

  // Determine current time bucket
  const timeBucket =
    currentHour < 12 ? 'morning' :
    currentHour < 17 ? 'anytime' : 'evening'

  // Score each habit
  const scored = incomplete.map(habit => {
    let score = 0

    // Focus habits get highest priority
    if (focusHabitIds.includes(habit.id)) score += 100

    // Time-appropriate habits score higher
    if (habit.category === timeBucket) score += 50
    if (habit.category === 'anytime') score += 25

    // Respect display order as tiebreaker
    score -= habit.display_order * 0.1

    return { habit, score }
  })

  // Return highest scored
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.habit || null
}
```

---

### 2.2 Multi-Step Habits

**Problem:** Some habits have sub-components (yoga poses, workout exercises, morning routine steps). Currently no way to track these.

**Solution:** Allow habits to have ordered sub-steps.

#### User Stories
- As a user, I want to define steps within a habit (e.g., yoga poses)
- As a user, I want to check off steps individually
- As a user, I want the parent habit to auto-complete when all steps are done
- As a user, I want to see my progress through steps

#### Data Model

```sql
CREATE TABLE habit_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER, -- Optional: expected duration
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_id, display_order)
);

CREATE TABLE habit_step_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_completion_id UUID REFERENCES habit_completions(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES habit_steps(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_completion_id, step_id)
);

-- Index for quick lookups
CREATE INDEX idx_steps_habit ON habit_steps(habit_id);
CREATE INDEX idx_step_completions ON habit_step_completions(habit_completion_id);
```

#### UI

**Habit with steps (collapsed):**
```
┌─────────────────────────────────────┐
│  ◐ Yoga                    3/8 ▼   │
│     └ Sun salutation ✓             │
└─────────────────────────────────────┘
```

**Habit with steps (expanded):**
```
┌─────────────────────────────────────┐
│  ◐ Yoga                    3/8 ▲   │
├─────────────────────────────────────┤
│  ✓ Sun salutation A (5x)           │
│  ✓ Sun salutation B (5x)           │
│  ✓ Standing poses                  │
│  ○ Balance poses                   │
│  ○ Seated poses                    │
│  ○ Hip openers                     │
│  ○ Backbends                       │
│  ○ Savasana                        │
├─────────────────────────────────────┤
│  [Complete All]                    │
└─────────────────────────────────────┘
```

#### Behavior
- Tapping a step toggles its completion
- Parent habit shows partial indicator (◐) when some steps done
- Parent habit auto-completes (●) when all steps done
- "Complete All" button marks remaining steps done
- Steps are reusable templates (same steps every day)

#### Example Data

```sql
-- Yoga habit steps
INSERT INTO habit_steps (habit_id, name, display_order, duration_seconds) VALUES
('yoga-habit-uuid', 'Sun salutation A (5x)', 0, 300),
('yoga-habit-uuid', 'Sun salutation B (5x)', 1, 300),
('yoga-habit-uuid', 'Standing poses', 2, 600),
('yoga-habit-uuid', 'Balance poses', 3, 300),
('yoga-habit-uuid', 'Seated poses', 4, 600),
('yoga-habit-uuid', 'Hip openers', 5, 600),
('yoga-habit-uuid', 'Backbends', 6, 300),
('yoga-habit-uuid', 'Savasana', 7, 300);
```

---

## Tier 3: Extended Features

### 3.1 Goals Table

**Problem:** Habits exist in isolation. No connection to bigger "why" or measurable outcomes.

**Solution:** Goals that habits contribute toward.

#### Data Model

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goal_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  contribution_weight INTEGER DEFAULT 1, -- How much this habit contributes

  UNIQUE(goal_id, habit_id)
);

CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goal_habits_goal ON goal_habits(goal_id);
```

#### Example

```
Goal: "Run a marathon by October"
├── Run 3x/week (weight: 3)
├── Strength training (weight: 2)
├── Stretch daily (weight: 1)
└── Sleep 8 hours (weight: 2)

Progress: Based on habit completion rates
```

---

### 3.2 Apple Watch Webhook

**Problem:** Some habits could be tracked automatically (steps, exercise, sleep) but require manual entry.

**Solution:** iOS Shortcuts that POST to a Supabase Edge Function.

#### Architecture

```
Apple Watch → Health App → iOS Shortcut (automation)
                                ↓
                         POST to Edge Function
                                ↓
                         Supabase habit_completions
```

#### Edge Function

```typescript
// supabase/functions/webhook-health/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { habit_name, value, date, secret } = await req.json()

  // Validate secret
  if (secret !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Find habit by name
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .ilike('name', `%${habit_name}%`)
    .single()

  if (!habit) {
    return new Response('Habit not found', { status: 404 })
  }

  // Upsert completion
  const { error } = await supabase
    .from('habit_completions')
    .upsert({
      habit_id: habit.id,
      user_id: 'd4f6f192-41ff-4c66-a07a-f9ebef463281',
      completion_date: date || new Date().toISOString().split('T')[0],
      completion_percentage: value || 100,
      completed_at: new Date().toISOString(),
      note: 'Auto-logged from Apple Watch'
    }, {
      onConflict: 'habit_id,user_id,completion_date'
    })

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 })
  }

  return new Response('OK', { status: 200 })
})
```

#### iOS Shortcut

```
Name: "Log Steps"
Trigger: Daily at 10pm (automation)

Actions:
1. Get Health Sample (Steps, today)
2. If steps >= 10000:
   3. Get Contents of URL
      - URL: https://your-project.supabase.co/functions/v1/webhook-health
      - Method: POST
      - Body: {
          "habit_name": "10k steps",
          "value": 100,
          "secret": "your-secret"
        }
```

---

### 3.3 AI What's Next (Enhanced)

**Problem:** Basic "What's Next" uses simple rules. Could be smarter with context.

**Solution:** LLM-powered suggestions considering energy, time, patterns.

#### Enhanced Logic

```typescript
async function getAINextHabit(context: {
  incomplete: Habit[],
  focusHabits: string[],
  energyLevel: 'low' | 'medium' | 'high',
  currentTime: Date,
  recentPatterns: {
    habitId: string,
    usualTime: string,
    successRate: number
  }[]
}): Promise<{ habit: Habit, reason: string }> {

  const prompt = `
    Given these incomplete habits: ${context.incomplete.map(h => h.name).join(', ')}

    User's focus habits today: ${context.focusHabits.join(', ')}
    Current energy level: ${context.energyLevel}
    Current time: ${context.currentTime.toLocaleTimeString()}

    Historical patterns:
    ${context.recentPatterns.map(p =>
      `- ${p.habitId}: usually done at ${p.usualTime}, ${p.successRate}% success rate`
    ).join('\n')}

    Which ONE habit should they do next and why? Be brief.
  `

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }]
  })

  // Parse response
  return parseAIResponse(response, context.incomplete)
}
```

---

### 3.4 Habit Stacking

**Problem:** Habits work better when chained together, but no explicit support for "after X, do Y".

**Solution:** Define explicit habit sequences.

#### Data Model

```sql
CREATE TABLE habit_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL, -- e.g., "Morning Routine"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_stack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID REFERENCES habit_stacks(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,

  UNIQUE(stack_id, position)
);
```

#### UI

```
┌─────────────────────────────────────┐
│  MORNING STACK                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  1. ✓ Wake 7am                      │
│     ↓                               │
│  2. ✓ Morning sunlight              │
│     ↓                               │
│  3. ○ No phone in bed    ← YOU ARE  │
│     ↓                       HERE    │
│  4. ○ Shower                        │
│     ↓                               │
│  5. ○ Teeth morning                 │
│                                     │
│  Progress: 2/5                      │
└─────────────────────────────────────┘
```

---

## Implementation Notes

### API Endpoints Needed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/habits/complete` | POST | Complete a habit (with partial %, note) |
| `/api/habits/checkin` | GET | Get yesterday's data for check-in |
| `/api/habits/checkin` | POST | Save today's check-in |
| `/api/habits/next` | GET | Get next suggested habit |
| `/api/habits/[id]/steps` | GET | Get steps for a habit |
| `/api/habits/[id]/steps/complete` | POST | Complete a step |
| `/api/webhook/health` | POST | Apple Watch webhook |

### Component Structure

```
app/
├── habits/
│   ├── page.tsx              # Main habits list
│   ├── habits-client.tsx     # Client component
│   ├── checkin/
│   │   └── page.tsx          # Daily check-in flow
│   └── analytics/
│       └── page.tsx          # Analytics dashboard
components/
├── habits/
│   ├── HabitCard.tsx         # Single habit display
│   ├── HabitSteps.tsx        # Multi-step expansion
│   ├── WhatsNext.tsx         # Next suggestion card
│   ├── PartialComplete.tsx   # Percentage selector
│   └── CheckinFlow.tsx       # Check-in wizard
```

### Migration Order

1. **Schema migrations first** (partial completions, notes, checkins table, steps tables)
2. **Tier 1 features** in order listed
3. **Tier 2 features** after Tier 1 stable
4. **Tier 3 features** as time permits

---

## Success Metrics

### Engagement
- Daily check-in completion rate
- Average habits completed per day
- Streak lengths

### Quality
- Use of partial completions (indicates flexibility helps)
- Use of habit notes (indicates reflection happening)
- Focus habit completion rate vs non-focus

### Technical
- Page load time < 1s
- Completion action < 200ms
- Zero data loss

---

## Open Questions

1. **Check-in timing:** Should it block access to habits until completed, or just prompt?
2. **Partial completion UI:** Long-press vs double-tap vs expand menu?
3. **Multi-step habits:** Create through UI or seed via SQL initially?
4. **Focus habits:** How many? Fixed at 3 or flexible 1-5?

---

## Appendix: Example SQL Migrations

### Migration 001: Partial Completions and Notes

```sql
-- Add partial completion and notes to habit_completions
ALTER TABLE habit_completions
  ADD COLUMN completion_percentage INTEGER DEFAULT 100
    CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  ADD COLUMN note TEXT;

-- Update existing completions to have 100%
UPDATE habit_completions SET completion_percentage = 100 WHERE completion_percentage IS NULL;
```

### Migration 002: Daily Check-ins

```sql
-- Create daily check-ins table
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  checkin_date DATE NOT NULL,
  yesterday_reflection TEXT,
  today_intention TEXT,
  focus_habit_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, checkin_date)
);

CREATE INDEX idx_checkins_user_date ON daily_checkins(user_id, checkin_date);

-- RLS policy
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checkins" ON daily_checkins
  FOR ALL USING (user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281');
```

### Migration 003: Habit Steps

```sql
-- Create habit steps table
CREATE TABLE habit_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_id, display_order)
);

CREATE TABLE habit_step_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_completion_id UUID REFERENCES habit_completions(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES habit_steps(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_completion_id, step_id)
);

CREATE INDEX idx_steps_habit ON habit_steps(habit_id);
CREATE INDEX idx_step_completions ON habit_step_completions(habit_completion_id);

-- RLS policies
ALTER TABLE habit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_step_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view habit steps" ON habit_steps
  FOR SELECT USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281')
  );

CREATE POLICY "Users can manage step completions" ON habit_step_completions
  FOR ALL USING (
    habit_completion_id IN (
      SELECT id FROM habit_completions WHERE user_id = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
    )
  );
```
