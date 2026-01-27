'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  WordWithProgress,
  HanziProfile,
  Word,
  Connection,
  LinkItem,
  HanziSettings,
  ResetPhase,
  ResetReason,
  WordType,
} from '@/lib/hanzi/types'
import { getScoreChange, getWordStatus } from '@/lib/hanzi/types'
import { selectWordsForRound, selectNextWord, prepareRoundData, selectWordsForReset } from '@/lib/hanzi/word-selection'
import {
  calculateBoardDifficulty,
  calculateExpectedDifficulty,
  calculateDivergence,
  getHanziSettingsFromProfile,
} from '@/lib/hanzi/difficulty'
import { LinkGame } from './components/link-game'
import { UnitSelector } from './components/unit-selector'
import { WordTypeSelector } from './components/word-type-selector'
import { SettingsModal } from './components/settings-modal'

interface HanziClientProps {
  initialWords: WordWithProgress[]
  initialProfile: HanziProfile | null
  currentUnit: number
  currentSection: number
  userId: string
}

export function HanziClient({
  initialWords,
  initialProfile,
  currentUnit: initialUnit,
  userId,
}: HanziClientProps) {
  const supabase = createClient()
  const [words, setWords] = useState<WordWithProgress[]>(initialWords)
  const [currentUnit, setCurrentUnit] = useState(initialUnit)

  // Track which word IDs are currently in play
  const [activeWordIds, setActiveWordIds] = useState<Set<string>>(new Set())

  // Track recently completed words for cooldown (most recent first)
  const [recentlyCompleted, setRecentlyCompleted] = useState<string[]>([])
  const COOLDOWN_COUNT = 4

  // Game state
  const [englishItems, setEnglishItems] = useState<LinkItem[]>([])
  const [pinyinItems, setPinyinItems] = useState<LinkItem[]>([])
  const [hanziItems, setHanziItems] = useState<LinkItem[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedItem, setSelectedItem] = useState<LinkItem | null>(null)

  // Flash state for showing correct/incorrect feedback
  const [flashingIds, setFlashingIds] = useState<Map<string, boolean>>(new Map())

  // New word overlay state
  const [newWordOverlay, setNewWordOverlay] = useState<Word | null>(null)

  // Tier change notification state
  const [tierChange, setTierChange] = useState<{
    wordId: string
    type: 'promoted' | 'demoted'
    from: string
    to: string
  } | null>(null)

  // Track newly added word IDs for entrance animation
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set())

  // Session stats
  const [sessionScore, setSessionScore] = useState(0)
  const [showUnitSelector, setShowUnitSelector] = useState(false)
  const [selectedWordType, setSelectedWordType] = useState<WordType | 'all'>('all')

  // Difficulty system state
  const [settings, setSettings] = useState<HanziSettings>(() =>
    getHanziSettingsFromProfile(initialProfile)
  )
  const [showSettings, setShowSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Board reset state
  const [isResetting, setIsResetting] = useState(false)
  const [resetPhase, setResetPhase] = useState<ResetPhase>(null)
  const [resetNotification, setResetNotification] = useState<string | null>(null)

  // Ref to track if we're processing a match (prevent double-processing)
  const processingMatch = useRef(false)

  // Get visible words (words currently on the board)
  const getVisibleWords = useCallback((): WordWithProgress[] => {
    return words.filter(w => activeWordIds.has(w.id))
  }, [words, activeWordIds])

  // Calculate current board difficulty
  const boardDifficultyResult = calculateBoardDifficulty(getVisibleWords())
  const expectedDifficulty = calculateExpectedDifficulty(settings, sessionScore)
  const divergence = calculateDivergence(boardDifficultyResult.score, expectedDifficulty)

  // Get filtered words based on word type selection
  const getFilteredWords = useCallback((): WordWithProgress[] => {
    if (settings.viewBy === 'word_type' && selectedWordType !== 'all') {
      return words.filter(w => w.word_type === selectedWordType)
    }
    return words
  }, [words, settings.viewBy, selectedWordType])

  // Get a new word that's not currently in play (with weighted selection and cooldown)
  const getNextWord = useCallback((): Word | null => {
    // Get pinyin of words currently on board to prevent duplicates
    const visiblePinyin = new Set(
      Array.from(activeWordIds)
        .map(id => words.find(w => w.id === id)?.pinyin)
        .filter((p): p is string => p !== undefined)
    )

    const filteredWords = getFilteredWords()

    return selectNextWord(
      filteredWords,
      currentUnit,
      activeWordIds,
      recentlyCompleted,
      COOLDOWN_COUNT,
      sessionScore,
      {
        difficultySettings: settings,
        visibleWords: getVisibleWords(),
        useDifficultyTargeting: true,
        visiblePinyin,
      }
    )
  }, [getFilteredWords, currentUnit, activeWordIds, recentlyCompleted, sessionScore, settings, getVisibleWords, words])

  // Initialize game with first set of words
  const initializeGame = useCallback(() => {
    const filteredWords = getFilteredWords()
    const selected = selectWordsForRound(filteredWords, currentUnit, {
      roundSize: settings.wordCount,
      recentlyCompleted,
      cooldownCount: COOLDOWN_COUNT,
      sessionScore,
      difficultySettings: settings,
      useDifficultyTargeting: true,
    })

    if (selected.length === 0) return

    const { englishItems, pinyinItems, hanziItems } = prepareRoundData(selected)

    setActiveWordIds(new Set(selected.map(w => w.id)))
    setEnglishItems(englishItems)
    setPinyinItems(pinyinItems)
    setHanziItems(hanziItems)
    setConnections([])
    setSelectedItem(null)
    setFlashingIds(new Map())
    setSessionScore(0)
    // Don't reset recentlyCompleted - maintain cooldown across initializations
    // Note: sessionScore is intentionally not in deps as we always reset it to 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFilteredWords, currentUnit, recentlyCompleted, settings])

  // Initialize on mount or unit change
  useEffect(() => {
    if (englishItems.length === 0 && words.length > 0) {
      initializeGame()
    }
  }, [words, englishItems.length, initializeGame])

  // Insert item at random position in array
  const insertAtRandom = <T,>(arr: T[], item: T): T[] => {
    const index = Math.floor(Math.random() * (arr.length + 1))
    const result = [...arr]
    result.splice(index, 0, item)
    return result
  }

  // Replace a matched word with a new one
  const replaceWord = useCallback((wordId: string) => {
    const newWord = getNextWord()

    // Remove the old items
    setEnglishItems(prev => prev.filter(i => i.wordId !== wordId))
    setPinyinItems(prev => prev.filter(i => i.wordId !== wordId))
    setHanziItems(prev => prev.filter(i => i.wordId !== wordId))
    setActiveWordIds(prev => {
      const next = new Set(prev)
      next.delete(wordId)
      return next
    })

    // Add new word at random positions if available
    if (newWord) {
      // Check if this is a truly new word (never seen before)
      const wordWithProgress = words.find(w => w.id === newWord.id)
      const isNewWord = !wordWithProgress?.progress

      // Show new word overlay for never-seen words
      if (isNewWord) {
        setNewWordOverlay(newWord)
      }

      // Mark as newly added for entrance animation
      setNewlyAddedIds(prev => new Set(prev).add(newWord.id))
      setTimeout(() => {
        setNewlyAddedIds(prev => {
          const next = new Set(prev)
          next.delete(newWord.id)
          return next
        })
      }, 300)

      const { englishItems: newE, pinyinItems: newP, hanziItems: newH } = prepareRoundData([newWord])

      setEnglishItems(prev => insertAtRandom(prev, newE[0]))
      setPinyinItems(prev => insertAtRandom(prev, newP[0]))
      setHanziItems(prev => insertAtRandom(prev, newH[0]))
      setActiveWordIds(prev => {
        const next = new Set(prev)
        next.add(newWord.id)
        return next
      })
    }
  }, [getNextWord, words])

  // Update word progress in database
  const updateWordProgress = useCallback(async (wordId: string, wasCorrect: boolean) => {
    const word = words.find(w => w.id === wordId)
    if (!word) return

    const currentScore = word.progress?.score ?? 0
    const scoreChange = getScoreChange('link', wasCorrect, currentScore)
    const newScore = currentScore + scoreChange

    // Check for tier change
    const oldTier = getWordStatus(currentScore)
    const newTier = getWordStatus(newScore)

    if (oldTier !== newTier) {
      const isPromotion = wasCorrect
      setTierChange({
        wordId,
        type: isPromotion ? 'promoted' : 'demoted',
        from: oldTier,
        to: newTier,
      })
      setTimeout(() => setTierChange(null), 1500)
    }

    try {
      if (word.progress) {
        // Update existing progress
        await supabase
          .from('user_word_progress')
          .update({
            score: newScore,
            attempts: word.progress.attempts + 1,
            correct_streak: wasCorrect ? word.progress.correct_streak + 1 : 0,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', word.progress.id)

        // Update local state with incremented values
        setWords(prev =>
          prev.map(w =>
            w.id === wordId
              ? {
                  ...w,
                  progress: {
                    ...w.progress!,
                    score: newScore,
                    attempts: w.progress!.attempts + 1,
                    correct_streak: wasCorrect ? w.progress!.correct_streak + 1 : 0,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                }
              : w
          )
        )
      } else {
        // Insert new progress and get the real row back with its ID
        const { data: insertedProgress } = await supabase
          .from('user_word_progress')
          .insert({
            user_id: userId,
            word_id: wordId,
            score: newScore,
            attempts: 1,
            correct_streak: wasCorrect ? 1 : 0,
            last_seen: new Date().toISOString(),
          })
          .select()
          .single()

        // Update local state with the real progress object (including real ID)
        if (insertedProgress) {
          setWords(prev =>
            prev.map(w =>
              w.id === wordId
                ? {
                    ...w,
                    progress: insertedProgress,
                    status: getWordStatus(newScore),
                  }
                : w
            )
          )
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }, [supabase, userId, words])

  // Save Link-specific settings to database
  const handleSaveSettings = useCallback(async (linkSettings: {
    baseDifficulty: number
    wordCount: number
    showDifficultyScore: boolean
    viewBy: 'units' | 'word_type'
  }) => {
    setIsSavingSettings(true)
    try {
      await supabase
        .from('hanzi_profiles')
        .update({
          base_difficulty: linkSettings.baseDifficulty,
          word_count: linkSettings.wordCount,
          show_difficulty_score: linkSettings.showDifficultyScore,
          view_by: linkSettings.viewBy,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      setSettings(prev => ({
        ...prev,
        baseDifficulty: linkSettings.baseDifficulty,
        wordCount: linkSettings.wordCount,
        showDifficultyScore: linkSettings.showDifficultyScore,
        viewBy: linkSettings.viewBy,
      }))
      setShowSettings(false)

      // If word count changed, reinitialize the game
      if (linkSettings.wordCount !== settings.wordCount) {
        setEnglishItems([])
        setPinyinItems([])
        setHanziItems([])
        setActiveWordIds(new Set())
        setConnections([])
        setSelectedItem(null)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSavingSettings(false)
    }
  }, [supabase, userId, settings.wordCount])

  // Board reset animation sequence
  const performBoardReset = useCallback(async (reason: ResetReason) => {
    if (isResetting) return

    setIsResetting(true)

    // Phase 1: Shake (300ms)
    setResetPhase('shake')
    await new Promise(resolve => setTimeout(resolve, 300))

    // Phase 2: Fade out (200ms)
    setResetPhase('fade-out')
    await new Promise(resolve => setTimeout(resolve, 200))

    // Select new difficulty-appropriate words
    const filteredWords = getFilteredWords()
    const newWords = selectWordsForReset(
      filteredWords,
      currentUnit,
      expectedDifficulty,
      settings.wordCount
    )

    if (newWords.length > 0) {
      const { englishItems: newE, pinyinItems: newP, hanziItems: newH } = prepareRoundData(newWords)

      setActiveWordIds(new Set(newWords.map(w => w.id)))
      setEnglishItems(newE)
      setPinyinItems(newP)
      setHanziItems(newH)
      setConnections([])
      setSelectedItem(null)
    }

    // Phase 3: Fade in (300ms)
    setResetPhase('fade-in')
    await new Promise(resolve => setTimeout(resolve, 300))

    // Complete
    setResetPhase(null)
    setIsResetting(false)

    // Show notification
    const message = reason === 'too-hard'
      ? 'Adjusting to your pace'
      : 'Stepping up the challenge'
    setResetNotification(message)
    setTimeout(() => setResetNotification(null), 2000)
  }, [isResetting, getFilteredWords, currentUnit, expectedDifficulty, settings.wordCount])

  // Check for divergence and trigger reset if needed
  const checkDivergenceAndReset = useCallback(() => {
    if (isResetting) return

    const visibleWords = getVisibleWords()
    if (visibleWords.length === 0) return

    const currentDivergence = calculateDivergence(
      calculateBoardDifficulty(visibleWords).score,
      calculateExpectedDifficulty(settings, sessionScore)
    )

    if (currentDivergence.shouldReset) {
      const reason: ResetReason = currentDivergence.delta > 0 ? 'too-hard' : 'too-easy'
      performBoardReset(reason)
    }
  }, [isResetting, getVisibleWords, settings, sessionScore, performBoardReset])

  // Validate and handle a complete connection
  const handleCompleteConnection = useCallback(async (connection: Connection) => {
    if (processingMatch.current) return
    processingMatch.current = true

    const englishItem = englishItems.find(i => i.id === connection.englishId)
    const pinyinItem = pinyinItems.find(i => i.id === connection.pinyinId)
    const hanziItem = hanziItems.find(i => i.id === connection.hanziId)

    // Check if all three match the same word
    const isCorrect =
      englishItem?.wordId === pinyinItem?.wordId &&
      pinyinItem?.wordId === hanziItem?.wordId

    const wordId = englishItem?.wordId || pinyinItem?.wordId || hanziItem?.wordId

    // Set flash state for all three items
    const itemIds = [connection.englishId, connection.pinyinId, connection.hanziId].filter(Boolean) as string[]
    setFlashingIds(prev => {
      const next = new Map(prev)
      itemIds.forEach(id => next.set(id, isCorrect))
      return next
    })

    // Update the connection with the result
    setConnections(prev =>
      prev.map(c =>
        c.englishId === connection.englishId &&
        c.pinyinId === connection.pinyinId &&
        c.hanziId === connection.hanziId
          ? { ...c, isCorrect }
          : c
      )
    )

    // Update score
    setSessionScore(prev => prev + (isCorrect ? 1 : -1))

    // Update database
    if (wordId) {
      await updateWordProgress(wordId, isCorrect)
    }

    // After flash animation, handle the result
    setTimeout(() => {
      // Clear flash state
      setFlashingIds(prev => {
        const next = new Map(prev)
        itemIds.forEach(id => next.delete(id))
        return next
      })

      if (isCorrect && wordId) {
        // Add to cooldown list (most recent first)
        setRecentlyCompleted(prev => [wordId, ...prev].slice(0, 20)) // Keep last 20

        // Remove the connection and replace the word
        setConnections(prev => prev.filter(c =>
          !(c.englishId === connection.englishId &&
            c.pinyinId === connection.pinyinId &&
            c.hanziId === connection.hanziId)
        ))
        replaceWord(wordId)

        // Check for divergence after word replacement (with small delay for state to settle)
        setTimeout(() => checkDivergenceAndReset(), 100)
      } else {
        // Clear the incorrect connection so user can try again
        setConnections(prev => prev.filter(c =>
          !(c.englishId === connection.englishId &&
            c.pinyinId === connection.pinyinId &&
            c.hanziId === connection.hanziId)
        ))

        // Also check divergence after incorrect answers
        setTimeout(() => checkDivergenceAndReset(), 100)
      }

      processingMatch.current = false
    }, 600) // Flash duration
  }, [englishItems, pinyinItems, hanziItems, updateWordProgress, replaceWord, checkDivergenceAndReset])

  // Handle item selection - free selection from any column
  const handleItemSelect = useCallback(
    (item: LinkItem) => {
      // Don't allow selection while flashing
      if (flashingIds.has(item.id)) return

      // If same item clicked, deselect
      if (selectedItem?.id === item.id) {
        setSelectedItem(null)
        return
      }

      // If no item selected, select this one
      if (!selectedItem) {
        setSelectedItem(item)
        return
      }

      // Determine which items we're working with
      const englishItem = selectedItem.type === 'english' ? selectedItem : item.type === 'english' ? item : null
      const pinyinItem = selectedItem.type === 'pinyin' ? selectedItem : item.type === 'pinyin' ? item : null
      const hanziItem = selectedItem.type === 'hanzi' ? selectedItem : item.type === 'hanzi' ? item : null

      // Find existing connection that includes either item
      const existingConnection = connections.find(c => {
        if (englishItem && c.englishId === englishItem.id) return true
        if (pinyinItem && c.pinyinId === pinyinItem.id) return true
        if (hanziItem && c.hanziId === hanziItem.id) return true
        return false
      })

      if (existingConnection) {
        // Update existing connection
        const updated: Connection = { ...existingConnection }
        if (englishItem) updated.englishId = englishItem.id
        if (pinyinItem) updated.pinyinId = pinyinItem.id
        if (hanziItem) updated.hanziId = hanziItem.id
        updated.isComplete = updated.englishId !== null && updated.pinyinId !== null && updated.hanziId !== null

        setConnections(prev =>
          prev.map(c => {
            if (englishItem && c.englishId === englishItem.id) return updated
            if (pinyinItem && c.pinyinId === pinyinItem.id) return updated
            if (hanziItem && c.hanziId === hanziItem.id) return updated
            return c
          })
        )

        // If complete, validate it
        if (updated.isComplete) {
          setSelectedItem(null)
          handleCompleteConnection(updated)
        } else {
          // Keep an item selected for chaining
          if (pinyinItem) {
            setSelectedItem(pinyinItem)
          } else if (!updated.pinyinId) {
            setSelectedItem(item)
          } else {
            setSelectedItem(null)
          }
        }
      } else {
        // Create new connection
        const newConnection: Connection = {
          englishId: englishItem?.id ?? null,
          pinyinId: pinyinItem?.id ?? null,
          hanziId: hanziItem?.id ?? null,
          wordId: selectedItem.wordId,
          isComplete: false,
          isCorrect: null,
        }

        // Check if complete
        newConnection.isComplete =
          newConnection.englishId !== null &&
          newConnection.pinyinId !== null &&
          newConnection.hanziId !== null

        setConnections(prev => [...prev, newConnection])

        // If complete, validate it
        if (newConnection.isComplete) {
          setSelectedItem(null)
          handleCompleteConnection(newConnection)
        } else {
          // Keep an item selected for chaining
          if (pinyinItem) {
            setSelectedItem(pinyinItem)
          } else {
            setSelectedItem(item)
          }
        }
      }
    },
    [selectedItem, connections, flashingIds, handleCompleteConnection]
  )

  // Get connection state for an item
  const getItemConnection = useCallback(
    (item: LinkItem): Connection | undefined => {
      return connections.find(c => {
        if (item.type === 'english') return c.englishId === item.id
        if (item.type === 'pinyin') return c.pinyinId === item.id
        if (item.type === 'hanzi') return c.hanziId === item.id
        return false
      })
    },
    [connections]
  )

  // Clear a connection (long press)
  const handleClearConnection = useCallback(
    (item: LinkItem) => {
      if (flashingIds.has(item.id)) return

      const connection = getItemConnection(item)
      if (!connection) return

      if (item.type === 'hanzi') {
        setConnections(prev =>
          prev.map(c =>
            c.hanziId === item.id
              ? { ...c, hanziId: null, isComplete: false }
              : c
          )
        )
      } else {
        setConnections(prev =>
          prev.filter(c => c.englishId !== connection.englishId)
        )
      }
    },
    [flashingIds, getItemConnection]
  )

  // Handle unit change
  const handleUnitChange = useCallback((unit: number) => {
    setCurrentUnit(unit)
    setShowUnitSelector(false)
    setEnglishItems([])
    setPinyinItems([])
    setHanziItems([])
    setActiveWordIds(new Set())
    setConnections([])
    setSelectedItem(null)
    setRecentlyCompleted([]) // Reset cooldown for new unit
  }, [])

  // Re-initialize when unit changes
  useEffect(() => {
    if (englishItems.length === 0 && words.length > 0) {
      initializeGame()
    }
  }, [currentUnit, englishItems.length, words.length, initializeGame])

  // Calculate stats
  const unitWords = words.filter(w => w.unit <= currentUnit)
  const strugglingCount = unitWords.filter(
    w => w.progress && w.progress.score < 0
  ).length

  // Handle word type change
  const handleWordTypeChange = useCallback((wordType: WordType | 'all') => {
    setSelectedWordType(wordType)
    setShowUnitSelector(false)
    // Reinitialize the game with new word type filter
    setEnglishItems([])
    setPinyinItems([])
    setHanziItems([])
    setActiveWordIds(new Set())
    setConnections([])
    setSelectedItem(null)
  }, [])

  if (showUnitSelector) {
    // Show WordTypeSelector when viewBy is 'word_type'
    if (settings.viewBy === 'word_type') {
      return (
        <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
          <WordTypeSelector
            words={words}
            selectedType={selectedWordType}
            onSelectType={handleWordTypeChange}
            onClose={() => setShowUnitSelector(false)}
          />
        </div>
      )
    }

    return (
      <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
        <UnitSelector
          words={words}
          currentUnit={currentUnit}
          onSelectUnit={handleUnitChange}
          onClose={() => setShowUnitSelector(false)}
        />
      </div>
    )
  }

  // Get animation class for reset phase
  const getResetAnimationClass = () => {
    if (resetPhase === 'shake') return 'animate-board-shake'
    if (resetPhase === 'fade-out') return 'animate-word-fade-out'
    if (resetPhase === 'fade-in') return 'animate-word-fade-in'
    return ''
  }

  return (
    <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUnitSelector(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-sm text-neutral-400">
              {settings.viewBy === 'word_type'
                ? (selectedWordType === 'all' ? 'All Types' : selectedWordType.replace('_', ' '))
                : `Unit ${currentUnit}`}
            </span>
            <svg
              className="size-4 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {strugglingCount > 0 && (
            <span className="text-xs text-red-400">
              {strugglingCount} struggling
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center size-8 rounded-lg text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800 transition-colors"
            aria-label="Settings"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Score:</span>
            <span className={`text-sm font-medium ${sessionScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {sessionScore > 0 ? '+' : ''}{sessionScore}
            </span>
          </div>
        </div>
      </div>

      {/* Debug difficulty overlay */}
      {settings.showDifficultyScore && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span>Board: <span className="text-neutral-200">{boardDifficultyResult.score.toFixed(1)}</span></span>
            <span>Expected: <span className="text-neutral-200">{expectedDifficulty.toFixed(1)}</span></span>
            <span>Delta: <span className={divergence.delta > 0 ? 'text-red-400' : divergence.delta < 0 ? 'text-blue-400' : 'text-neutral-200'}>
              {divergence.delta > 0 ? '+' : ''}{divergence.delta.toFixed(1)}
            </span></span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              divergence.severity === 'critical' ? 'bg-red-900 text-red-300' :
              divergence.severity === 'warning' ? 'bg-yellow-900 text-yellow-300' :
              'bg-neutral-800 text-neutral-400'
            }`}>
              {divergence.severity}
            </span>
          </div>
        </div>
      )}

      {/* Game area with reset animation */}
      <div className={getResetAnimationClass()}>
        {englishItems.length > 0 ? (
          <LinkGame
            englishItems={englishItems}
            pinyinItems={pinyinItems}
            hanziItems={hanziItems}
            connections={connections}
            selectedItem={selectedItem}
            isSubmitted={false}
            onItemSelect={handleItemSelect}
            onItemLongPress={handleClearConnection}
            getItemConnection={getItemConnection}
            flashingIds={flashingIds}
            newlyAddedIds={newlyAddedIds}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-neutral-500">Loading words...</p>
          </div>
        )}
      </div>

      {/* New word overlay */}
      {newWordOverlay && (
        <button
          onClick={() => setNewWordOverlay(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 animate-overlay-in cursor-pointer"
        >
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-emerald-400 mb-4">
              New Word
            </div>
            <div className="text-8xl sm:text-9xl animate-hanzi-reveal">
              {newWordOverlay.hanzi}
            </div>
            <div className="mt-6 space-y-2 animate-hanzi-reveal" style={{ animationDelay: '200ms' }}>
              <div className="text-2xl text-neutral-300">{newWordOverlay.pinyin}</div>
              <div className="text-lg text-neutral-500">{newWordOverlay.english}</div>
            </div>
            <div className="mt-8 text-sm text-neutral-600 animate-hanzi-reveal" style={{ animationDelay: '400ms' }}>
              Tap to continue
            </div>
          </div>
        </button>
      )}

      {/* Tier change notification */}
      {tierChange && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-overlay-in">
          <div className={`px-4 py-2 rounded-lg border ${
            tierChange.type === 'promoted'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border-red-800 text-red-300'
          }`}>
            <span className="text-sm">
              {tierChange.type === 'promoted' ? '↑' : '↓'} {tierChange.from} → {tierChange.to}
            </span>
          </div>
        </div>
      )}

      {/* Board reset notification */}
      {resetNotification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-overlay-in">
          <div className="px-4 py-2 rounded-lg border bg-neutral-900/90 border-neutral-700 text-neutral-300">
            <span className="text-sm">{resetNotification}</span>
          </div>
        </div>
      )}

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={{
          baseDifficulty: settings.baseDifficulty,
          wordCount: settings.wordCount,
          showDifficultyScore: settings.showDifficultyScore,
          viewBy: settings.viewBy,
        }}
        onSave={handleSaveSettings}
        isSaving={isSavingSettings}
      />
    </div>
  )
}
