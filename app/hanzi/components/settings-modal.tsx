'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface LinkSettings {
  baseDifficulty: number
  wordCount: number
  showDifficultyScore: boolean
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: LinkSettings
  onSave: (settings: LinkSettings) => void
  isSaving?: boolean
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Easy',
  4: 'Easy-Medium',
  5: 'Medium',
  6: 'Medium',
  7: 'Medium-Hard',
  8: 'Hard',
  9: 'Hard',
  10: 'Expert',
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving = false,
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<LinkSettings>(settings)

  // Sync local state when settings prop changes
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

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

  const handleSave = () => {
    onSave(localSettings)
  }

  const hasChanges =
    localSettings.baseDifficulty !== settings.baseDifficulty ||
    localSettings.wordCount !== settings.wordCount ||
    localSettings.showDifficultyScore !== settings.showDifficultyScore

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
              Link Settings
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

          {/* Difficulty Setting */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-sm font-medium text-neutral-300">
                Difficulty
              </label>
              <span className="text-xs text-neutral-500">
                <span className="font-mono tabular-nums text-neutral-400">
                  {localSettings.baseDifficulty}
                </span>
                {' · '}
                {DIFFICULTY_LABELS[localSettings.baseDifficulty]}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={localSettings.baseDifficulty}
              onChange={e =>
                setLocalSettings(s => ({
                  ...s,
                  baseDifficulty: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-neutral-100
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-neutral-900
                [&::-webkit-slider-thumb]:shadow-sm
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-neutral-100
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-neutral-900
                [&::-moz-range-thumb]:shadow-sm"
            />
            <div className="flex justify-between mt-1.5 text-[10px] text-neutral-600 font-mono">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
            <p className="mt-2.5 text-xs text-neutral-500 leading-relaxed">
              Higher difficulty introduces harder words and requires better performance to advance.
            </p>
          </div>

          {/* Word Count Setting */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-sm font-medium text-neutral-300">
                Words on Board
              </label>
              <span className="font-mono tabular-nums text-xs text-neutral-400">
                {localSettings.wordCount}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={8}
              step={1}
              value={localSettings.wordCount}
              onChange={e =>
                setLocalSettings(s => ({
                  ...s,
                  wordCount: parseInt(e.target.value, 10),
                }))
              }
              className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-neutral-100
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-neutral-900
                [&::-webkit-slider-thumb]:shadow-sm
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-neutral-100
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-neutral-900
                [&::-moz-range-thumb]:shadow-sm"
            />
            <div className="flex justify-between mt-1.5 text-[10px] text-neutral-600 font-mono">
              <span>3</span>
              <span>5</span>
              <span>8</span>
            </div>
            <p className="mt-2.5 text-xs text-neutral-500 leading-relaxed">
              Fewer words are easier to track. More words add variety.
            </p>
          </div>

          {/* Debug Option */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={localSettings.showDifficultyScore}
                onChange={e =>
                  setLocalSettings(s => ({
                    ...s,
                    showDifficultyScore: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div
                className={cn(
                  'w-4 h-4 rounded border transition-colors',
                  localSettings.showDifficultyScore
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'bg-neutral-800 border-neutral-700 group-hover:border-neutral-600'
                )}
              >
                {localSettings.showDifficultyScore && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm text-neutral-300 group-hover:text-neutral-200 transition-colors">
                Show difficulty score
              </span>
              <p className="text-xs text-neutral-500 mt-0.5">
                Debug overlay showing board difficulty
              </p>
            </div>
          </label>

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
        </div>

        {/* Safe area padding for iOS */}
        <div className="pb-safe" />
      </div>
    </div>
  )
}
