'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface GlobalSettings {
  contentMode: 'words' | 'sentences'
  contentFilter: 'hsk1' | 'all'
}

interface GlobalSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSettingsModal({ isOpen, onClose }: GlobalSettingsModalProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [settings, setSettings] = useState<GlobalSettings>({
    contentMode: 'words',
    contentFilter: 'hsk1',
  })
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(settings)

  // Load user and settings on mount
  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('hanzi_profiles')
        .select('content_mode, content_filter')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        const loaded: GlobalSettings = {
          contentMode: (profile.content_mode as 'words' | 'sentences') ?? 'words',
          contentFilter: (profile.content_filter as 'hsk1' | 'all') ?? 'hsk1',
        }
        setSettings(loaded)
        setLocalSettings(loaded)
      }
      setIsLoading(false)
    }

    if (isOpen) {
      loadSettings()
    }
  }, [isOpen, supabase])

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)

    try {
      await supabase
        .from('hanzi_profiles')
        .update({
          content_mode: localSettings.contentMode,
          content_filter: localSettings.contentFilter,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      setSettings(localSettings)
      onClose()
      // Reload page to apply changes
      window.location.reload()
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    localSettings.contentMode !== settings.contentMode ||
    localSettings.contentFilter !== settings.contentFilter

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-sm bg-neutral-900 rounded-t-2xl sm:rounded-xl border border-neutral-800 shadow-xl animate-overlay-in">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-neutral-100 tracking-tight">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-neutral-500">Loading...</div>
          ) : (
            <>
              {/* Content Mode */}
              <div className="mb-6">
                <label className="text-sm font-medium text-neutral-300 mb-3 block">
                  Practice Content
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(s => ({ ...s, contentMode: 'words' }))}
                    className={cn(
                      'py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors',
                      localSettings.contentMode === 'words'
                        ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    )}
                  >
                    Words
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalSettings(s => ({ ...s, contentMode: 'sentences' }))}
                    className={cn(
                      'py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors',
                      localSettings.contentMode === 'sentences'
                        ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    )}
                  >
                    Sentences
                  </button>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Choose between individual words or full sentences
                </p>
              </div>

              {/* Content Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-neutral-300 mb-3 block">
                  Vocabulary Filter
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocalSettings(s => ({ ...s, contentFilter: 'hsk1' }))}
                    className={cn(
                      'py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors',
                      localSettings.contentFilter === 'hsk1'
                        ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    )}
                  >
                    HSK 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalSettings(s => ({ ...s, contentFilter: 'all' }))}
                    className={cn(
                      'py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors',
                      localSettings.contentFilter === 'all'
                        ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    )}
                  >
                    All Content
                  </button>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  All Content includes Duolingo vocabulary not in HSK 1
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-800 text-neutral-300 text-sm font-medium transition-colors hover:bg-neutral-700 active:bg-neutral-750"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className={cn(
                    'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
                    hasChanges && !isSaving
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-650'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  )}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Safe area padding for iOS */}
        <div className="pb-safe" />
      </div>
    </div>
  )
}
