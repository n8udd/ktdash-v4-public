'use client'

import OpCard from '@/components/op/OpCard'
import RosterEquipment from '@/components/roster/RosterEquipment'
import RosterPloys from '@/components/roster/RosterPloys'
import { badgeClass } from '@/components/shared/Links'
import Markdown from '@/components/ui/Markdown'
import { TacOps } from '@/lib/utils/operations'
import { showInfoModal } from '@/lib/utils/showInfoModal'
import { KillteamPlain } from '@/types'
import { WeaponRulePlain } from '@/types/weaponRule.model'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { FiInfo } from 'react-icons/fi'

export default function KillteamPageClient({ killteam }: { killteam: KillteamPlain }) {
  const [tab, setTab] = useState<'operatives' | 'composition' | 'equipment' | 'ploys' | 'tacops'>('operatives')
  const [allWeaponRules, setSpecials] = useState<WeaponRulePlain[] | null>(null)
  const teamTacOps = TacOps.filter((op) => killteam?.archetypes?.includes(op.archetype))
  
  useEffect(() => {
    fetch('/api/specials')
      .then(res => res.json())
      .then(data => setSpecials(data))
      .catch(err => console.error('Failed to fetch specials', err))
  }, [])
  
  const tabClasses = (selected: boolean) =>
    clsx(
      'px-4 py-2 border-b-2 transition-colors',
      selected
        ? 'border-main text-main'
        : 'border-transparent text-muted hover:text-foreground'
    )

  return (
    <div className="max-w-full">
      {/* Tabs  */}
      <div className="flex justify-center space-x-4 border-b border-border mb-4">
        <button className={tabClasses(tab === 'operatives')} onClick={() => setTab('operatives')}>
          Operatives
        </button>
        {false && (
          <button className={tabClasses(tab === 'composition')} onClick={() => setTab('composition')}>
            Composition
          </button>
        )}
        {(killteam?.equipments?.length ?? 0) > 0 && 
          <button className={tabClasses(tab === 'equipment')} onClick={() => setTab('equipment')}>
            Equipment
          </button>
        }
        {(killteam?.ploys?.length ?? 0) > 0 &&
          <button className={tabClasses(tab === 'ploys')} onClick={() => setTab('ploys')}>
            Ploys
          </button>
        }
        <button className={tabClasses(tab === 'tacops')} onClick={() => setTab('tacops')}>
          TacOps
        </button>
      </div>

      <div className="leading-relaxed px-2">
        {/* Operatives */}
        <div className={tab === 'operatives' ? 'block' : 'hidden'}>
          <button className={clsx(badgeClass, 'mb-2')} onClick={() => showInfoModal(
            {
              title: "Composition",
              body:
                <div>
                  <em className="text-main">Archetypes: {killteam?.archetypes ?? 'None'}</em>
                  <hr className="mx-12 my-2" />
                  <Markdown>{killteam?.composition || ''}</Markdown>
                </div>
            }
          )}>
            <FiInfo /> Composition
          </button>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {killteam.opTypes.map((opType) => (
              <OpCard
                key={opType.opTypeId}
                seq={1}
                op={opType}
                isOwner={false}
                roster={null}
                allWeaponRules={allWeaponRules?.map((rule) => rule) ?? []}
              />
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className={tab === 'equipment' ? 'block' : 'hidden'}>
          <RosterEquipment killteam={killteam} />
        </div>
        
        {/* Ploys */}
        <div className={tab === 'ploys' ? 'block' : 'hidden'}>
          <RosterPloys killteam={killteam} isOwner={false} />
        </div>
        
        {/* TacOps */}
        <div className={tab === 'tacops' ? 'block' : 'hidden'}>
          {teamTacOps.map((op) => {
            return (
              <div className="max-w-3xl items-center mx-auto">
                <h6 className="text-main">{op.archetype}: {op.title}</h6>
                <Markdown>{op.description}</Markdown>
                <hr className="mx-12 my-2" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
  