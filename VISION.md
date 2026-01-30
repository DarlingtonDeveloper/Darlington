# Personal OS - Vision Document

**Last Updated:** January 13, 2026
**Status:** Strategic planning (not yet implemented)

---

## North Star

> "Claude, what should I do next?"

An AI Daily Planner with full context across all life domains - habits, finance, calendar, goals, health, relationships, learning. Value comes from cross-domain patterns, not individual app sophistication.

---

## Goals

1. **Deeper social networks** - Family, friends, and professional relationships
2. **Conversational Mandarin proficiency** - Beyond character recognition to speaking
3. **Improved sleep patterns** - Consistency and quality
4. **Career transitions** - Active job search and skill development
5. **Lose weight / improve metabolic fitness** - Diet, exercise, biomarkers
6. **Learning AI** - Courses, papers, and hands-on projects

---

## System Architecture

### Module Taxonomy

```
HABITS
├── Morning routines
├── Evening routines
├── Productivity
├── Social
├── Anytime
└── Reference links → Health (Diet, Workouts tracked elsewhere)

HEALTH & FITNESS
├── Weight (daily weigh-in)
├── Sleep (Apple Watch via webhook)
├── Diet Signals (daily checkboxes)
├── Workouts (bodyweight sessions)
└── Cardio (Strava sync)

GROWTH & LEARNING
├── Mandarin (Hanzi Linker)
├── AI Learning
│   ├── Courses / Tutorials
│   ├── Papers
│   └── Projects (learning by building)
├── Books
└── Media Queue (intentional podcasts/YouTube)

FINANCE
├── Spending (existing)
├── Budgeting (targets vs actuals)
└── Investing (portfolio tracking)

CAREER
├── Tasks (GTD-style inbox/next actions)
├── Objectives (quarterly goals, OKRs)
└── Interviews (pipeline tracker)

RELATIONSHIPS (standalone, not under Career)
├── Family
├── Friends
└── Professional

CALENDAR
├── Google Calendar integration (existing)
├── Becomes OUTPUT of daily planning
└── Notifications via native calendar reminders
```

---

## AI Daily Planner

The central hub that connects all modules. Replaces the static check-in form with a conversational Claude touchpoint.

### Daily Rhythm

**Morning Check-in (Intention)**
- Duration: ~15 minutes
- Style: Conversational back-and-forth
- Purpose: Set intentions, not rigid schedule

**Evening Check-in (Reflection)**
- Duration: ~15 minutes
- Style: Open questions from Claude
- Purpose: Review day, capture learnings, prep tomorrow

### Data Inputs Claude Considers

| Source | Context |
|--------|---------|
| Calendar | What's already scheduled, free slots |
| Habits | What's due, what's been missed, streaks at risk |
| Health | Workout due? Weight trend? Sleep last night? |
| Relationships | Who's overdue for contact? Birthdays coming? |
| Learning | What's in queue? Papers, courses, books |
| Career | Tasks due? Interview prep needed? |
| Finance | Weekly review due? Budget alerts? |
| Energy | Yesterday's level, pattern recognition |

### Morning Conversation Flow

```
Claude: "Good morning Mike. Here's what I'm seeing...
        
        Yesterday: 24/30 habits (80%)
        Missed: Yoga, 10k steps, Bed by 11
        Sleep: 6.5 hours (below your 7.5 target)
        
        You've had 3 busy days with back-to-back meetings.
        Today looks lighter - good day to catch up on yoga
        and that AI paper in your queue.
        
        Also noticed you haven't spoken to [sister] in 3 weeks.
        
        How are you feeling today?"

You:    "Pretty good actually, slept better than the watch
        says. I have a call at 2pm I forgot to add."

Claude: "Got it - I'll block 2pm for that call. Given your
        energy is good, want to tackle the AI paper this
        morning while you're fresh? I could suggest:
        
        Morning: Deep work (paper + project time)
        Midday: Yoga + lunch
        Afternoon: 2pm call, then lighter tasks
        Evening: Maybe reach out to [sister]?
        
        Does that shape work?"
```

### Flexibility Model

Not "10:00 - Yoga (mandatory)" but intentions with rough placement:

```
TODAY'S INTENTIONS

Must happen:
• Call at 14:00 (1 hr)

Should happen:
• Yoga session (~30 min)
• Read AI paper (~45 min)  
• Reach out to [sister]

If time:
• Review budget
• Clear task inbox

Suggested shape:
┌──────────────────────────────────┐
│ Morning    Deep work / learning  │
│ Midday     Yoga + lunch          │
│ Afternoon  Call, then flexible   │
│ Evening    Wind down by 22:00    │
└──────────────────────────────────┘
```

### Output

Once approved, Claude writes to Google Calendar:
- Habits as time-blocked events
- Learning sessions scheduled
- Relationship touchpoints as reminders
- Workouts with duration

Calendar notifications handle reminders throughout the day - no custom notification system needed.

### Evening Conversation Flow

```
Claude: "Evening, Mike. Let's close out the day.
        
        From this morning's plan:
        ✓ AI paper (done)
        ✓ 2pm call (done)
        ✗ Yoga (skipped)
        ✗ Reach out to [sister] (not yet)
        
        What got in the way of yoga today?"

You:    "The call ran long, then I got pulled into emails"

Claude: "That's the third day this week calls have run over.
        Might be worth adding buffer time after meetings?
        
        For [sister] - want me to carry that forward to
        tomorrow, or is there a better day this week?"
```

---

## Health & Fitness Details

### Diet Signals (not calorie counting)

Binary checkboxes that roll up to a daily score - same pattern as habits:

| Signal | Good = ✓ |
|--------|----------|
| No alcohol | ✓ |
| No snacking | ✓ |
| No sugar/sweets | ✓ |
| No takeaway/junk | ✓ |
| Ate protein with each meal | ✓ |
| Stayed in eating window | ✓ |
| Drank enough water | ✓ |

Daily diet score = X/7

Could live inside Habits OS as a "diet" category, or be its own section in Health. Data model is identical to habit completions.

### Reference Habits Pattern

In Habits OS, health items appear for visibility but completion is tracked in dedicated modules:

```
HEALTH (reference)
├── ○ Workout today → tap opens Health/Workouts
├── ○ Diet on track → tap opens Health/Diet  
└── ○ Weighed in → tap opens Health/Weight
```

Keeps "did I do the healthy things" visible without duplicating data.

### Data Sources

| Component | Current State | Integration Path |
|-----------|--------------|------------------|
| Runs/Cardio | Strava | Strava API |
| Weight | iOS app | Apple Health webhook |
| Gym/Strength | None | Build (bodyweight focus) |
| Diet | None | Build (daily signals) |
| Sleep | Apple Watch | Apple Health webhook |
| Steps | Apple Watch | Apple Health webhook |

---

## Growth & Learning Details

### AI Learning Tracking

Both structured and project-based:

**Courses/Tutorials**
- What you're taking
- Progress percentage
- Notes/takeaways

**Papers**
- Reading queue
- Completed with notes
- Key insights extracted

**Projects**
- Learning by building
- Links to repos
- Skills developed

### Intentional Media Queue

Combat "algorithm slop" by tracking:
- What you intended to watch/listen to
- What you actually consumed
- Time spent intentional vs mindless

---

## Relationships Details

Standalone module (not under Career) - relationships matter beyond professional networking.

### Tracking Per Contact

| Field | Purpose |
|-------|---------|
| Name | Who |
| Type | Family / Friend / Professional |
| Last contact | When did you last connect? |
| Preferred channel | Call, text, in-person? |
| Notes | Context, life events, conversation topics |
| Reminder frequency | Weekly, monthly, quarterly? |

### AI Daily Planner Integration

Claude surfaces:
- "You haven't spoken to [sister] in 3 weeks"
- "It's [friend]'s birthday next week"
- "[Professional contact] - you said you'd follow up after their launch"

### WhatsApp Integration (MCP)

Consolidate all messaging into WhatsApp (move from Instagram DMs, SMS) and integrate via [whatsapp-mcp](https://github.com/lharries/whatsapp-mcp).

**Architecture:**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Claude      │ ──►│ Python MCP Server│ ──►│   Go Bridge     │
│                 │    │    (FastMCP)     │    │   (whatsmeow)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
                              ▼                        ▼
                       ┌──────────────┐         ┌──────────────┐
                       │    SQLite    │◄────────│  WhatsApp    │
                       │  messages.db │         │   Web API    │
                       └──────────────┘         └──────────────┘
```

**MCP Tools Available:**
| Tool | Purpose |
|------|---------|
| `search_contacts` | Find contacts by name/phone |
| `list_messages` | Retrieve messages with filters |
| `send_message` | Send to individuals/groups |
| `send_audio_message` | Voice messages |
| `download_media` | Get media files |

**Use Cases for Personal OS:**

| Use Case | How It Works |
|----------|--------------|
| Auto-populate last contact | Sync message timestamps → relationship tracker |
| AI Daily Planner context | "You haven't messaged [sister] in 3 weeks" |
| Send yourself reminders | Claude sends WhatsApp reminders during the day |
| Message search | "Find that restaurant recommendation from Dave" |
| Conversation summaries | "Summarize my chat with [contact] this week" |
| Consolidate messaging | Move conversations from Instagram/SMS → WhatsApp |

**Setup Requirements:**
- Go + Python installed
- QR code auth (like WhatsApp Web)
- Messages stored locally in SQLite
- Works with Claude Desktop / Claude Code

---

## Technical Architecture

### AI Daily Planner Implementation

**Route:** `/daily` or `/planner`

```
/daily
├── page.tsx (server - loads all context)
├── planner-client.tsx (client - chat UI)
├── /api/daily/chat (Anthropic API endpoint)
├── /api/daily/commit (writes plan to calendar)
└── /api/daily/history (retrieves past sessions)
```

**Supabase tables:**
```sql
daily_sessions (id, user_id, date, type: morning/evening)
daily_messages (session_id, role, content, timestamp)
daily_plans (session_id, intentions, calendar_events_created)
```

**API Cost:** ~$5/month (Sonnet 4.5 at $3/$15 per MTok)
- Morning: ~6k input, ~4k output
- Evening: ~6k input, ~3k output
- Daily total: ~$0.14

**Interface:** Custom chat UI in Next.js (mobile-first)
- Not Cowork (desktop only, file-based, not conversational)
- Not Claude.ai (can't pre-load custom context)

**Notifications:** Google Calendar native reminders
- No custom notification system needed
- Morning planning outputs events with reminder times

---

## Key Design Decisions

1. **Calendar is output, not input** - You don't have an existing calendar to work around. Claude designs optimal days from scratch.

2. **Flexible intentions, not rigid schedules** - "Should happen" with rough time placement, not "10:32 start yoga"

3. **Diet as signals, not calorie counting** - Binary checkboxes sustainable long-term, detailed tracking burns people out

4. **Relationships separate from Career** - Family and friends matter beyond professional networking

5. **Reference habits link to dedicated modules** - Visibility in daily habit list without data duplication

6. **Conversational, not form-based** - 15-minute back-and-forth with Claude, not checkboxes

7. **Cross-domain patterns are the value** - Busy calendar days → lower habit completion? Poor sleep → higher spending? That's the insight layer.

---

## Implementation Priorities

### Foundation (enables everything else)
- [ ] Apple Health webhook (unlocks sleep, steps, weight)
- [ ] Diet signals module
- [ ] Bodyweight workout logging

### AI Daily Planner MVP
- [ ] `/daily` route with chat UI
- [ ] System prompt with full context loading
- [ ] Calendar event creation from plan
- [ ] Session storage for continuity

### Relationship Tracking
- [ ] WhatsApp MCP setup (Go bridge + Python server)
- [ ] Contacts table with last contact dates (auto-populated from WhatsApp)
- [ ] Integration with Daily Planner prompts
- [ ] Consolidate messaging (move Instagram DMs, SMS → WhatsApp)

### Learning Expansion
- [ ] AI learning tracker (courses, papers, projects)
- [ ] Intentional media queue

### Finance Expansion
- [ ] Budgeting (category targets vs actuals)
- [ ] Investing portfolio view

### Career Module
- [ ] Tasks/inbox system
- [ ] Objectives/OKRs
- [ ] Interview pipeline

---

## Success Metrics

**Engagement**
- Daily planner completion rate (morning + evening)
- Cross-domain insight surfacing

**Health**
- Weight trend over time
- Diet signal consistency
- Workout frequency

**Relationships**
- Contacts reached per week
- No one "forgotten" beyond their reminder frequency

**Learning**
- AI learning hours per week
- Intentional vs algorithm media ratio

---

## Appendix: Cowork Evaluation

Evaluated Anthropic's Cowork (launched Jan 12, 2026) for Daily Planner use case.

**Why it doesn't fit:**
- Desktop only (macOS) - need mobile-first
- File-based, not database-aware - can't load Supabase context
- Task-oriented, not conversational - want 15-min back-and-forth
- No pre-loaded personal context - need habits, calendar, health, etc.

**Where Cowork could help (different use cases):**
- File organization tasks
- Report generation from local files
- Slide deck creation from notes

Conclusion: Custom chat UI remains the right choice for AI Daily Planner.