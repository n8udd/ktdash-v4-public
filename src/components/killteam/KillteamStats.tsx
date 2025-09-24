'use client'

import { useEffect, useState } from 'react'

export default function KillteamStats({ killteamId }: { killteamId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalRosters: number
    views7d: number
    rankByRosters: number | null
    rankTotalHomebrew: number
    newRosters7d: number
    newRosters30d: number
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/killteams/${killteamId}/stats`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load stats')
        const data = await res.json()
        if (!cancelled) setStats(data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load stats')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [killteamId])

  if (loading) return null
  if (error || !stats) return null

  const { totalRosters, views7d, rankByRosters, rankTotalHomebrew, newRosters7d, newRosters30d } = stats

  return (
    <div className="noprint mx-auto my-2 max-w-5xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center">
        <div className="border border-border rounded p-2">
          <div className="text-xs text-main">Total Rosters</div>
          <div className="text-lg font-bold">{totalRosters.toLocaleString()}</div>
        </div>
        <div className="border border-border rounded p-2">
          <div className="text-xs text-main">Views (7d)</div>
          <div className="text-lg font-bold">{views7d.toLocaleString()}</div>
        </div>
        <div className="border border-border rounded p-2">
          <div className="text-xs text-main">Rank</div>
          <div className="text-lg font-bold">{rankByRosters ? `#${rankByRosters}/${rankTotalHomebrew}` : '—'}</div>
        </div>
        <div className="border border-border rounded p-2">
          <div className="text-xs text-main">New Rosters (7d)</div>
          <div className="text-lg font-bold">{newRosters7d.toLocaleString()}</div>
        </div>
        <div className="border border-border rounded p-2">
          <div className="text-xs text-main">New Rosters (30d)</div>
          <div className="text-lg font-bold">{newRosters30d.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

