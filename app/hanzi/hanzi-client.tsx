'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  WordWithProgress,
  HanziProfile,
  Word,
  Connection,
  LinkItem,
} from '@/lib/hanzi/types'
import { getScoreChange } from '@/lib/hanzi/types'
import { selectWordsForRound, selectNextWord, prepareRoundData } from '@/lib/hanzi/word-selection'
import { LinkGame } from './components/link-game'
import { UnitSelector } from './components/unit-selector'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
const ITEMS_IN_PLAY = 8

interface HanziClientProps {
  initialWords: WordWithProgress[]
  initialProfile: HanziProfile | null
  currentUnit: number
  currentSection: number
}

export function HanziClient({
  initialWords,
  currentUnit: initialUnit,
}: HanziClientProps) {
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

  // Session stats
  const [sessionScore, setSessionScore] = useState(0)
  const [showUnitSelector, setShowUnitSelector] = useState(false)

  // Ref to track if we're processing a match (prevent double-processing)
  const processingMatch = useRef(false)

  // Get a new word that's not currently in play (with weighted selection and cooldown)
  const getNextWord = useCallback((): Word | null => {
    return selectNextWord(
      words,
      currentUnit,
      activeWordIds,
      recentlyCompleted,
      COOLDOWN_COUNT
    )
  }, [words, currentUnit, activeWordIds, recentlyCompleted])

  // Initialize game with first set of words
  const initializeGame = useCallback(() => {
    const selected = selectWordsForRound(words, currentUnit, {
      roundSize: ITEMS_IN_PLAY,
      recentlyCompleted,
      cooldownCount: COOLDOWN_COUNT,
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
  }, [words, currentUnit, recentlyCompleted])

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
  }, [getNextWord])

  // Update word progress in database
  const updateWordProgress = useCallback(async (wordId: string, wasCorrect: boolean) => {
    const word = words.find(w => w.id === wordId)
    if (!word) return

    const currentScore = word.progress?.score ?? 0
    const scoreChange = getScoreChange('link', wasCorrect, currentScore)
    const newScore = currentScore + scoreChange

    try {
      if (word.progress) {
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
      } else {
        await supabase.from('user_word_progress').insert({
          user_id: USER_ID,
          word_id: wordId,
          score: newScore,
          attempts: 1,
          correct_streak: wasCorrect ? 1 : 0,
          last_seen: new Date().toISOString(),
        })
      }

      // Update local state
      setWords(prev =>
        prev.map(w =>
          w.id === wordId
            ? {
                ...w,
                progress: {
                  ...(w.progress || {
                    id: '',
                    user_id: USER_ID,
                    word_id: wordId,
                    attempts: 0,
                    correct_streak: 0,
                    last_seen: null,
                    introduced_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }),
                  score: newScore,
                  attempts: (w.progress?.attempts ?? 0) + 1,
                  correct_streak: wasCorrect ? (w.progress?.correct_streak ?? 0) + 1 : 0,
                  last_seen: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              }
            : w
        )
      )
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }, [words])

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
      } else {
        // Clear the incorrect connection so user can try again
        setConnections(prev => prev.filter(c =>
          !(c.englishId === connection.englishId &&
            c.pinyinId === connection.pinyinId &&
            c.hanziId === connection.hanziId)
        ))
      }

      processingMatch.current = false
    }, 600) // Flash duration
  }, [englishItems, pinyinItems, hanziItems, updateWordProgress, replaceWord])

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

  if (showUnitSelector) {
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

  return (
    <div className="px-4 pb-safe sm:px-6 sm:max-w-2xl sm:mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUnitSelector(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-sm text-neutral-400">Unit {currentUnit}</span>
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">Score:</span>
          <span className={`text-sm font-medium ${sessionScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {sessionScore > 0 ? '+' : ''}{sessionScore}
          </span>
        </div>
      </div>

      {/* Game area */}
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
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-neutral-500">Loading words...</p>
        </div>
      )}
    </div>
  )
}
