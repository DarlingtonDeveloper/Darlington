'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  WordWithProgress,
  HanziProfile,
  Word,
  Connection,
  LinkItem,
  RoundResult,
} from '@/lib/hanzi/types'
import { getScoreChange } from '@/lib/hanzi/types'
import { selectWordsForRound, prepareRoundData } from '@/lib/hanzi/word-selection'
import { LinkGame } from './components/link-game'
import { ResultModal } from './components/result-modal'
import { UnitSelector } from './components/unit-selector'

const USER_ID = 'd4f6f192-41ff-4c66-a07a-f9ebef463281'
const ROUND_SIZE = 4

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

  // Game state
  const [roundWords, setRoundWords] = useState<Word[]>([])
  const [englishItems, setEnglishItems] = useState<LinkItem[]>([])
  const [pinyinItems, setPinyinItems] = useState<LinkItem[]>([])
  const [hanziItems, setHanziItems] = useState<LinkItem[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedItem, setSelectedItem] = useState<LinkItem | null>(null)
  // Pending connection tracks partial link state (for future UI enhancements)
  const [, setPendingConnection] = useState<Partial<Connection> | null>(null)

  // Round state
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<RoundResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [roundScore, setRoundScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showUnitSelector, setShowUnitSelector] = useState(false)

  // Round tracking
  const [roundNumber, setRoundNumber] = useState(0)

  // Start a new round
  const startNewRound = useCallback(() => {
    const selected = selectWordsForRound(words, currentUnit, { roundSize: ROUND_SIZE })

    if (selected.length === 0) {
      return
    }

    const { englishItems, pinyinItems, hanziItems } = prepareRoundData(selected)

    setRoundWords(selected)
    setEnglishItems(englishItems)
    setPinyinItems(pinyinItems)
    setHanziItems(hanziItems)
    setConnections([])
    setSelectedItem(null)
    setPendingConnection(null)
    setIsSubmitted(false)
    setResults([])
    setShowResults(false)
    setRoundScore(0)
    setRoundNumber(prev => prev + 1)
  }, [words, currentUnit])

  // Initialize first round
  useEffect(() => {
    if (roundWords.length === 0 && words.length > 0) {
      startNewRound()
    }
  }, [words, roundWords.length, startNewRound])

  // Handle item selection
  const handleItemSelect = useCallback(
    (item: LinkItem) => {
      if (isSubmitted) return

      // If same item clicked, deselect
      if (selectedItem?.id === item.id) {
        setSelectedItem(null)
        return
      }

      // If no item selected, select this one
      if (!selectedItem) {
        setSelectedItem(item)

        // Start pending connection if English selected
        if (item.type === 'english') {
          setPendingConnection({
            englishId: item.id,
            wordId: item.wordId,
            isComplete: false,
            isCorrect: null,
          })
        }
        return
      }

      // If we have a selected item, check for valid connection
      const types = [selectedItem.type, item.type]

      // Valid progressions: english -> pinyin -> hanzi
      if (types.includes('english') && types.includes('pinyin')) {
        const englishItem = selectedItem.type === 'english' ? selectedItem : item
        const pinyinItem = selectedItem.type === 'pinyin' ? selectedItem : item

        // Check if this English is already connected
        const existingConnection = connections.find(
          c => c.englishId === englishItem.id
        )

        if (existingConnection) {
          // Update existing connection
          setConnections(prev =>
            prev.map(c =>
              c.englishId === englishItem.id
                ? { ...c, pinyinId: pinyinItem.id }
                : c
            )
          )
        } else {
          // Create new connection
          const newConnection: Connection = {
            englishId: englishItem.id,
            pinyinId: pinyinItem.id,
            hanziId: null,
            wordId: englishItem.wordId,
            isComplete: false,
            isCorrect: null,
          }
          setConnections(prev => [...prev, newConnection])
        }

        setSelectedItem(null)
        setPendingConnection(null)
      } else if (types.includes('pinyin') && types.includes('hanzi')) {
        const pinyinItem = selectedItem.type === 'pinyin' ? selectedItem : item
        const hanziItem = selectedItem.type === 'hanzi' ? selectedItem : item

        // Find connection with this pinyin and complete it
        const existingConnection = connections.find(
          c => c.pinyinId === pinyinItem.id
        )

        if (existingConnection) {
          setConnections(prev =>
            prev.map(c =>
              c.pinyinId === pinyinItem.id
                ? { ...c, hanziId: hanziItem.id, isComplete: true }
                : c
            )
          )
        }

        setSelectedItem(null)
        setPendingConnection(null)
      } else {
        // Invalid combination, switch selection
        setSelectedItem(item)
        if (item.type === 'english') {
          setPendingConnection({
            englishId: item.id,
            wordId: item.wordId,
            isComplete: false,
            isCorrect: null,
          })
        } else {
          setPendingConnection(null)
        }
      }
    },
    [selectedItem, connections, isSubmitted]
  )

  // Check answers
  const handleCheckAnswers = useCallback(async () => {
    if (isSubmitted || isLoading) return

    // Only check complete connections
    const completeConnections = connections.filter(c => c.isComplete)

    if (completeConnections.length === 0) return

    setIsLoading(true)

    // Validate each connection
    const validatedConnections = completeConnections.map(conn => {
      // Get the word ID from the English item
      const englishItem = englishItems.find(i => i.id === conn.englishId)
      const pinyinItem = pinyinItems.find(i => i.id === conn.pinyinId)
      const hanziItem = hanziItems.find(i => i.id === conn.hanziId)

      // All three must match the same word
      const isCorrect =
        englishItem?.wordId === pinyinItem?.wordId &&
        pinyinItem?.wordId === hanziItem?.wordId

      return { ...conn, isCorrect }
    })

    setConnections(validatedConnections)
    setIsSubmitted(true)

    // Calculate results
    const roundResults: RoundResult[] = validatedConnections.map(conn => ({
      wordId: conn.wordId,
      wasCorrect: conn.isCorrect ?? false,
    }))

    setResults(roundResults)

    // Calculate score
    const correctCount = roundResults.filter(r => r.wasCorrect).length
    const incorrectCount = roundResults.length - correctCount
    const score = correctCount - incorrectCount
    setRoundScore(score)

    // Update word progress in database
    try {
      for (const result of roundResults) {
        const word = words.find(w => w.id === result.wordId)
        if (!word) continue

        const currentScore = word.progress?.score ?? 0
        const scoreChange = getScoreChange('link', result.wasCorrect)
        const newScore = currentScore + scoreChange

        if (word.progress) {
          // Update existing progress
          await supabase
            .from('user_word_progress')
            .update({
              score: newScore,
              attempts: word.progress.attempts + 1,
              correct_streak: result.wasCorrect
                ? word.progress.correct_streak + 1
                : 0,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', word.progress.id)
        } else {
          // Insert new progress
          await supabase.from('user_word_progress').insert({
            user_id: USER_ID,
            word_id: result.wordId,
            score: newScore,
            attempts: 1,
            correct_streak: result.wasCorrect ? 1 : 0,
            last_seen: new Date().toISOString(),
          })
        }

        // Update local state
        setWords(prev =>
          prev.map(w =>
            w.id === result.wordId
              ? {
                  ...w,
                  progress: {
                    ...(w.progress || {
                      id: '',
                      user_id: USER_ID,
                      word_id: result.wordId,
                      attempts: 0,
                      correct_streak: 0,
                      last_seen: null,
                      introduced_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    }),
                    score: newScore,
                    attempts: (w.progress?.attempts ?? 0) + 1,
                    correct_streak: result.wasCorrect
                      ? (w.progress?.correct_streak ?? 0) + 1
                      : 0,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                }
              : w
          )
        )
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }

    setIsLoading(false)
    setShowResults(true)
  }, [connections, englishItems, pinyinItems, hanziItems, words, isSubmitted, isLoading])

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

  // Clear a connection
  const handleClearConnection = useCallback(
    (item: LinkItem) => {
      if (isSubmitted) return

      const connection = getItemConnection(item)
      if (!connection) return

      // If clicking on hanzi, just remove hanzi from connection
      if (item.type === 'hanzi') {
        setConnections(prev =>
          prev.map(c =>
            c.hanziId === item.id
              ? { ...c, hanziId: null, isComplete: false }
              : c
          )
        )
      } else {
        // Otherwise remove entire connection
        setConnections(prev =>
          prev.filter(c => c.englishId !== connection.englishId)
        )
      }
    },
    [isSubmitted, getItemConnection]
  )

  // Handle unit change
  const handleUnitChange = useCallback((unit: number) => {
    setCurrentUnit(unit)
    setShowUnitSelector(false)
    // Start new round will be triggered by useEffect due to currentUnit change
    setRoundWords([])
  }, [])

  // Restart when unit changes
  useEffect(() => {
    if (roundWords.length === 0 && words.length > 0) {
      startNewRound()
    }
  }, [currentUnit, roundWords.length, words.length, startNewRound])

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
        <div className="text-sm text-neutral-400">Round {roundNumber}</div>
      </div>

      {/* Game area */}
      {roundWords.length > 0 ? (
        <LinkGame
          englishItems={englishItems}
          pinyinItems={pinyinItems}
          hanziItems={hanziItems}
          connections={connections}
          selectedItem={selectedItem}
          isSubmitted={isSubmitted}
          onItemSelect={handleItemSelect}
          onItemLongPress={handleClearConnection}
          getItemConnection={getItemConnection}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-neutral-500">Loading words...</p>
        </div>
      )}

      {/* Action button */}
      <div className="mt-6">
        {!isSubmitted ? (
          <button
            onClick={handleCheckAnswers}
            disabled={
              isLoading || connections.filter(c => c.isComplete).length === 0
            }
            className="w-full py-3 px-4 rounded-xl bg-neutral-800 text-neutral-50 font-medium transition-all hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking...' : 'Check Answers'}
          </button>
        ) : (
          <button
            onClick={startNewRound}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium transition-all hover:bg-emerald-500"
          >
            Next Round
          </button>
        )}
      </div>

      {/* Results modal */}
      {showResults && (
        <ResultModal
          results={results}
          words={roundWords}
          score={roundScore}
          onClose={() => setShowResults(false)}
          onNextRound={startNewRound}
        />
      )}
    </div>
  )
}
