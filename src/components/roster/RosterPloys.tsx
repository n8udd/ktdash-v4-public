'use client'

import Markdown from '@/components/ui/Markdown'
import { KillteamPlain, RosterPlain } from '@/types'

type RosterPloysProps = {
  killteam?: KillteamPlain | null
  roster?: RosterPlain | null
  onRosterUpdate?: (updatedRoster: RosterPlain) => void
}

export default function RosterPloys({ killteam, roster, onRosterUpdate }: RosterPloysProps) {

  return (
    <div className="w-full">
      {killteam?.ploys?.map((ploy, idx) => {
        return (
          <div key={ploy.ployId}>
            <h6 className="text-main">{ploy.ployType == 'S' ? 'Strategy' : 'Firefight'}: {ploy.ployName}</h6>
            <Markdown>{ploy.description}</Markdown>
            <hr className="mx-12 my-2" />
          </div>
        )
      })}
    </div>
  )
}
