'use client'

import KillteamCard from '@/components/killteam/KillteamCard'
import { KillteamPlain } from '@/types'
import clsx from 'clsx'
import { useMemo, useState } from 'react'

interface KillteamsPageClientProps {
  killteams: KillteamPlain[]
}

const tabOptions = ['standard', 'homebrew'] as const

export default function KillteamsPageClient({ killteams }: KillteamsPageClientProps) {
  type Tab = typeof tabOptions[number]
  const [tab, setTab] = useState<Tab>('standard')

  const standardKillteams = useMemo(
    () => killteams.filter((killteam) => !killteam.isHomebrew),
    [killteams]
  )

  const homebrewKillteams = useMemo(
    () => killteams.filter((killteam) => killteam.isHomebrew),
    [killteams]
  )

  const tabClasses = (selected: boolean) =>
    clsx(
      'px-2 py-2 border-b-2 transition-colors',
      selected ? 'border-main text-main' : 'border-transparent text-muted hover:text-foreground'
    )

  return (
    <div>
      <div className="overflow-x-auto px-2 noprint">
        <div className="flex justify-center space-x-2 border-b border-border mb-4 min-w-max">
          <button className={tabClasses(tab === 'standard')} onClick={() => setTab('standard')}>
            Standard
          </button>
          <button className={tabClasses(tab === 'homebrew')} onClick={() => setTab('homebrew')}>
            Homebrew
          </button>
        </div>
      </div>

      <div className={tab === 'standard' ? 'block' : 'hidden'}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {standardKillteams.map((killteam) => (
            <KillteamCard key={killteam.killteamId} killteam={killteam} />
          ))}
        </div>
        {standardKillteams.length === 0 && (
          <div className="text-center text-muted mt-4">No standard killteams available.</div>
        )}
      </div>

      <div className={tab === 'homebrew' ? 'block' : 'hidden'}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {homebrewKillteams.map((killteam) => (
            <KillteamCard key={killteam.killteamId} killteam={killteam} />
          ))}
        </div>
        {homebrewKillteams.length === 0 && (
          <div className="text-center text-muted mt-4">No homebrew killteams yet.</div>
        )}
      </div>
    </div>
  )
}
