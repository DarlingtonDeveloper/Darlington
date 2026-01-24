// Hanzi Linker - Progression and Unlock Logic

import { WordWithProgress, UnitProgress, SCORE_THRESHOLDS } from './types'

interface UnitInfo {
  section: number
  unit: number
  unitName: string
}

// Section 1 unit info
export const SECTION_1_UNITS: UnitInfo[] = [
  { section: 1, unit: 1, unitName: 'Name food and drinks' },
  { section: 1, unit: 2, unitName: 'Talk about nationalities' },
  { section: 1, unit: 3, unitName: 'Discuss professions' },
  { section: 1, unit: 4, unitName: 'Discuss your courses' },
  { section: 1, unit: 5, unitName: 'Use possessive pronouns' },
  { section: 1, unit: 6, unitName: 'Talk about places you visit' },
  { section: 1, unit: 7, unitName: 'Order drinks' },
  { section: 1, unit: 8, unitName: 'Locate travel essentials' },
  { section: 1, unit: 9, unitName: 'Introduce yourself and your classes' }
]

/**
 * Check if user can unlock the next unit
 * Requirements:
 * - All words in current unit seen at least once
 * - 80%+ of current unit words are "familiar" (score >= 3)
 */
export function canUnlockNextUnit(unitWords: WordWithProgress[]): boolean {
  if (unitWords.length === 0) return false

  // Check 1: All words must be seen at least once
  const allSeen = unitWords.every(w => w.progress !== null)
  if (!allSeen) return false

  // Check 2: 80% must be "familiar" (score >= 3)
  const familiarCount = unitWords.filter(
    w => (w.progress?.score ?? 0) >= SCORE_THRESHOLDS.FAMILIAR_MIN
  ).length
  const familiarPercentage = familiarCount / unitWords.length

  return familiarPercentage >= 0.8
}

/**
 * Get progress for a specific unit
 */
export function getUnitProgress(
  allWords: WordWithProgress[],
  section: number,
  unit: number,
  currentUnit: number
): UnitProgress {
  const unitInfo = SECTION_1_UNITS.find(
    u => u.section === section && u.unit === unit
  )
  const unitName = unitInfo?.unitName ?? `Unit ${unit}`

  const unitWords = allWords.filter(w => w.section === section && w.unit === unit)
  const totalWords = unitWords.length

  const wordsSeen = unitWords.filter(w => w.progress !== null).length

  const mastered = unitWords.filter(
    w => (w.progress?.score ?? 0) >= SCORE_THRESHOLDS.MASTERED_MIN
  ).length

  const familiar = unitWords.filter(w => {
    const score = w.progress?.score ?? 0
    return (
      score >= SCORE_THRESHOLDS.FAMILIAR_MIN &&
      score <= SCORE_THRESHOLDS.FAMILIAR_MAX
    )
  }).length

  const learning = unitWords.filter(w => {
    const score = w.progress?.score ?? 0
    return (
      w.progress !== null &&
      score >= SCORE_THRESHOLDS.LEARNING_MIN &&
      score <= SCORE_THRESHOLDS.LEARNING_MAX
    )
  }).length

  const struggling = unitWords.filter(
    w => w.progress && w.progress.score < SCORE_THRESHOLDS.LEARNING_MIN
  ).length

  // Unit is unlocked if it's <= current unit
  const isUnlocked = unit <= currentUnit

  // Unit is complete if all words are familiar or mastered
  const familiarOrBetter = mastered + familiar
  const isComplete = totalWords > 0 && familiarOrBetter >= totalWords * 0.8

  return {
    section,
    unit,
    unitName,
    totalWords,
    wordsSeen,
    mastered,
    familiar,
    learning,
    struggling,
    isUnlocked,
    isComplete,
  }
}

/**
 * Get progress for all units in a section
 */
export function getSectionProgress(
  allWords: WordWithProgress[],
  section: number,
  currentUnit: number
): UnitProgress[] {
  const sectionUnits = SECTION_1_UNITS.filter(u => u.section === section)

  return sectionUnits.map(unitInfo =>
    getUnitProgress(allWords, section, unitInfo.unit, currentUnit)
  )
}

/**
 * Calculate which unit should be unlocked based on progress
 */
export function calculateCurrentUnit(allWords: WordWithProgress[]): number {
  let currentUnit = 1

  for (const unitInfo of SECTION_1_UNITS) {
    const unitWords = allWords.filter(
      w => w.section === unitInfo.section && w.unit === unitInfo.unit
    )

    if (canUnlockNextUnit(unitWords)) {
      currentUnit = Math.max(currentUnit, unitInfo.unit + 1)
    } else {
      break
    }
  }

  // Cap at max unit
  return Math.min(currentUnit, SECTION_1_UNITS.length)
}

/**
 * Check and update daily streak
 */
export function calculateStreak(
  lastPracticeDate: string | null,
  currentStreak: number
): { newStreak: number; streakMaintained: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!lastPracticeDate) {
    return { newStreak: 1, streakMaintained: false }
  }

  const lastDate = new Date(lastPracticeDate)
  lastDate.setHours(0, 0, 0, 0)

  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) {
    // Same day - streak maintained
    return { newStreak: currentStreak, streakMaintained: true }
  } else if (diffDays === 1) {
    // Next day - streak continues
    return { newStreak: currentStreak + 1, streakMaintained: true }
  } else {
    // Streak broken
    return { newStreak: 1, streakMaintained: false }
  }
}
