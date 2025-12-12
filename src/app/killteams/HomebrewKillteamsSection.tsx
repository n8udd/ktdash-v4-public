'use client'

import KillteamCard from '@/components/killteam/KillteamCard'
import { KillteamPlain } from '@/types'
import { useMemo, useState } from 'react'

type SortOption = 'rosters' | 'positive' | 'votes' | 'name-asc' | 'name-desc'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name A → Z' },
  { value: 'name-desc', label: 'Name Z → A' },
  { value: 'rosters', label: 'Most rosters' },
  { value: 'positive', label: 'Most positive' },
  { value: 'votes', label: 'Most votes' },
]

const voteFilters = [
  { value: 0, label: 'All votes' },
  { value: 5, label: '5+ votes' },
  { value: 10, label: '10+ votes' },
  { value: 20, label: '20+ votes' },
]

export default function HomebrewKillteamsSection({ killteams }: { killteams: KillteamPlain[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('name-asc')
  const [minVotes, setMinVotes] = useState(0)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    let rows = killteams

    if (query) {
      rows = rows.filter((kt) => {
        const name = kt.killteamName?.toLowerCase() ?? ''
        const userName = kt.user?.userName?.toLowerCase() ?? ''
        return name.includes(query) || userName.includes(query)
      })
    }

    if (minVotes > 0) {
      rows = rows.filter((kt) => (kt.voteSummary?.total ?? 0) >= minVotes)
    }

    const sorted = [...rows]
    sorted.sort((a, b) => {
      const sumA = a.voteSummary ?? { ratio: 0, total: 0, upvotes: 0 }
      const sumB = b.voteSummary ?? { ratio: 0, total: 0, upvotes: 0 }

      switch (sort) {
        case 'rosters':
          return (b.rosterCount || 0) - (a.rosterCount || 0)
        case 'positive':
          if (sumB.ratio !== sumA.ratio) return (sumB.ratio ?? 0) - (sumA.ratio ?? 0)
          return (sumB.total ?? 0) - (sumA.total ?? 0)
        case 'votes':
          if (sumB.total !== sumA.total) return (sumB.total ?? 0) - (sumA.total ?? 0)
          return (sumB.upvotes ?? 0) - (sumA.upvotes ?? 0)
        case 'name-desc':
          return b.killteamName.localeCompare(a.killteamName)
        case 'name-asc':
        default:
          return a.killteamName.localeCompare(b.killteamName)
      }
    })

    return sorted
  }, [killteams, search, sort, minVotes])

  return (
    <div className="space-y-4">
      <div className="noprint flex flex-wrap gap-3 items-center justify-between border border-border rounded px-3 py-2">
        <label className="flex flex-1 min-w-[200px] items-center gap-2 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Search</span>
          <input
            type="text"
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main"
            placeholder="Killteam or creator"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="noprint flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sort</span>
            <select
              className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Votes</span>
            <select
              className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main"
              value={minVotes}
              onChange={(e) => setMinVotes(Number(e.target.value))}
            >
              {voteFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {search && (
          <button
            type="button"
            className="text-xs text-main underline"
            onClick={() => setSearch('')}
          >
            Clear search
          </button>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {filtered.map((killteam) => (
          <KillteamCard key={killteam.killteamId} killteam={killteam} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted mt-4">
          No homebrew killteams match those filters.
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center noprint">
        Showing {filtered.length} of {killteams.length} homebrew teams
      </div>
    </div>
  )
}
