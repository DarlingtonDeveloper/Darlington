'use client'

import { useCompass } from '@/contexts/compass-context'
import { useAuth } from '@/contexts/auth-context'
import { CountdownTimer } from './countdown-timer'
import { UserMenu } from '@/components/user-menu'
import { XIcon } from '@/components/x-icon'
import { HashNodeIcon } from '@/components/hashnode-icon'
import { Github, Linkedin, Instagram } from 'lucide-react'

const SOCIALS = [
  { href: 'https://github.com/DarlingtonDeveloper', label: 'GitHub', icon: Github },
  { href: 'https://x.com/DarlingtonDev', label: 'X', icon: XIcon },
  { href: 'https://www.linkedin.com/in/DarlingtonDev/', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://instagram.com/Darlington.dev', label: 'Instagram', icon: Instagram },
  { href: 'https://frtr.hashnode.dev/', label: 'HashNode', icon: HashNodeIcon },
]

export function CompassHUD() {
  const { activePanel, closePanel } = useCompass()
  const { user } = useAuth()
  const panelOpen = activePanel !== null

  return (
    <>
      {/* Top-left: Wordmark + Avatar */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-40 flex flex-col gap-2 pl-safe pt-safe">
        <button
          onClick={panelOpen ? closePanel : undefined}
          className={`font-sans text-[0.9rem] font-medium uppercase tracking-[0.3em] text-[var(--fg)] select-none
            ${panelOpen ? 'cursor-pointer hover:underline underline-offset-4 decoration-[var(--fg2)]' : 'cursor-default'}`}
          style={{ fontVariant: 'small-caps' }}
          aria-label={panelOpen ? 'Close panel' : 'Darlington'}
        >
          DARLINGTON
        </button>
        {user && (
          <div className="mt-1">
            <UserMenu compact />
          </div>
        )}
      </div>

      {/* Top-right: Countdown */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-40 pr-safe pt-safe">
        <CountdownTimer />
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40 px-4 md:px-6 pb-safe">
        <div className="flex items-center justify-between h-12 pl-safe pr-safe">
          {/* Tagline */}
          <p className="font-display italic text-[1.35rem] md:text-[1.5rem] text-[var(--fg2)] select-none">
            <span>Imagination as infrastructure</span>
            <span className="tagline-dots" />
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3 md:gap-4">
            {SOCIALS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--fg2)] opacity-60 hover:opacity-100 hover:text-[var(--accent)] transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={label}
              >
                <Icon size={22} className="text-current" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
