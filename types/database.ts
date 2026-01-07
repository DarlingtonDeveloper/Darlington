// ============================================================================
// HABITS OS v0.2 - TYPESCRIPT TYPES
// ============================================================================
// Auto-generated types for Supabase database
// Usage: Import into Next.js components for type-safe queries
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: string | null
          target_frequency: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category?: string | null
          target_frequency?: string
          display_order: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: string | null
          target_frequency?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_at: string
          completion_date: string
          completion_percentage: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_at?: string
          completion_date?: string
          completion_percentage?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_at?: string
          completion_date?: string
          completion_percentage?: number
          notes?: string | null
          created_at?: string
        }
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          summary_date: string
          total_habits: number
          completed_count: number
          completion_percentage: number
          energy_level: 'low' | 'medium' | 'high' | null
          day_quality: 'poor' | 'okay' | 'good' | 'excellent' | null
          context_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          summary_date: string
          total_habits?: number
          completed_count?: number
          energy_level?: 'low' | 'medium' | 'high' | null
          day_quality?: 'poor' | 'okay' | 'good' | 'excellent' | null
          context_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          summary_date?: string
          total_habits?: number
          completed_count?: number
          energy_level?: 'low' | 'medium' | 'high' | null
          day_quality?: 'poor' | 'okay' | 'good' | 'excellent' | null
          context_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      habit_streaks: {
        Row: {
          habit_id: string
          habit_name: string
          current_streak: number
        }
      }
      weekly_stats: {
        Row: {
          habit_name: string
          week_start: string
          completions: number
          completion_rate: number
        }
      }
      completion_time_patterns: {
        Row: {
          habit_name: string
          hour_of_day: number
          completion_count: number
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}

// ============================================================================
// HELPER TYPES FOR FRONTEND
// ============================================================================

export type User = Database['public']['Tables']['users']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']
export type DailySummary = Database['public']['Tables']['daily_summaries']['Row']

export type HabitStreak = Database['public']['Views']['habit_streaks']['Row']
export type WeeklyStat = Database['public']['Views']['weekly_stats']['Row']
export type CompletionTimePattern = Database['public']['Views']['completion_time_patterns']['Row']

// Insert types
export type HabitInsert = Database['public']['Tables']['habits']['Insert']
export type CompletionInsert = Database['public']['Tables']['habit_completions']['Insert']
export type SummaryInsert = Database['public']['Tables']['daily_summaries']['Insert']

// Update types
export type HabitUpdate = Database['public']['Tables']['habits']['Update']
export type CompletionUpdate = Database['public']['Tables']['habit_completions']['Update']
export type SummaryUpdate = Database['public']['Tables']['daily_summaries']['Update']

// ============================================================================
// EXTENDED TYPES FOR FRONTEND LOGIC
// ============================================================================

export interface HabitWithCompletion extends Habit {
  completed_today: boolean
  completion_id?: string
  completion_time?: string
  completion_percentage?: number
  completion_notes?: string | null
  streak?: number
}

export interface DailyProgress {
  date: string
  completed: number
  total: number
  percentage: number
  habits: HabitWithCompletion[]
  energy_level?: 'low' | 'medium' | 'high'
  day_quality?: 'poor' | 'okay' | 'good' | 'excellent'
  context_notes?: string
}

export interface WeeklyProgress {
  week_start: string
  days: DailyProgress[]
  weekly_completion_rate: number
  best_day: string
  worst_day: string
}

export interface HabitAnalytics {
  habit_id: string
  habit_name: string
  total_completions: number
  current_streak: number
  longest_streak: number
  completion_rate_7d: number
  completion_rate_30d: number
  best_completion_hour: number
  typical_completion_time: string
}

// ============================================================================
// SUPABASE CLIENT QUERY HELPERS
// ============================================================================

/**
 * Example usage in Next.js component:
 * 
 * import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
 * import type { Database } from '@/types/database'
 * 
 * const supabase = createClientComponentClient<Database>()
 * 
 * // Type-safe query
 * const { data: habits } = await supabase
 *   .from('habits')
 *   .select('*')
 *   .eq('user_id', userId)
 *   .order('display_order')
 */

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface TodayResponse {
  habits: HabitWithCompletion[]
  summary: DailySummary | null
  completion_rate: number
}

export interface StreaksResponse {
  streaks: HabitStreak[]
}

export interface AnalyticsResponse {
  weekly_stats: WeeklyStat[]
  time_patterns: CompletionTimePattern[]
  top_habits: HabitAnalytics[]
}

// ============================================================================
// ANALYTICS DASHBOARD V2 TYPES
// ============================================================================

export interface DailyCompletionRate {
  completion_date: string
  completed_habits: number
  total_habits: number
  completion_rate: number
  day_of_week: number
}

export interface PersonalRecords {
  best_day_date: string | null
  best_day_count: number
  best_week_start: string | null
  best_week_completions: number
  longest_active_streak: number
  total_completions: number
}

export interface EnergyCorrelation {
  energy_level: 'low' | 'medium' | 'high'
  days_count: number
  avg_completion_rate: number
}

export interface HabitAnalyticsExtended {
  habit_id: string
  habit_name: string
  category: string | null
  total_completions: number
  completions_7d: number
  completions_30d: number
  rate_7d: number
  rate_30d: number
  first_completion: string | null
}
