'use client'

import Markdown from '@/components/ui/Markdown'
import { CritOps, KillOpChart, TacOps } from '@/lib/utils/operations'
import { getRandom } from '@/lib/utils/utils'
import { KillteamPlain, RosterPlain } from '@/types'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { GiRollingDices } from 'react-icons/gi'
import { toast } from 'sonner'
import { Checkbox } from '../ui'

type KillteamInfoProps = {
  killteam?: KillteamPlain | null
  roster?: RosterPlain | null
  onRosterUpdate?: (updatedRoster: RosterPlain) => void
}

export default function KillteamInfo({ killteam, roster, onRosterUpdate }: KillteamInfoProps) {
  const [tab, setTab] = useState<'composition' | 'equip' | 'ploys' | 'ops' | 'tacops'>('composition')
  const [rosterEqIds, setRosterEqIds] = useState<string[]>(roster?.eqIds?.split(',').filter(Boolean) ?? []);
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
  
  const teamTacOps = TacOps.filter((op) => killteam?.archetypes?.includes(op.archetype))

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

  const selectedCritOp = CritOps.find(
    (m) => m.title === selectedCritOpTitle
  )

  const selectedTacOp = teamTacOps.find(
    (m) => m.title === selectedTacOpTitle
  )

  const selectedKillOp = KillOpChart[Number(startingEnemyOps) - 5]

  const tabClasses = (selected: boolean) =>
    clsx(
      'px-4 py-2 border-b-2 transition-colors',
      selected
        ? 'border-main text-main'
        : 'border-transparent text-muted hover:text-foreground'
    )
  
  const toggleEquipment = async (eqId: string) => {
    const isSelected = rosterEqIds.includes(eqId)
    const newEqIds = isSelected
      ? rosterEqIds.filter(id => id !== eqId)
      : [...rosterEqIds, eqId]

    setRosterEqIds(newEqIds) // 💡 optimistic UI update

    const res = await fetch(`/api/rosters/${roster?.rosterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eqIds: newEqIds.join(',') }),
    })

    if (res.ok) {
      const updated = await res.json()
      onRosterUpdate?.(updated)
    } else {
      toast.error('Failed to update equipment')
      setRosterEqIds(rosterEqIds) // Roll back if error
    }
  }
  
  // Map the custom and universal equipments (excluding selected ones if we have a roster object)
  const bespokeEq = killteam?.equipments.filter((eq) => eq.killteamId != null && !rosterEqIds.includes(eq.eqId));
  const universalEq = killteam?.equipments.filter((eq) => eq.killteamId == null && !rosterEqIds.includes(eq.eqId));

  return (
    <div className="w-full">
      <div className="flex justify-center space-x-4 border-b border-border mb-4">
        <button className={tabClasses(tab === 'composition')} onClick={() => setTab('composition')}>
          Composition
        </button>
        {(killteam?.equipments?.length ?? 0) > 0 && 
          <button className={tabClasses(tab === 'equip')} onClick={() => setTab('equip')}>
            Equipment
          </button>
        }
        {(killteam?.ploys?.length ?? 0) > 0 &&
          <button className={tabClasses(tab === 'ploys')} onClick={() => setTab('ploys')}>
            Ploys
          </button>
        }
        {roster && 
        <button className={tabClasses(tab === 'ops')} onClick={() => setTab('ops')}>
          Ops
        </button>
        }
        {!roster && 
        <button className={tabClasses(tab === 'tacops')} onClick={() => setTab('tacops')}>
          TacOps
        </button>
        }
      </div>

      <div className="leading-relaxed max-h-[60vh] overflow-y-auto px-2">
        <div className={tab === 'composition' ? 'block' : 'hidden'}>
          <em className="text-main">Archetypes: {killteam?.archetypes ?? 'None'}</em>
          <hr className="mx-12 my-2" />
          <Markdown>{killteam?.composition || ''}</Markdown>
        </div>
        <div className={tab === 'equip' ? 'block' : 'hidden'}>
          {roster && rosterEqIds && rosterEqIds.length > 0 &&
            <h4 className="text-main text-center my-4">Selected Equipment</h4>
          }
          {roster && killteam?.equipments
            ?.filter(eq => rosterEqIds.includes(eq.eqId))
            .map(eq => (
              <div key={eq.eqId}>
                <div className="flex items-center gap-2">
                  <h6 className="text-main">
                    <Checkbox
                      className="mr-2"
                      checked={rosterEqIds.includes(eq.eqId)}
                      onChange={() => toggleEquipment(eq.eqId)}
                    />
                    {eq.eqName}
                  </h6>
                  {eq.killteamId == null && (<em className="text-muted">(Universal)</em>)}
                </div>
                <Markdown>{eq.description || ''}</Markdown>
                <hr className="mx-12 my-2" />
              </div>
          ))}
          {roster != null &&
            <h4 className="text-main text-center my-4">Inactive Equipment</h4>
          }
          {bespokeEq?.map((eq, idx) => {
            return (
              <div key={eq.eqId}>
                <div className="flex items-center gap-2">
                  <h6 className="text-main">
                    {roster && (
                      <Checkbox
                        className="mr-2"
                        checked={rosterEqIds.includes(eq.eqId)}
                        onChange={() => toggleEquipment(eq.eqId)}
                      />
                    )}
                    {eq.eqName}
                  </h6>
                  {eq.killteamId == null && (<em className="text-muted">(Universal)</em>)}
                </div>
                <Markdown>{eq.description || ''}</Markdown>
                <hr className="mx-12 my-2" />
              </div>
            )
          })}
          {universalEq && universalEq.length > 0 &&
            <h4 className="text-main text-center my-4">Universal Equipment</h4>
          }
          {universalEq && universalEq.map((eq, idx) => {
            return (
              <div key={eq.eqId}>
                <div className="flex items-center gap-2">
                  <h6 className="text-main">
                    {roster && (
                      <Checkbox
                        className="mr-2"
                        checked={rosterEqIds.includes(eq.eqId)}
                        onChange={() => toggleEquipment(eq.eqId)}
                      />
                    )}
                    {eq.eqName}
                  </h6>
                  {eq.killteamId == null && (<em className="text-muted">(Universal)</em>)}
                </div>
                <Markdown>{eq.description || ''}</Markdown>
                <hr className="mx-12 my-2" />
              </div>
            )
          })}
        </div>
        <div className={tab === 'ploys' ? 'block' : 'hidden'}>
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
        {roster && 
          <div className={tab === 'ops' ? 'block' : 'hidden'}>
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
                      {CritOps.map((op) => (
                        <option key={op.title} value={op.title}>
                          {op.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center text-lg border border-border border-l-0 rounded-r-md bg-zinc-900 hover:bg-zinc-800"
                      onClick={() => {
                        if (CritOps.length === 0) return
                        const currentCritOpTitle = selectedCritOpTitle
                        let randomCritOp = getRandom(CritOps)

                        // Make sure we give them a different op
                        while (randomCritOp.title === currentCritOpTitle && CritOps.length > 1) {
                          randomCritOp = getRandom(CritOps)
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
                      <option value="">Select team size...</option>
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
        }
        {!roster &&
          <div className={tab === 'tacops' ? 'block' : 'hidden'}>
              {teamTacOps.map((op) => {
                return (
                  <div>
                    <h6 className="text-main">{op.archetype}: {op.title}</h6>
                    <Markdown>{op.description}</Markdown>
                    <hr className="mx-12 my-2" />
                  </div>
                )
              })}
          </div>
        }
      </div>
    </div>
  )
}
