'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import type { WorkoutTemplate, Exercise } from './page'
import type { WorkoutLog } from '../page'

interface WorkoutsClientProps {
  initialDate: string
  templates: WorkoutTemplate[]
  todayLogs: WorkoutLog[]
  recentLogs: WorkoutLog[]
  userId: string
}

function ExerciseItem({
  exercise,
  completed,
  onToggle,
}: {
  exercise: Exercise
  completed: boolean
  onToggle: () => void
}) {
  const targetLabel =
    exercise.type === 'duration'
      ? `${exercise.target} ${exercise.unit || 'sec'}`
      : `${exercise.target} reps`

  return (
    <button
      onClick={onToggle}
      className={`
        w-full flex items-center justify-between p-3
        border-b border-neutral-800/40 last:border-b-0
        transition-colors
        ${completed ? 'bg-emerald-900/20' : 'active:bg-neutral-800/30'}
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center
            ${completed ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-600'}
          `}
        >
          {completed && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="text-left">
          <div className={`font-medium ${completed ? 'text-emerald-400' : 'text-neutral-50'}`}>
            {exercise.name}
          </div>
          {exercise.notes && (
            <div className="text-xs text-neutral-500">{exercise.notes}</div>
          )}
        </div>
      </div>
      <div className="font-mono text-sm text-neutral-500">{targetLabel}</div>
    </button>
  )
}

function TemplateCard({
  template,
  isCompleted,
  onStart,
}: {
  template: WorkoutTemplate
  isCompleted: boolean
  onStart: () => void
}) {
  return (
    <button
      onClick={onStart}
      disabled={isCompleted}
      className={`
        w-full text-left p-4 rounded-lg border transition-colors
        ${
          isCompleted
            ? 'bg-emerald-900/20 border-emerald-800/40'
            : 'bg-neutral-900/50 border-neutral-800/60 hover:border-neutral-700 active:bg-neutral-800/50'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-neutral-50'}`}>
            {template.name}
          </div>
          <div className="text-sm text-neutral-500">
            {template.exercises.length} exercises
          </div>
        </div>
        {isCompleted && (
          <div className="text-emerald-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}

export function WorkoutsClient({
  initialDate,
  templates,
  todayLogs,
  recentLogs,
}: WorkoutsClientProps) {
  const [activeTemplate, setActiveTemplate] = useState<WorkoutTemplate | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [logs, setLogs] = useState<WorkoutLog[]>(todayLogs)

  const todayLabel = format(new Date(initialDate), 'EEEE, MMMM d')
  const todayDayOfWeek = new Date(initialDate).getDay() || 7 // Convert 0 (Sunday) to 7

  // Filter templates scheduled for today
  const todayTemplates = templates.filter(
    (t) => t.scheduled_days.length === 0 || t.scheduled_days.includes(todayDayOfWeek)
  )

  // Check which templates are already completed today
  const completedTemplateIds = new Set(logs.map((l) => l.template_id))

  const handleStartWorkout = useCallback((template: WorkoutTemplate) => {
    setActiveTemplate(template)
    setCompletedExercises(new Set())
  }, [])

  const handleToggleExercise = useCallback((index: number) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  const handleCompleteWorkout = useCallback(async () => {
    if (!activeTemplate) return

    setIsSaving(true)

    try {
      const exercisesCompleted = activeTemplate.exercises.map((ex, i) => ({
        name: ex.name,
        completed: completedExercises.has(i),
        target: ex.target,
      }))

      const response = await fetch('/api/health/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: activeTemplate.id,
          template_name: activeTemplate.name,
          exercises_completed: exercisesCompleted,
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      const { data } = await response.json()
      setLogs((prev) => [data, ...prev])
      setActiveTemplate(null)
      setCompletedExercises(new Set())
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Failed to save workout')
    } finally {
      setIsSaving(false)
    }
  }, [activeTemplate, completedExercises])

  // Active workout view
  if (activeTemplate) {
    const allCompleted = completedExercises.size === activeTemplate.exercises.length

    return (
      <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto pb-safe">
        {/* Header */}
        <div className="py-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-50">{activeTemplate.name}</h1>
            <p className="text-sm text-neutral-500">
              {completedExercises.size}/{activeTemplate.exercises.length} completed
            </p>
          </div>
          <button
            onClick={() => setActiveTemplate(null)}
            className="text-neutral-500 hover:text-neutral-400"
          >
            Cancel
          </button>
        </div>

        {/* Progress */}
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{
              width: `${(completedExercises.size / activeTemplate.exercises.length) * 100}%`,
            }}
          />
        </div>

        {/* Exercises */}
        <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden mb-6">
          {activeTemplate.exercises.map((exercise, index) => (
            <ExerciseItem
              key={index}
              exercise={exercise}
              completed={completedExercises.has(index)}
              onToggle={() => handleToggleExercise(index)}
            />
          ))}
        </div>

        {/* Complete Button */}
        <button
          onClick={handleCompleteWorkout}
          disabled={isSaving}
          className={`
            w-full py-4 rounded-lg font-medium transition-colors
            ${
              allCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }
          `}
        >
          {isSaving ? 'Saving...' : allCompleted ? 'Complete Workout' : 'Finish Early'}
        </button>
      </div>
    )
  }

  // Template selection view
  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto pb-safe">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-lg font-semibold text-neutral-50">Workouts</h1>
        <p className="text-sm text-neutral-500">{todayLabel}</p>
      </div>

      {/* Today's Workout Status */}
      <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-neutral-50">
              {logs.length}
            </div>
            <div className="text-sm text-neutral-500">workouts today</div>
          </div>
          {logs.length > 0 && (
            <div className="text-emerald-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Templates */}
      {todayTemplates.length > 0 ? (
        <div className="space-y-2 mb-6">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 px-1">
            Today&apos;s Workouts
          </h3>
          {todayTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isCompleted={completedTemplateIds.has(template.id)}
              onStart={() => handleStartWorkout(template)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-6">
          <div className="text-neutral-500 mb-2">No templates scheduled for today</div>
          <div className="text-xs text-neutral-600">
            Create a template to get started
          </div>
        </div>
      )}

      {/* All Templates */}
      {templates.length > todayTemplates.length && (
        <div className="space-y-2 mb-6">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 px-1">
            Other Templates
          </h3>
          {templates
            .filter((t) => !todayTemplates.includes(t))
            .map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isCompleted={completedTemplateIds.has(template.id)}
                onStart={() => handleStartWorkout(template)}
              />
            ))}
        </div>
      )}

      {/* Recent History */}
      {recentLogs.length > 0 && (
        <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800/40">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Recent Workouts
            </h3>
          </div>
          <div className="divide-y divide-neutral-800/40">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-50">{log.template_name || 'Workout'}</div>
                  <div className="text-xs text-neutral-500">
                    {format(new Date(log.logged_at), 'EEE, MMM d · h:mm a')}
                  </div>
                </div>
                <div className="text-emerald-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-8">
          <div className="text-neutral-500 mb-4">No workout templates yet</div>
          <p className="text-xs text-neutral-600 mb-4">
            Templates can be created via Settings
          </p>
        </div>
      )}
    </div>
  )
}
