'use client'

import OpCard from '@/components/op/OpCard'
import RosterCard from '@/components/roster/RosterCard'
import RosterEquipment from '@/components/roster/RosterEquipment'
import RosterPloys from '@/components/roster/RosterPloys'
import { badgeClass } from '@/components/shared/Links'
import Markdown from '@/components/ui/Markdown'
import { TacOps } from '@/lib/utils/operations'
import { showInfoModal } from '@/lib/utils/showInfoModal'
import { KillteamPlain } from '@/types'
import { WeaponRulePlain } from '@/types/weaponRule.model'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import KillteamStats from '@/components/killteam/KillteamStats'

export default function KillteamPageClient({ killteam }: { killteam: KillteamPlain }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const validTabs = ['operatives', 'composition', 'equipment', 'ploys', 'tacops', 'rosters'] as const
  type Tab = typeof validTabs[number]
  
  const tabParam = searchParams.get('tab')
  const initialTab = validTabs.includes(tabParam as Tab) ? (tabParam as Tab) : 'operatives'

  const [tab, setTab] = useState<Tab>(initialTab)
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
      'px-2 py-2 border-b-2 transition-colors',
      selected ? 'border-main text-main' : 'border-transparent text-muted hover:text-foreground'
    )

  // ===== Pretty URL helpers =====
  const getBasePath = (path: string) => {
    const parts = path.split('/').filter(Boolean)
    const last = parts[parts.length - 1]
    if (validTabs.includes(last as Tab)) parts.pop()
    return '/' + parts.join('/')
  }

  const getInitialTab = (): Tab => {
    const parts = pathname.split('/').filter(Boolean)
    const last = parts[parts.length - 1]
    if (validTabs.includes(last as Tab)) return last as Tab

    const q = searchParams.get('tab')
    if (validTabs.includes(q as Tab)) return q as Tab

    return 'operatives'
  }

  const basePath = getBasePath(pathname)

  useEffect(() => {
    // Normalize legacy ?tab=... to pretty path once
    const q = searchParams.get('tab')
    if (q && validTabs.includes(q as Tab)) {
      const pretty = q === 'operatives' ? basePath : `${basePath}/${q}`
      router.replace(pretty, { scroll: false })
      return
    }

    // Sync state with current path segment
    const parts = pathname.split('/').filter(Boolean)
    const last = parts[parts.length - 1]
    const nextTab = validTabs.includes(last as Tab) ? (last as Tab) : 'operatives'
    if (nextTab !== tab) setTab(nextTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab)
    const nextPath = newTab === 'operatives' ? basePath : `${basePath}/${newTab}`
    router.replace(nextPath, { scroll: false })
  }

  return (
    <div className="max-w-full">
      {/* Stats (homebrew or official; rank only meaningful for homebrew) */}
      <KillteamStats killteamId={killteam.killteamId} />
      <div className="overflow-x-auto px-2 noprint">
        {/* Tabs  */}
        <div className="flex justify-center space-x-2 border-b border-border mb-4 min-w-max">
          <button className={tabClasses(tab === 'operatives')} onClick={() => handleTabChange('operatives')}>
            Operatives
          </button>
          {false && (
            <button className={tabClasses(tab === 'composition')} onClick={() => handleTabChange('composition')}>
              Composition
            </button>
          )}
          {(killteam?.equipments?.length ?? 0) > 0 && 
            <button className={tabClasses(tab === 'equipment')} onClick={() => handleTabChange('equipment')}>
              Equipment
            </button>
          }
          {(killteam?.ploys?.length ?? 0) > 0 &&
            <button className={tabClasses(tab === 'ploys')} onClick={() => handleTabChange('ploys')}>
              Ploys
            </button>
          }
          <button className={tabClasses(tab === 'tacops')} onClick={() => handleTabChange('tacops')}>
            TacOps
          </button>
          {(killteam?.spotlightRosters?.length ?? 0) > 0 &&
            <button className={tabClasses(tab === 'rosters')} onClick={() => handleTabChange('rosters')}>
              Rosters
            </button>
          }
        </div>
      </div>

      <div key="tabs" className="leading-relaxed px-2">
        {/* Operatives */}
        <div key="operativesTab" className={tab === 'operatives' ? 'block' : 'hidden'}>
          <button className={clsx(badgeClass, 'mb-2 noprint')} onClick={() => showInfoModal(
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
          <div key="operativesList" className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
        <div key="equipmentTab" className={tab === 'equipment' ? 'block' : 'hidden'}>
          <RosterEquipment killteam={killteam} />
        </div>
        
        {/* Ploys */}
        <div key="ployTab" className={tab === 'ploys' ? 'block' : 'hidden'}>
          <RosterPloys killteam={killteam} isOwner={false} />
        </div>
        
        {/* TacOps */}
        <div key="tacOpsTab" className={tab === 'tacops' ? 'block' : 'hidden'}>
          {teamTacOps.map((op) => {
            return (
              <div className="max-w-3xl items-center mx-auto" key={op.title}>
                <h6 className="text-main">{op.archetype}: {op.title}</h6>
                <Markdown>{op.description}</Markdown>
                <hr className="mx-12 my-2" />
              </div>
            )
          })}
        </div>
        
        {/* Rosters/Spotlight */}
        <div key="rostersTab" className={tab === 'rosters' ? 'block' : 'hidden'}>
          <div className="gap-1 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {killteam.spotlightRosters?.map((roster) => {
              return (
                <RosterCard 
                  key={roster.rosterId}
                  roster={roster}
                  isOwner={false}
                  showUser={true}
                  showKillteam={false}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
  
