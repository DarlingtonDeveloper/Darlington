'use client'

import { useState, useCallback } from 'react'
import type { HealthSettings } from './page'
import type { WorkoutTemplate } from '../workouts/page'

interface SettingsClientProps {
  initialSettings: HealthSettings | null
  templates: WorkoutTemplate[]
  userId: string
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-800/40">
      <div>
        <div className="font-medium text-neutral-50">{label}</div>
        {description && <div className="text-sm text-neutral-500">{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

export function SettingsClient({
  initialSettings,
  templates: initialTemplates,
}: SettingsClientProps) {
  const [settings, setSettings] = useState<Partial<HealthSettings>>(
    initialSettings || {
      steps_target: 10000,
      wake_target_time: '07:00:00',
      sleep_duration_target_hours: 8,
      webhook_secret: null,
    }
  )
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(initialTemplates)
  const [isSaving, setIsSaving] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')

  const saveSettings = useCallback(
    async (updates: Partial<HealthSettings> & { generate_new_secret?: boolean }) => {
      setIsSaving(true)
      try {
        const response = await fetch('/api/health/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })

        if (!response.ok) throw new Error('Failed to save')

        const { data } = await response.json()
        setSettings(data)
      } catch (error) {
        console.error('Error saving settings:', error)
        alert('Failed to save settings')
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  const handleGenerateSecret = useCallback(async () => {
    if (
      settings.webhook_secret &&
      !confirm(
        'This will invalidate your existing webhook secret. Your iOS Shortcuts will need to be updated. Continue?'
      )
    ) {
      return
    }
    await saveSettings({ generate_new_secret: true })
  }, [settings.webhook_secret, saveSettings])

  const handleCreateTemplate = useCallback(async () => {
    if (!newTemplateName.trim()) return

    try {
      const response = await fetch('/api/health/workouts/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName,
          exercises: [
            { name: 'Stretches', type: 'duration', target: 10, unit: 'min' },
            { name: 'Push-ups', type: 'reps', target: 20 },
            { name: 'Squats', type: 'reps', target: 20 },
            { name: 'Plank', type: 'duration', target: 60, unit: 'sec' },
          ],
          scheduled_days: [1, 2, 3, 4, 5, 6], // Mon-Sat
        }),
      })

      if (!response.ok) throw new Error('Failed to create')

      const { data } = await response.json()
      setTemplates((prev) => [...prev, data])
      setNewTemplateName('')
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Failed to create template')
    }
  }, [newTemplateName])

  const handleDeleteTemplate = useCallback(async (id: string) => {
    if (!confirm('Delete this template?')) return

    try {
      const response = await fetch(`/api/health/workouts/templates?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
    }
  }, [])

  const webhookBaseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/health/webhook`
      : 'https://darlington.dev/api/health/webhook'

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto pb-safe">
      {/* Header */}
      <div className="py-6">
        <h1 className="text-lg font-semibold text-neutral-50">Health Settings</h1>
        <p className="text-sm text-neutral-500">Configure targets and integrations</p>
      </div>

      {/* Targets Section */}
      <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-neutral-800/40">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Targets
          </h3>
        </div>
        <div className="px-4">
          <SettingRow label="Daily Steps" description="Goal for step count">
            <input
              type="number"
              value={settings.steps_target || 10000}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 10000
                setSettings((prev) => ({ ...prev, steps_target: value }))
              }}
              onBlur={() => saveSettings({ steps_target: settings.steps_target })}
              className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-right font-mono text-neutral-50"
            />
          </SettingRow>

          <SettingRow label="Wake Time" description="Target wake time for sleep scoring">
            <input
              type="time"
              value={settings.wake_target_time?.slice(0, 5) || '07:00'}
              onChange={(e) => {
                const value = e.target.value + ':00'
                setSettings((prev) => ({ ...prev, wake_target_time: value }))
              }}
              onBlur={() => saveSettings({ wake_target_time: settings.wake_target_time })}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded font-mono text-neutral-50"
            />
          </SettingRow>

          <SettingRow label="Sleep Duration" description="Target hours of sleep">
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="4"
                max="12"
                value={settings.sleep_duration_target_hours || 8}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 8
                  setSettings((prev) => ({ ...prev, sleep_duration_target_hours: value }))
                }}
                onBlur={() =>
                  saveSettings({ sleep_duration_target_hours: settings.sleep_duration_target_hours })
                }
                className="w-20 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-right font-mono text-neutral-50"
              />
              <span className="text-neutral-500">hrs</span>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* Webhook Section */}
      <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-neutral-800/40">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            iOS Shortcuts Integration
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="text-sm text-neutral-400 mb-2">Webhook Secret</div>
            {settings.webhook_secret ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-neutral-800 rounded font-mono text-xs text-neutral-300 overflow-hidden">
                  {showSecret ? settings.webhook_secret : '••••••••••••••••••••••••'}
                </code>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-sm text-neutral-300"
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No secret generated yet</p>
            )}
            <button
              onClick={handleGenerateSecret}
              disabled={isSaving}
              className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm text-neutral-300"
            >
              {settings.webhook_secret ? 'Regenerate Secret' : 'Generate Secret'}
            </button>
          </div>

          <div>
            <div className="text-sm text-neutral-400 mb-2">Webhook URLs</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Morning (wake time)</div>
                <code className="block px-3 py-2 bg-neutral-800 rounded font-mono text-xs text-neutral-400 break-all">
                  {webhookBaseUrl}/morning
                </code>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Evening (bedtime + steps)</div>
                <code className="block px-3 py-2 bg-neutral-800 rounded font-mono text-xs text-neutral-400 break-all">
                  {webhookBaseUrl}/evening
                </code>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800/40">
            <p className="text-xs text-neutral-600">
              Use these URLs in iOS Shortcuts. Include the webhook secret in your POST body as
              &ldquo;secret&rdquo;.
            </p>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800/40">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Workout Templates
          </h3>
        </div>

        {templates.length > 0 && (
          <div className="divide-y divide-neutral-800/40">
            {templates.map((template) => (
              <div key={template.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-neutral-50">{template.name}</div>
                  <div className="text-xs text-neutral-500">
                    {template.exercises.length} exercises
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-neutral-800/40">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="New template name"
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-50 placeholder:text-neutral-600"
            />
            <button
              onClick={handleCreateTemplate}
              disabled={!newTemplateName.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 disabled:text-neutral-500 rounded text-white"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-neutral-600 mt-2">
            Creates a template with default exercises. Edit exercises later.
          </p>
        </div>
      </div>
    </div>
  )
}
