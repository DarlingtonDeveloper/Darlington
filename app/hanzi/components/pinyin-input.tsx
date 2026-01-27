'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PinyinInputProps {
  onSubmit: (pinyin: string) => void
  disabled?: boolean
  autoFocus?: boolean
  placeholder?: string
}

// Convert numbered pinyin to tone marks
// e.g., "shui3" -> "shuǐ", "ma1" -> "mā"
function pinyinNumberedToToneMarks(input: string): string {
  const toneMarks: Record<string, string[]> = {
    a: ['ā', 'á', 'ǎ', 'à', 'a'],
    e: ['ē', 'é', 'ě', 'è', 'e'],
    i: ['ī', 'í', 'ǐ', 'ì', 'i'],
    o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
    u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
    ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
  }

  // Handle 'v' as 'ü' (common keyboard substitution)
  const normalized = input.toLowerCase().replace(/v/g, 'ü')

  // Match pinyin syllable with tone number (1-5, 5 is neutral)
  const match = normalized.match(/^([a-züA-ZÜ]+)([1-5])?$/)
  if (!match) return normalized

  const syllable = match[1]
  const tone = match[2] ? parseInt(match[2]) - 1 : 4 // Default to neutral tone (index 4)

  // Find the vowel to place the tone mark on
  // Rules: a and e always take the mark
  // In "ou", o takes the mark
  // Otherwise, the second vowel takes it
  let result = syllable
  const vowels = ['a', 'e', 'i', 'o', 'u', 'ü']

  // Find positions of vowels
  const vowelPositions: { char: string; index: number }[] = []
  for (let i = 0; i < syllable.length; i++) {
    const char = syllable[i]
    if (vowels.includes(char)) {
      vowelPositions.push({ char, index: i })
    }
  }

  if (vowelPositions.length === 0) return result

  // Determine which vowel gets the tone mark
  let targetIndex = 0
  if (vowelPositions.length === 1) {
    targetIndex = vowelPositions[0].index
  } else {
    // a and e always take the mark
    const aOrE = vowelPositions.find(v => v.char === 'a' || v.char === 'e')
    if (aOrE) {
      targetIndex = aOrE.index
    } else if (syllable.includes('ou')) {
      // In "ou", o takes the mark
      targetIndex = vowelPositions.find(v => v.char === 'o')?.index ?? vowelPositions[1].index
    } else {
      // Otherwise, second vowel takes it
      targetIndex = vowelPositions[1].index
    }
  }

  const targetChar = syllable[targetIndex]
  const replacement = toneMarks[targetChar]?.[tone] ?? targetChar
  result = syllable.slice(0, targetIndex) + replacement + syllable.slice(targetIndex + 1)

  return result
}

export function PinyinInput({ onSubmit, disabled, autoFocus, placeholder = 'Type pinyin...' }: PinyinInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto focus on mount and when re-enabled
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoFocus, disabled])

  const handleSubmit = useCallback(() => {
    if (value.trim() && !disabled) {
      // Submit the raw value (numbered pinyin for matching)
      onSubmit(value.trim().toLowerCase())
      setValue('')
    }
  }, [value, disabled, onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  // Display with tone marks for visual feedback
  const displayValue = pinyinNumberedToToneMarks(value)

  return (
    <div className="flex flex-col gap-3">
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-neutral-900 text-neutral-100 text-lg font-mono text-center',
            'placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500',
            'transition-colors',
            disabled
              ? 'border-neutral-800 opacity-50 cursor-not-allowed'
              : 'border-neutral-700 hover:border-neutral-600'
          )}
        />
        {/* Preview of tone marks */}
        {value && displayValue !== value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
            {displayValue}
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-neutral-500">
        Press Enter to submit
      </p>
    </div>
  )
}
