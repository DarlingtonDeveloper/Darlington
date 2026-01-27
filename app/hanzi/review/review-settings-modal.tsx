'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ReviewSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentInputMethod: 'tap' | 'type'
  onInputMethodChange: (method: 'tap' | 'type') => void
}

export function ReviewSettingsModal({
  isOpen,
  onClose,
  userId,
  currentInputMethod,
  onInputMethodChange,
}: ReviewSettingsModalProps) {
  const supabase = createClient()
  const [localInputMethod, setLocalInputMethod] = useState<'tap' | 'type'>(currentInputMethod)
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state when prop changes
  useEffect(() => {
    setLocalInputMethod(currentInputMethod)
  }, [currentInputMethod])

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
    setIsSaving(true)
    try {
      await supabase
        .from('hanzi_profiles')
        .update({
          input_method: localInputMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      onInputMethodChange(localInputMethod)
      onClose()
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = localInputMethod !== currentInputMethod

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
              Review Settings
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

          {/* Input Method */}
          <div className="mb-6">
            <label className="text-sm font-medium text-neutral-300 mb-3 block">
              Input Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalInputMethod('tap')}
                className={cn(
                  'py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors',
                  localInputMethod === 'tap'
                    ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                )}
              >
                Tap
              </button>
              <button
                type="button"
                onClick={() => setLocalInputMethod('type')}
                className={cn(
                  'py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors',
                  localInputMethod === 'type'
                    ? 'bg-emerald-600/20 border-emerald-600 text-emerald-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                )}
              >
                Type Pinyin
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Tap mode shows multiple choice. Type mode lets you practice typing pinyin with tone numbers.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
