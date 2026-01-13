'use client'

import { useState, useRef, useCallback } from 'react'
import { parseXLSFile } from '../lib/parseXLS'
import { categorizeTransactions } from '../lib/categorize'
import { checkDuplicatesClient, insertTransactionsClient, getAccountsClient, updateTransactionCategoryClient } from '../lib/queries.client'
import type { CategorizedTransaction, ImportResult } from '../types'
import { ManualCategorize } from './ManualCategorize'
import { useUser } from '@/hooks/use-user'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

type ImportState = 'idle' | 'parsing' | 'categorizing' | 'deduping' | 'inserting' | 'done' | 'error'

export function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const { userId } = useUser()
  const [state, setState] = useState<ImportState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [uncategorized, setUncategorized] = useState<CategorizedTransaction[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!userId) return

    try {
      setState('parsing')
      setError(null)

      const parsed = await parseXLSFile(file)
      if (parsed.length === 0) {
        throw new Error('No transactions found in file')
      }

      setState('categorizing')
      const categorized = await categorizeTransactions(parsed)

      setState('deduping')
      const hashes = categorized.map(t => t.import_hash)
      const existingHashes = await checkDuplicatesClient(hashes, userId)
      const newTransactions = categorized.filter(t => !existingHashes.has(t.import_hash))
      const duplicateCount = categorized.length - newTransactions.length

      if (newTransactions.length === 0) {
        setResult({
          inserted: 0,
          duplicates: duplicateCount,
          uncategorized: [],
          errors: [],
        })
        setState('done')
        return
      }

      const accounts = await getAccountsClient(userId)
      const accountId = accounts[0]?.id || 'default'

      setState('inserting')
      const { inserted, errors } = await insertTransactionsClient(newTransactions, accountId, userId)

      const uncategorizedTxns = newTransactions.filter(t => t.category === 'other')

      setResult({
        inserted,
        duplicates: duplicateCount,
        uncategorized: uncategorizedTxns,
        errors,
      })

      if (uncategorizedTxns.length > 0) {
        setUncategorized(uncategorizedTxns)
        setCurrentIndex(0)
      } else {
        setState('done')
        onImportComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setState('error')
    }
  }, [onImportComplete, userId])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleCategorize = useCallback(async (category: string, merchantName?: string) => {
    if (!userId) return
    const transaction = uncategorized[currentIndex]
    if (transaction) {
      await updateTransactionCategoryClient(transaction.import_hash, category, merchantName, userId)
      if (currentIndex < uncategorized.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setState('done')
        onImportComplete()
      }
    }
  }, [uncategorized, currentIndex, onImportComplete, userId])

  const handleSkip = useCallback(() => {
    if (currentIndex < uncategorized.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setState('done')
      onImportComplete()
    }
  }, [currentIndex, uncategorized.length, onImportComplete])

  const handleClose = useCallback(() => {
    setState('idle')
    setError(null)
    setResult(null)
    setUncategorized([])
    setCurrentIndex(0)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  if (uncategorized.length > 0 && currentIndex < uncategorized.length) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 z-40" />
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800/60 rounded-md px-3 py-2">
            <span className="text-[12px] font-mono tabular-nums text-neutral-500">
              {currentIndex + 1}/{uncategorized.length}
            </span>
          </div>
        </div>
        <ManualCategorize
          transaction={uncategorized[currentIndex]}
          onCategorize={handleCategorize}
          onSkip={handleSkip}
        />
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-neutral-900 border border-neutral-800/60 rounded-md max-w-sm w-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800/40 flex items-center justify-between">
          <h3 className="text-[13px] font-medium text-neutral-200">Import</h3>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center rounded text-neutral-500 hover:text-neutral-300 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {state === 'idle' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border border-dashed rounded-md p-8 text-center cursor-pointer transition-colors duration-150
                ${isDragging
                  ? 'border-emerald-600 bg-emerald-950/20'
                  : 'border-neutral-700 hover:border-neutral-600 active:bg-neutral-800/30'
                }
              `}
            >
              <svg className="w-8 h-8 mx-auto mb-3 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-[13px] text-neutral-400 mb-1">Drop XLS file</p>
              <p className="text-[11px] text-neutral-600">Santander current or credit card</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {(state === 'parsing' || state === 'categorizing' || state === 'deduping' || state === 'inserting') && (
            <div className="py-8 text-center">
              <div className="w-5 h-5 mx-auto mb-3 border-[1.5px] border-neutral-600 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[12px] text-neutral-500">
                {state === 'parsing' && 'Parsing...'}
                {state === 'categorizing' && 'Categorizing...'}
                {state === 'deduping' && 'Checking duplicates...'}
                {state === 'inserting' && 'Saving...'}
              </p>
            </div>
          )}

          {state === 'done' && result && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-400 py-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] font-medium">Complete</span>
              </div>

              <div className="bg-neutral-800/30 rounded-md p-3 space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-neutral-500">New</span>
                  <span className="font-mono tabular-nums text-emerald-400">{result.inserted}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-neutral-500">Duplicates</span>
                  <span className="font-mono tabular-nums text-neutral-600">{result.duplicates}</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-neutral-500">Errors</span>
                    <span className="font-mono tabular-nums text-red-400">{result.errors.length}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2.5 rounded-md text-[13px] font-medium bg-neutral-800 text-neutral-200 active:bg-neutral-700 transition-colors duration-150"
              >
                Done
              </button>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-400 py-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[13px] font-medium">Failed</span>
              </div>

              <div className="bg-red-950/30 border border-red-900/40 rounded-md p-3">
                <p className="text-[12px] text-red-300">{error}</p>
              </div>

              <button
                onClick={() => setState('idle')}
                className="w-full px-4 py-2.5 rounded-md text-[13px] font-medium bg-neutral-800 text-neutral-200 active:bg-neutral-700 transition-colors duration-150"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
