'use client'

import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { FiCheck, FiStar } from 'react-icons/fi'
import { RosterLink, UserLink } from '../shared/Links'
import { SectionTitle } from '../ui'

export default function AdminTools() {
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetch('/api/adminstats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch admin stats')
        return res.json()
      })
      .then(setStats)
      .catch(err => {
        console.error(err)
        setError('Could not load stats')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-muted">Loading stats...</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!stats) return null

  return  (
    <div className="space-y-4 mb-8">
      <SectionTitle>Totals</SectionTitle>
      <table className="w-full">
        <thead>
          <tr className="text-center font-bold">
            <td>Users</td>
            <td>Rosters</td>
            <td>Ops</td>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td>{stats.totals.users.toLocaleString()}</td>
            <td>{stats.totals.rosters.toLocaleString()}</td>
            <td>{stats.totals.ops.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <SectionTitle>Stats</SectionTitle>
      <table className="w-full">
        <thead>
          <tr className="font-bold">
            <td>Date</td>
            <td className="text-right">Signups</td>
            <td className="text-right">PageViews</td>
          </tr>
        </thead>
        <tbody>
          {stats.dailyStats.map((dat: any) => (
            <tr key={`dailyStats_${dat.date}`}>
              <td>{dat.date}</td>
              <td className="text-right">{dat.signups.toLocaleString()}</td>
              <td className="text-right">{dat.views.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <SectionTitle>Recent Portraits</SectionTitle>
      {stats.portraitEvents.length === 0 ? (
        <p className="text-muted">No fully custom rosters uploaded recently.</p>
      ) : (
        <div className="space-y-2">
          {stats.portraitEvents.map((e: any) => (
            <div key={e.rosterId}>
              <h6>{format(new Date(e.latestEventAt), 'yyyy-MM-dd HH:mm')}</h6>
              <div key={e.rosterId} className="flex items-center gap-2 text-sm">
                {e.isSpotlight && (<FiStar />)}
                <RosterLink rosterId={e.rosterId} rosterName={e.rosterName} />
                {' by '}
                <UserLink userName={e.userName} />
                (
                  {e.hasCustomPortrait ? '1 - ' : '0 - '}
                  {e.customOps}/{e.totalOps}
                )
                {e.isComplete && (
                  <FiCheck />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}