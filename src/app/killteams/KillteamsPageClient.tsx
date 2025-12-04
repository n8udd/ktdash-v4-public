import KillteamCard from '@/components/killteam/KillteamCard'
import { KillteamLink } from '@/components/shared/Links'
import { KillteamPlain } from '@/types'
import clsx from 'clsx'
import Link from 'next/link'

type Tab = 'standard' | 'homebrew' | 'stats'

interface KillteamsPageClientProps {
  killteams: KillteamPlain[]
  tab: Tab
}

const tabOptions: { key: Tab; label: string }[] = [
  { key: 'standard', label: 'Standard' },
  { key: 'homebrew', label: 'Homebrew' },
  { key: 'stats', label: 'Stats' },
]

const tabHref = (tab: Tab) => (tab === 'standard' ? '/killteams' : `/killteams?tab=${tab}`)

export default function KillteamsPageClient({ killteams, tab }: KillteamsPageClientProps) {
  const standardKillteams = killteams.filter((killteam) => !killteam.isHomebrew)
  const homebrewKillteams = killteams.filter((killteam) => killteam.isHomebrew)
  const rosterCounts = killteams
    .filter((killteam) => killteam.isPublished)
    .sort((a, b) => {
      if (b.rosterCount !== a.rosterCount) return (b.rosterCount ?? 0) - (a.rosterCount ?? 0)
      return a.killteamName.localeCompare(b.killteamName)
    })

  const numberFormatter = new Intl.NumberFormat('en-US')

  const tabClasses = (selected: boolean) =>
    clsx(
      'px-2 py-2 border-b-2 transition-colors',
      selected ? 'border-main text-main' : 'border-transparent text-muted hover:text-foreground'
    )

  return (
    <div>
      <div className="overflow-x-auto px-2 noprint">
        <div className="flex justify-center space-x-2 border-b border-border mb-4 min-w-max">
          {tabOptions.map(({ key, label }) => (
            <Link
              key={key}
              href={tabHref(key)}
              replace
              scroll={false}
              className={tabClasses(tab === key)}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {tab === 'standard' && (
        <div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {standardKillteams.map((killteam) => (
              <KillteamCard key={killteam.killteamId} killteam={killteam} />
            ))}
          </div>
          {standardKillteams.length === 0 && (
            <div className="text-center text-muted mt-4">No standard killteams available.</div>
          )}
        </div>
      )}

      {tab === 'homebrew' && (
        <div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {homebrewKillteams.map((killteam) => (
              <KillteamCard key={killteam.killteamId} killteam={killteam} />
            ))}
          </div>
          {homebrewKillteams.length === 0 && (
            <div className="text-center text-muted mt-4">No homebrew killteams yet.</div>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Killteam</th>
                  <th className="px-4 py-2 font-medium text-right">Rosters</th>
                </tr>
              </thead>
              <tbody>
                {rosterCounts.map((row) => (
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
      )}
    </div>
  )
}
