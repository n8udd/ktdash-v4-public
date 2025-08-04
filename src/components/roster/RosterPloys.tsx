'use client'

import Markdown from '@/components/ui/Markdown'
import { KillteamPlain, RosterPlain } from '@/types'
import { toast } from 'sonner'
import { Checkbox } from '../ui'

type RosterPloysProps = {
  killteam?: KillteamPlain | null
  roster?: RosterPlain | null
  isOwner: Boolean
  onRosterUpdate?: (updatedRoster: RosterPlain) => void
}

export default function RosterPloys({ killteam, roster, isOwner, onRosterUpdate }: RosterPloysProps) {
  const rosterPloyIds = roster?.ployIds?.split(',').filter(Boolean) ?? [];

  const togglePloy = async (ployId: string) => {
    if (!roster) return;

    const isSelected = rosterPloyIds.includes(ployId)
    const newPloyIds = isSelected
      ? rosterPloyIds.filter(id => id !== ployId)
      : [...rosterPloyIds, ployId]

    const res = await fetch(`/api/rosters/${roster.rosterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ployIds: newPloyIds.join(',') }),
    })

    if (res.ok) {
      const updated = await res.json()
      onRosterUpdate?.(updated)
    } else {
      toast.error('Failed to update ploy')
    }
  }

  return (
    <div className="max-w-3xl items-center mx-auto">
      {killteam?.ploys?.map((ploy, idx) => {
        return (
          <div key={ploy.ployId}>
            <h6 className="text-main">
              {isOwner && (
                <Checkbox
                  className="mr-2"
                  checked={rosterPloyIds.includes(ploy.ployId)}
                  onChange={() => togglePloy(ploy.ployId)}
                />
              )}
              {ploy.ployType == 'S' ? 'Strategy' : 'Firefight'}: {ploy.ployName}
            </h6>
            <Markdown>{ploy.description}</Markdown>
            <hr className="mx-12 my-2" />
          </div>
        )
      })}
    </div>
  )
}
