'use client'

import KillteamCard from '@/components/killteam/KillteamCard'
import { KillteamLink } from '@/components/shared/Links'
import { KillteamPlain } from '@/types'
import clsx from 'clsx'
import { useMemo, useState } from 'react'

interface KillteamsPageClientProps {
  killteams: KillteamPlain[]
}

const tabOptions = ['standard', 'homebrew', 'stats'] as const

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

  const rosterCounts = useMemo(
    () =>
      killteams
        .filter((killteam) => killteam.isPublished)
        .sort((a, b) => {
          if (b.rosterCount !== a.rosterCount) return (b.rosterCount ?? 0) - (a.rosterCount ?? 0)
          return a.killteamName.localeCompare(b.killteamName)
        }),
    [killteams]
  )

  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), [])

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
          <button className={tabClasses(tab === 'stats')} onClick={() => setTab('stats')}>
            Stats
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

      <div className={tab === 'stats' ? 'block' : 'hidden'}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-2 font-medium">Killteam</th>
                <th className="px-4 py-2 font-medium text-right">Rosters</th>
              </tr>
            </thead>
            <tbody>
              {rosterCounts.map((row, index) => (
                <tr key={row.killteamId}>
                  <td className="px-2 py-1">
                    <KillteamLink killteam={row} />
                  </td>
                  <td className="px-2 py-1 text-right">
                    {numberFormatter.format(row.rosterCount ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rosterCounts.length === 0 && (
          <div className="text-center text-muted mt-4">No rosters found for any killteam.</div>
        )}
      </div>
    </div>
  )
}
