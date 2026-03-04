'use client'

import RosterSpotlightCard from '@/components/roster/RosterSpotlightCard'
import { RosterPlain } from '@/types'
import { useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'

export default function RosterSpotlight({ initialRoster }: { initialRoster: RosterPlain }) {
  const [roster, setRoster] = useState<RosterPlain>(initialRoster)
  const [loading, setLoading] = useState(false)

  async function handleRefresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/rosters/spotlight')
      if (res.ok) {
        const data = await res.json()
        setRoster(data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-2 py-8 max-w-lg mx-auto">
      <div className="cursor-pointer flex items-center justify-center gap-2 mb-1">
        <h4 className="text-center text-main font-title" onClick={handleRefresh}>
          Roster Spotlight
        </h4>
        <button
          type="button"
          disabled={loading}
          onClick={handleRefresh}
          title="Show another spotlight roster"
          className="text-muted hover:text-main transition-colors disabled:opacity-40"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <p className="font-heading text-sm italic text-muted text-center mb-4 tracking-wide">Rosters built by the KTDash community</p>
      <RosterSpotlightCard key={roster.rosterId} roster={roster} />
    </div>
  )
}
