'use client'

import KillteamCard from '@/components/killteam/KillteamCard'
import { Button } from '@/components/ui'
import { FeatureFlags } from '@/lib/config/flags'
import AddRosterForm from '@/src/components/roster/AddRosterForm'
import RosterCard from '@/src/components/roster/RosterCard'
import { UserPlain } from '@/types'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UserPageClientProps {
  user: UserPlain
  isOwner: boolean
  userName: string
}

export default function UserPageClient({ user, isOwner }: UserPageClientProps) {
  const [rosters, setRosters] = useState(user.rosters)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleDelete = (rosterId: string) => {
    setRosters(rosters => rosters?.filter(roster => roster.rosterId !== rosterId))
  }

  // Get ?tab= value from the URL
  const tabParam: string = searchParams.get('tab') as typeof tab | 'rosters'
  const validTabs = ['rosters', 'killteams'] as const
  type Tab = typeof validTabs[number]

  const defaultTab: typeof tab = 'rosters'

  const [tab, setTab] = useState<Tab>('rosters')
    
  const tabClasses = (selected: boolean) =>
    clsx(
      'px-2 py-2 border-b-2 transition-colors',
      selected
        ? 'border-main text-main'
        : 'border-transparent text-muted hover:text-foreground'
    )
  
  const handleTabChange = (newTab: Tab) => {
    setTab(newTab)

    const url = new URL(window.location.href)

    if (newTab === 'rosters') {
      // This is the default tab, don't set a query string parameter
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', newTab)
    }

    router.replace(url.toString(), { scroll: false })
  }
  
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && validTabs.includes(tabParam as Tab)) {
      setTab(tabParam as Tab)
    } else {
      setTab('rosters')
    }
  }, [searchParams])

  // Move roster at index to newIndex
  const moveRoster = async (from: number, to: number) => {
    if (to < 0 || to >= (rosters?.length ?? 0)) return
    const newRosters = [...rosters ?? []]
    const [moved] = newRosters.splice(from, 1)
    newRosters.splice(to, 0, moved)
    setRosters(newRosters)

    // Prepare payload: [{ rosterId, seq }]
    const payload = newRosters.map((roster, idx) => ({
      rosterId: roster.rosterId,
      seq: idx + 1,
    }))

    try {
      await fetch('/api/rosters/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      // Optionally handle error (e.g., revert UI or show a message)
      console.error('Failed to reorder rosters', err)
    }
  }

  return (
    <div>
      {FeatureFlags.EnableHomebrew && (user.killteams && user.killteams.length > 0) && (
        <div className="overflow-x-auto px-2">
          {/* Tabs  */}
          <div className="flex justify-center space-x-2 border-b border-border mb-4 min-w-max">
            <button className={tabClasses(tab === 'rosters')} onClick={() => handleTabChange('rosters')}>
              Rosters
            </button>
            <button className={tabClasses(tab === 'killteams')} onClick={() => handleTabChange('killteams')}>
              Homebrew
            </button>
          </div>
        </div>
      )}
      
      {/* Rosters */}
      <div key="rostersTab" className={tab === 'rosters' ? 'block' : 'hidden'}>
        <div className="gap-1 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {rosters?.map((roster, idx) => (
            <RosterCard
              key={roster.rosterId}
              roster={roster}
              isOwner={isOwner}
              showUser={false}
              showKillteam={true}
              onMoveUp={isOwner ? () => moveRoster(idx, idx - 1) : () => {}}
              onMoveDown={isOwner ? () => moveRoster(idx, idx + 1) : () => {}}
              onMoveFirst={isOwner ? () => moveRoster(idx, 0) : () => {}}
              onMoveLast={isOwner ? () => moveRoster(idx, rosters.length - 1) : () => {}}
              onDelete={isOwner ? handleDelete : undefined}
            />
          ))}
          {isOwner && <AddRosterForm key="Add Roster" />}
        </div>
      </div>
      
      {/* Killteams (homebrew) */}
      { FeatureFlags.EnableHomebrew && (user.killteams && user.killteams.length > 0) && (
        <div key="killteamsTab" className={tab === 'killteams' ? 'block' : 'hidden'}>
          <div className="gap-1 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {user.killteams?.map((killteam, idx) => (
              <KillteamCard
                key={killteam.killteamId}
                killteam={killteam}
              />
            ))}
            {/** Limit to 10 homebrew per user */}
            <div className="text-center my-auto">
              {(() => {
                const hbCount = (user.killteams || []).filter(kt => (kt as any).isHomebrew ?? kt.factionId === 'HBR').length
                const limitReached = hbCount >= 10
                return (
                  <>
                    <Button
                      disabled={limitReached}
                      onClick={async () => {
                        if (!isOwner) {
                          toast.error('You can only create homebrew on your own page')
                          return
                        }
                        try {
                          const defaultName = `${user.userName}\'s Homebrew Team`
                          const res = await fetch('/api/killteams', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              killteamName: defaultName,
                              isPublished: false,
                            }),
                          })
                          if (!res.ok) {
                            const msg = await res.text().catch(() => '')
                            throw new Error(msg || 'Failed to create homebrew')
                          }
                          const created = await res.json()
                          toast.success('Homebrew created! Redirecting...')
                          router.push(`/killteams/${created.killteamId}/edit`)
                        } catch (err: any) {
                          console.error(err)
                          const message = err?.message?.includes('Homebrew limit') ? err.message : 'Could not create homebrew'
                          toast.error(message)
                        }
                      }}
                    >
                      <h6>{limitReached ? 'Limit Reached' : '+ New Homebrew'}</h6>
                    </Button>
                    {limitReached && (
                      <div className="text-xs text-muted mt-1">You have 10/10 homebrew teams</div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
      {/* If no killteams, show the New Homebrew button after the New Roster button */}
      { FeatureFlags.EnableHomebrew && isOwner && (!user.killteams || user.killteams.length === 0) && (
        <div className="mt-4 text-center">
          <Button
            onClick={async () => {
              try {
                const defaultName = `${user.userName}\'s Homebrew Team`
                const res = await fetch('/api/killteams', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    killteamName: defaultName,
                    isPublished: false,
                  }),
                })
                if (!res.ok) {
                  const msg = await res.text().catch(() => '')
                  throw new Error(msg || 'Failed to create homebrew')
                }
                const created = await res.json()
                toast.success('Homebrew created! Redirecting...')
                router.push(`/killteams/${created.killteamId}/edit`)
              } catch (err: any) {
                console.error(err)
                const message = err?.message?.includes('Homebrew limit') ? err.message : 'Could not create homebrew'
                toast.error(message)
              }
            }}
          >
            <h6>+ New Homebrew</h6>
          </Button>
        </div>
      )}
    </div>
  )
}
