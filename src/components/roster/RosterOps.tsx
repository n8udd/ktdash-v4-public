'use client'

import Markdown from '@/components/ui/Markdown'
import { getSetting } from '@/lib/settings'
import { CritOps, CritOps2024, KillOpChart, TacOps, TacOps2024 } from '@/lib/utils/operations'
import { getRandom } from '@/lib/utils/utils'
import { RosterPlain } from '@/types'
import { useEffect, useState } from 'react'
import { GiRollingDices } from 'react-icons/gi'

type RosterOpsProps = {
  roster?: RosterPlain | null
  onRosterUpdate?: (updatedRoster: RosterPlain) => void
}

export default function RosterOps({ roster, onRosterUpdate }: RosterOpsProps) {
  const critOps = getSetting('critOps') == '2024' ? CritOps2024 : CritOps
  const tacOps = getSetting('tacOps') == '2024' ? TacOps2024 : TacOps

  const [selectedCritOpTitle, setSelectedCritOpTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCritOpTitle') || ''
    }
    return ''
  })
  const [selectedTacOpTitle, setSelectedTacOpTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedTacOpTitle') || ''
    }
    return ''
  })
  const [startingEnemyOps, setStartingEnemyOps] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('startingEnemyOps') || '0'
    }
    return '0'
  })
  
  const teamTacOps = tacOps.filter((op) => roster?.killteam?.archetypes?.includes(op.archetype))

  useEffect(() => {
    if (selectedCritOpTitle) {
      localStorage.setItem('selectedCritOpTitle', selectedCritOpTitle)
    } else {
      localStorage.removeItem('selectedCritOpTitle')
    }
  }, [selectedCritOpTitle])

  useEffect(() => {
    if (selectedTacOpTitle) {
      localStorage.setItem('selectedTacOpTitle', selectedTacOpTitle)
    } else {
      localStorage.removeItem('selectedTacOpTitle')
    }
  }, [selectedTacOpTitle])

  useEffect(() => {
    if (startingEnemyOps) {
      localStorage.setItem('startingEnemyOps', startingEnemyOps)
    } else {
      localStorage.removeItem('startingEnemyOps')
    }
  }, [startingEnemyOps])

  const selectedCritOp = critOps.find(
    (m) => m.title === selectedCritOpTitle
  )

  const selectedTacOp = teamTacOps.find(
    (m) => m.title === selectedTacOpTitle
  )

  const selectedKillOp = KillOpChart[Number(startingEnemyOps) - 5]

  return (
    <div className="max-w-3xl items-center mx-auto">
      {/* Selectors for CritOp, TacOp, and KillOp (starting enemy operatives) */}
                    
      {/* CritOp Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm w-20">CritOp:</span>
          <div className="flex flex-1">
            <select
              className="flex-1 h-8 px-3 text-sm bg-card border border-border rounded-l-md appearance-none"
              value={selectedCritOpTitle}
              onChange={(e) => setSelectedCritOpTitle(e.target.value)}
            >
              <option value="">Select a Crit op...</option>
              {critOps.map((op) => (
                <option key={op.title} value={op.title}>
                  {op.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-lg border border-border border-l-0 rounded-r-md bg-zinc-900 hover:bg-zinc-800"
              onClick={() => {
                if (critOps.length === 0) return
                const currentCritOpTitle = selectedCritOpTitle
                let randomCritOp = getRandom(critOps)

                // Make sure we give them a different op
                while (randomCritOp.title === currentCritOpTitle && critOps.length > 1) {
                  randomCritOp = getRandom(critOps)
                }
                setSelectedCritOpTitle(randomCritOp.title)
              }}
            >
              <GiRollingDices />
            </button>
          </div>
        </div>
      </div>

      {/* TacOp Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm w-20">TacOp:</span>
          <div className="flex flex-1">
            <select
              className="flex-1 h-8 px-3 text-sm bg-card border border-border rounded-l-md appearance-none"
              value={selectedTacOpTitle}
              onChange={(e) => setSelectedTacOpTitle(e.target.value)}
            >
              <option value="">Select a Tac op...</option>
              {teamTacOps.map((op) => (
                <option key={op.title} value={op.title}>
                  {op.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-lg border border-border border-l-0 rounded-r-md bg-zinc-900 hover:bg-zinc-800"
              onClick={() => {
                if (teamTacOps.length === 0) return
                const currentTacOpTitle = selectedTacOpTitle
                let randomTacOp = getRandom(teamTacOps)

                // Make sure we give them a different op
                while (randomTacOp.title === currentTacOpTitle && teamTacOps.length > 1) {
                  randomTacOp = getRandom(teamTacOps)
                }
                setSelectedTacOpTitle(randomTacOp.title)
              }}
            >
              <GiRollingDices />
            </button>
          </div>
        </div>
      </div>
      
      {/* KillOp Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm w-20">KillOp:</span>
          <div className="flex flex-1">
            <select
              className="flex-1 h-8 px-3 text-sm bg-card border border-border rounded-md appearance-none"
              value={startingEnemyOps}
              onChange={(e) => setStartingEnemyOps(e.target.value)}
            >
              <option value="">Select opponent team size...</option>
              <option value="5">5 Enemy Operatives</option>
              <option value="6">6 Enemy Operatives</option>
              <option value="7">7 Enemy Operatives</option>
              <option value="8">8 Enemy Operatives</option>
              <option value="9">9 Enemy Operatives</option>
              <option value="10">10 Enemy Operatives</option>
              <option value="11">11 Enemy Operatives</option>
              <option value="12">12 Enemy Operatives</option>
              <option value="13">13 Enemy Operatives</option>
              <option value="14">14 Enemy Operatives</option>
            </select>
          </div>
        </div>
      </div>
      <hr/>

      {/* Show the actual selections */}
      {selectedCritOp && 
        <>
          <h5 className="text-main">CritOp: {selectedCritOp.title}</h5>
          <Markdown>{selectedCritOp.description}</Markdown>
          <hr/>
        </>
      }
      {selectedTacOp && 
        <>
          <h5 className="text-main">TacOp: {selectedTacOp.title}</h5>
          <Markdown>{selectedTacOp.description}</Markdown>
          <hr/>
        </>
      }
      {selectedKillOp && 
        <>
          <h5 className="text-main">KillOp:</h5>
          <table className="text-center">
            <thead>
              <tr className="text-center">
                <th>Kills</th>
                {selectedKillOp.map((obj, idx) => (
                  <th className="text-center" key={idx}>
                    {obj}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                <th>VP</th>
                {selectedKillOp.map((obj, idx) => (
                  <td key={idx}>
                    {idx + 1} VP
                  </td>
                ))}
              </tr>
            </tbody>                    
          </table>
        </>
      }
    </div>
  )
}
