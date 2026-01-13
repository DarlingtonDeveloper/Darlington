'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPortal } from 'react-dom'

interface UserMenuProps {
  compact?: boolean
}

export function UserMenu({ compact = false }: UserMenuProps) {
  const { user, signOut, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }, [])

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      // Calculate position before opening
      updatePosition()
    }
    setIsOpen(!isOpen)
  }, [isOpen, updatePosition])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  // Loading state - subtle skeleton
  if (isLoading) {
    return (
      <div className="size-8 rounded-full bg-neutral-800/60 animate-pulse" />
    )
  }

  // Signed out state
  if (!user) {
    if (compact) {
      return (
        <Link
          href="/login"
          className="size-8 rounded-full bg-neutral-800/80 border border-neutral-700/50
                     flex items-center justify-center transition-all duration-150
                     hover:bg-neutral-700/80 hover:border-neutral-600/50 active:scale-95"
          aria-label="Sign in"
        >
          <svg
            className="size-4 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </Link>
      )
    }

    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium
                   text-neutral-400 hover:text-neutral-200 transition-colors duration-150
                   rounded-md hover:bg-neutral-800/50"
      >
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
        Sign in
      </Link>
    )
  }

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut()
    router.push('/')
    router.refresh()
  }

  const initial = user.email?.charAt(0).toUpperCase() || '?'

  const dropdown = isOpen && typeof document !== 'undefined' ? createPortal(
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-[9998] md:hidden"
        onClick={() => setIsOpen(false)}
      />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        style={{ top: dropdownPosition.top, right: dropdownPosition.right }}
        className="fixed w-52 z-[9999] origin-top-right
                   bg-neutral-900/95 backdrop-blur-sm border border-neutral-800/60
                   rounded-lg shadow-xl shadow-black/20
                   animate-in fade-in zoom-in-95 duration-150"
      >
            {/* User info header */}
            <div className="px-3 py-2.5 border-b border-neutral-800/40">
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-0.5">
                Signed in as
              </p>
              <p className="text-[13px] text-neutral-200 truncate font-mono">
                {user.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/habits"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-300
                           hover:bg-neutral-800/50 transition-colors duration-150"
              >
                <svg
                  className="size-4 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/hanzi"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-300
                           hover:bg-neutral-800/50 transition-colors duration-150"
              >
                <svg
                  className="size-4 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
                  />
                </svg>
                Hanzi
              </Link>
              <Link
                href="/finance"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-300
                           hover:bg-neutral-800/50 transition-colors duration-150"
              >
                <svg
                  className="size-4 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                  />
                </svg>
                Finance
              </Link>
            </div>

        {/* Sign out */}
        <div className="border-t border-neutral-800/40 py-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-neutral-400
                       hover:text-neutral-200 hover:bg-neutral-800/50 transition-colors duration-150"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </>,
    document.body
  ) : null

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="size-8 rounded-full bg-neutral-800/80 border border-neutral-700/50
                   flex items-center justify-center text-[13px] font-medium text-neutral-300
                   transition-all duration-150 hover:bg-neutral-700/80 hover:border-neutral-600/50
                   active:scale-95"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {initial}
      </button>
      {dropdown}
    </>
  )
}
