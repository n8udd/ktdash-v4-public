'use client'

import AddOpForm from '@/components/op/AddOpForm';
import OpCard from '@/components/op/OpCard';
import EditRosterForm from '@/components/roster/EditRosterForm';
import RosterCardMenu from '@/components/roster/RosterCardMenu';
import RosterEquipment from '@/components/roster/RosterEquipment';
import RosterOps from '@/components/roster/RosterOps';
import RosterPloys from '@/components/roster/RosterPloys';
import { badgeClass, KillteamLink, UserLink } from '@/components/shared/Links';
import { Button, Checkbox, Modal } from '@/components/ui';
import CarouselModal, { CarouselItem } from '@/components/ui/CarouselModal';
import Markdown from '@/components/ui/Markdown';
import PageTitle from '@/components/ui/PageTitle';
import { getOpPortraitUrl, getRosterPortraitUrl } from '@/lib/utils/imageUrls';
import { showInfoModal } from '@/lib/utils/showInfoModal';
import { getRosterRepeatedAbilitiesAndOptions } from '@/lib/utils/utils';
import { WeaponRule } from '@/lib/utils/weaponRules';
import { OpPlain, RosterPlain } from '@/types';
import { Menu, MenuButton } from '@headlessui/react';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiDownload, FiInfo, FiList, FiMoreVertical, FiRotateCcw, FiStar } from 'react-icons/fi';
import { toast } from 'sonner';

export default function RosterPageClient({
  initialRoster,
  isOwner,
}: {
  initialRoster: RosterPlain
  isOwner: boolean
}) {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Get ?tab= value from the URL
  const validTabs = ['operatives', 'equipment', 'ploys', 'ops', 'gallery'] as const
  type Tab = typeof validTabs[number]

  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = validTabs.includes(tabParam as Tab) ? (tabParam as Tab) : 'operatives'

  const [tab, setTab] = useState<Tab>(initialTab)

  const [ops, setOps] = useState<OpPlain[]>(initialRoster.ops ?? [])
  const [roster, setRoster] = useState(initialRoster)
  const [allWeaponRules, setSpecials] = useState<WeaponRule[] | null>(null)
  const formRef = useRef<{ handleSubmit: () => void }>(null)
  const [showResetModal, setShowResetModal] = useState<Boolean>(false)
  const [showEditRosterModal, setShowEditRosterModal] = useState<Boolean>(false)
  const [carouselIsOpen, setCarouselIsOpen] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);

  const pathname = usePathname()
  
  // For printing - Get operative unique abilities and options
  const { abilities: rosterAbilities, options: rosterOptions } = getRosterRepeatedAbilitiesAndOptions(roster ?? undefined)

  useEffect(() => {
    fetch('/api/specials')
      .then(res => res.json())
      .then(data => setSpecials(data))
      .catch(err => console.error('Failed to fetch specials', err))
  }, [])

  useEffect(() => {
    setOps(roster.ops ?? [])
  }, [roster.ops])
  
  const openCarousel = () => {
    console.log("Opening carousel")
    setCarouselIsOpen(true)
  }

  const closeCarousel = () => {
    console.log("Closing carousel")
    setCarouselIsOpen(false)
  }

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

    if (newTab === 'operatives') {
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
      setTab('operatives')
    }
  }, [searchParams])

  const updateOp = (updated: OpPlain) => {
    setOps(prev =>
      prev.map(u => (u.opId === updated.opId ? updated : u))
    )
  }

  const deleteOp = async(opId: string) => {
    // Remove the op locally from the array
    const updatedOps = ops.filter(u => u.opId !== opId)

    // Update local state
    setOps(updatedOps)

    // Update op Seqs so they stay sequential and in order
    await updateOpSeqs(updatedOps)
  }

  const addOp = async(newOp: OpPlain) => {
    const updatedOps = [...ops, newOp]
    setOps(updatedOps)
    await updateOpSeqs(updatedOps)
  }

  const updateRosterField = async (field: string, value: number) => {
    if (value < 0) return
    if (value < 1 && field == 'turn') return

    const patch: Partial<typeof roster> = { [field]: value }

    // Note the API/service will handle resetting op activation on turn increase
    const res = await fetch(`/api/rosters/${roster.rosterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  
    if (res.ok) {
      const updated = await res.json()
      setRoster(updated)
    } else {
      console.error('Failed to update roster field:', field)
    }
  }
  
  const updateRosterInfo = async (name: string, description: string | null) => {
    const res = await fetch(`/api/rosters/${roster.rosterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        rosterName: name,
        description: description
      }),
    })

    if (res.ok) {
      const updated = await res.json()
      setRoster(updated)
      setShowEditRosterModal(false)
    } else {
      console.error('Failed to update roster info')
      toast.error('Failed to save roster')
    }
  }

  const handleResetClick = () => { setShowResetModal(true)}

  const handleRosterPrint = () => {
    window.print();
  }

  const handleEditRosterClick = () => { setShowEditRosterModal(true)}

  const toggleSpotlight = async (rosterId: string) => {
    const res = await fetch(`/api/rosters/${roster.rosterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        isSpotlight: !roster.isSpotlight
      }),
    })

    if (res.ok) {
      const updated = await res.json()
      setRoster(updated)
    } else {
      console.error('Failed to update roster spotlight')
      toast.error('Failed to save roster spotlight')
    }
  }

  // Add resetRoster function after other state updates
  const resetRoster = async () => {
    const res = await fetch(`/api/rosters/${roster.rosterId}/reset`, {
      method: 'POST',
    })

    if (res.ok) {
      const updated = await res.json()
      setRoster(updated)
      // Reset all ops' activation state
      setOps(prev => prev.map(op => ({ ...op, isActivated: false })))
      toast.success('Roster reset')
    } else {
      console.error('Failed to reset game')
      toast.error('Failed to reset roster')
    }
  }

  // Move op at index to newIndex
  const moveOp = async(from: number, to: number) => {
    if (to < 0 || to >= ops.length) return
    const newOps = [...ops]
    const [moved] = newOps.splice(from, 1)
    newOps.splice(to, 0, moved)
    setOps(newOps)

    await updateOpSeqs(newOps)
  }

  const updateOpSeqs = async(ops: OpPlain[]) => {
    // Prepare payload: [{ opId, seq }]
    const payload = ops.map((op, idx) => ({
      opId: op.opId,
      seq: idx + 1,
    }))

    try {
      await fetch('/api/ops/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      // Optionally handle error (e.g., revert UI or show a message)
      console.error('Failed to reorder ops', err)
    }
  }

  const carouselItems: CarouselItem[] = [];
  if (roster.hasCustomPortrait) {
    carouselItems.push({title: roster.rosterName, imageUrl: `${getRosterPortraitUrl(roster.rosterId)}?v=${roster.updatedAt}` })
  }
  roster.ops?.filter(op => op.hasCustomPortrait).map(op => op.hasCustomPortrait && carouselItems.push({title: op.opName, imageUrl: `${getOpPortraitUrl(op.opId)}?v=${op.updatedAt}`}));

  const handlePortraitClick = (clickedUrl: string) => {
    const index = carouselItems.findIndex(item => item.imageUrl === clickedUrl);
    console.log("  Found at index", index)
    if (index >= 0) {
      setCarouselStartIndex(index)
      openCarousel()
    }
  }
  
  return (
    <>
      <div>
        {/* Full-width roster header */}
        <div className="relative w-full min-h-[150px] md:min-h-[150px] print:md:min-h-[0px] noprint">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-top"
            style={{
              backgroundImage: `url('${
                roster.hasCustomPortrait
                  ? `${getRosterPortraitUrl(roster.rosterId)}?v=${roster.updatedAt}`
                  : `/img/killteams/${roster.killteam?.killteamId}.jpg`
              }')`,
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/80 to-background" />

          {/* Foreground content */}
          <div className="cursor-pointer relative z-10 flex flex-col items-center justify-end text-center h-full pt-28 md:pt-20 pb-6 px-4 print:pt-1 print:pb-1">
            <div className="flex items-center gap-2">
              <PageTitle onClick={isOwner && handleEditRosterClick}>
                {roster.rosterName}
              </PageTitle>
            </div>

            {/* Meta info below title */}
            <div className="flex items-center flex-wrap justify-center gap-2 text-muted-foreground text-sm mt-2">
              <KillteamLink
                killteamId={roster.killteamId}
                killteamName={roster.killteam?.killteamName || 'Unknown Killteam'}
              />
              <span>by</span>
              <UserLink userName={roster.user?.userName || 'Unknown User'} />

              {!isOwner && status === 'authenticated' && (
                <Button
                  className="cursor-pointer items-center p-0 noprint"
                  title="Import this Squad to your Squads"
                  aria-label="Import this squad"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/rosters/${roster.rosterId}/clone`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          rosterName: roster.rosterName,
                          killteamId: roster.killteamId,
                        }),
                      })

                      if (!res.ok) throw new Error('Failed to import roster')

                      const { rosterId } = await res.json()
                      router.push(`/rosters/${rosterId}`)
                    } catch (err) {
                      console.error(err)
                      toast.error('Could not import squad')
                    }
                  }}
                >
                  <FiDownload /> Import
                </Button>
              )}
            </div>

            {/* Description below meta */}
            {roster.description && (
              <div className="mt-4 max-w-3xl text-sm text-muted-foreground max-h-[150px] overflow-y-auto noprint">
                <Markdown>{roster.description}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trackers */}
      {isOwner && (
        <div className="sticky top-0 lg:top-[3.5rem] max-w-xl mx-auto z-20 bg-background py-2 px-1 flex gap-2 items-center justify-between noprint">
          {[
            { label: 'TURN', key: 'turn' },
            { label: 'VP', key: 'VP' },
            { label: 'CP', key: 'CP' },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <h6 className="font-bold text-main">{label}:</h6>
              <div className="flex items-center">
                {isOwner && (
                  <button
                    className="flex items-center justify-center rounded border border-border w-6 h-6 text-lg"
                    onClick={() => updateRosterField(key, roster[key as 'turn' | 'VP' | 'CP'] - 1)}
                  >−</button>
                )}
                <h4 className="stat w-7 text-center">{roster[key as 'turn' | 'VP' | 'CP']}</h4>
                {isOwner && (
                  <button
                    className="flex items-center justify-center rounded border border-border w-6 h-6 text-lg"
                    onClick={() => updateRosterField(key, roster[key as 'turn' | 'VP' | 'CP'] + 1)}
                  >+</button>
                )}
              </div>
            </div>
          ))}
            <div className="flex flex-col items-center gap-1">
              <h6 className="font-bold text-main invisible">1</h6>
              <div key="resetEditRoster" className="flex items-center">
                <div className="flex gap-2 items-center justify-center">
                  <button
                    className="flex items-center justify-center rounded border border-border w-6 h-6 text-lg"
                    onClick={handleResetClick}
                  >
                    <FiRotateCcw/>
                  </button>
                </div>
                <div className="flex gap-2 items-center justify-center">
                  <button
                    className="flex items-center justify-center rounded border border-border w-6 h-6 text-lg"
                  >
                    <Menu as="div" className="relative flex-shrink-0">
                      <MenuButton as="button" className="p-1">
                        <FiMoreVertical className="w-5 h-5" />
                      </MenuButton>
                      <RosterCardMenu
                        roster={roster}
                        isOwner={isOwner}
                        onEdit={handleEditRosterClick}
                        onPrint={handleRosterPrint}
                      />
                    </Menu>
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto print:max-w-none">
        <div className="overflow-x-auto px-2 noprint">
          {/* Tabs  */}
          <div className="flex justify-center space-x-2 border-b border-border mb-4">
            <button className={tabClasses(tab === 'operatives')} onClick={() => handleTabChange('operatives')}>
              Operatives
            </button>
            {isOwner && (roster.killteam?.equipments?.length ?? 0) > 0 && 
              <button className={tabClasses(tab === 'equipment')} onClick={() => handleTabChange('equipment')}>
                Equipment
              </button>
            }
            {isOwner && (roster.killteam?.ploys?.length ?? 0) > 0 &&
              <button className={tabClasses(tab === 'ploys')} onClick={() => handleTabChange('ploys')}>
                Ploys
              </button>
            }
            {isOwner && roster && 
              <button className={tabClasses(tab === 'ops')} onClick={() => handleTabChange('ops')}>
                Ops
              </button>
            }
            {roster && carouselItems.length > 0 &&
              <button className={tabClasses(tab === 'gallery')} onClick={() => handleTabChange('gallery')}>
                Gallery
              </button>
            }
          </div>
        </div>
        
        <div className="leading-relaxed px-1">
          {/* Operatives */}
          {tab === 'operatives' && (
            <div className={tab === 'operatives' ? 'block' : 'hidden'}>
              <h3 className="printonly">Operatives</h3>
              {isOwner && (
                <div className="flex justify-between items-center mb-2 noprint">
                  <button className={clsx(badgeClass, 'mb-2')} onClick={() => showInfoModal(
                    {
                      title: "Composition",
                      body:
                        <div>
                          <em className="text-main">Archetypes: {roster.killteam?.archetypes ?? 'None'}</em>
                          <hr className="mx-12 my-2" />
                          <Markdown>{roster.killteam?.composition || ''}</Markdown>
                        </div>
                    }
                  )}>
                    <FiInfo /> Composition
                  </button>
                  <button className={clsx(badgeClass, 'mb-2')} onClick={() => setShowDeploymentModal(true)}>
                    <FiList /> Deploy/Reserve
                  </button>
                </div>
              )}

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <>
                  {/* Deployed Ops */}
                  {ops.filter((op) => op.isDeployed).map((op, idx) => {
                    return (
                      <OpCard
                        key={op.opId}
                        seq={idx + 1}
                        op={op}
                        roster={roster}
                        isOwner={isOwner}
                        allWeaponRules={allWeaponRules ?? []}
                        onOpUpdated={updateOp}
                        onOpDeleted={deleteOp}
                        onMoveUp={isOwner ? () => moveOp(idx, idx - 1) : () => {}}
                        onMoveDown={isOwner ? () => moveOp(idx, idx + 1) : () => {}}
                        onMoveFirst={isOwner ? () => moveOp(idx, 0) : () => {}}
                        onMoveLast={isOwner ? () => moveOp(idx, ops.length - 1) : () => {}}
                        onPortraitClick={() => handlePortraitClick(`${getOpPortraitUrl(op.opId)}?v=${op.updatedAt}`)}
                      />)
                  })}
                  
                  {/* Reserves Section */}
                  {ops.some(op => !op.isDeployed) && (
                    <>
                      <h4 className="col-span-full text-muted tracking-wide mt-2">
                        Reserves
                      </h4>
                      {ops.filter(op => !op.isDeployed).map((op, idx) => (
                        <OpCard
                          key={op.opId}
                          seq={idx + 1}
                          op={op}
                          roster={roster}
                          isOwner={isOwner}
                          allWeaponRules={allWeaponRules ?? []}
                          onOpUpdated={updateOp}
                          onOpDeleted={deleteOp}
                          onMoveUp={isOwner ? () => moveOp(idx, idx - 1) : () => {}}
                          onMoveDown={isOwner ? () => moveOp(idx, idx + 1) : () => {}}
                          onMoveFirst={isOwner ? () => moveOp(idx, 0) : () => {}}
                          onMoveLast={isOwner ? () => moveOp(idx, ops.length - 1) : () => {}}
                          onPortraitClick={() =>
                            handlePortraitClick(`${getOpPortraitUrl(op.opId)}?v=${op.updatedAt}`)
                          }
                        />
                      ))}
                    </>
                  )}
                
                  {/* Add Op Button */}
                  {isOwner && (
                    <AddOpForm
                      key="Add Operative"
                      roster={roster}
                      allWeaponRules={allWeaponRules ?? []}
                      onOpAdded={addOp}
                    />
                  )}
                </>
              </div>
            </div>
          )}

          {/* Equipment */}
          {tab === 'equipment' && (
            <div>
              <RosterEquipment killteam={roster.killteam} roster={roster} onRosterUpdate={(updated) => setRoster(updated)} />
            </div>
          )}

          {/* Ploys */}
          {tab === 'ploys' && (
            <div>
              <RosterPloys roster={roster} killteam={roster.killteam} isOwner={isOwner} onRosterUpdate={(updated) => setRoster(updated)} />
            </div>
          )}

          {/* Ops */}
          {tab === 'ops' && (
            <div>
              <RosterOps roster={roster} onRosterUpdate={(updated) => setRoster(updated)} />
            </div>
          )}

          {/* Print Only - Summary of abilities */}
          {(rosterAbilities.length + rosterOptions.length > 0) && (
            <div className="printonly" style={{pageBreakBefore: 'always'}}>
              <h3>Abilities and Options</h3>
              <div className="mt-2 overflow-hidden">
                {rosterAbilities.map((ability) => (
                  <Markdown className="hideEm">
                    {`**${ability.abilityName}${ability.AP != null ? ` (${ability.AP}AP)` : ''}:** ${ability.description}`}
                  </Markdown>
                ))}
                {rosterOptions.map((option) => (
                  <Markdown className="hideEm">
                    {`**${option.optionName}:** ${option.description}`}
                  </Markdown>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {tab === 'gallery' && (
            <>
              {session?.user?.userId == 'vince' && (
                <h5
                  className={`flex items-center gap-2 cursor-pointer ${roster.isSpotlight ? 'text-main' : 'text-muted'}`}
                  onClick={() => toggleSpotlight(roster.rosterId)}>
                  <FiStar /> Spotlight {roster.isSpotlight ? 'On' : 'Off'}
                </h5>
              )}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {carouselItems.map((img) => {
                  return (
                    <div key={`gallery_${img.imageUrl}`}>
                      <h5 className="font-main text-heading">{img.title}</h5>
                      <img src={img.imageUrl} title={img.title} onClick={() => handlePortraitClick(img.imageUrl)}/>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
        
        {showResetModal && (
          <Modal
            title="Reset Game"
            onClose={() => setShowResetModal(false)}
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowResetModal(false)}>
                  <h6>Cancel</h6>
                </Button>
                <Button
                  onClick={() => {
                    resetRoster()
                    setShowResetModal(false)
                  }}
                >
                  <h6>Reset</h6>
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <p>
                Are you sure you want to reset the roster?<br/>
                This will set Turn to 1, set VP and CP to zero, and reset all ops' wounds and activation.
              </p>
            </div>
          </Modal>
        )}

        {showEditRosterModal && (
          <Modal
            title={roster.rosterName}
            onClose={() => setShowEditRosterModal(false)}
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowEditRosterModal(false)}>
                  <h6>Cancel</h6>
                </Button>
                <Button onClick={() => formRef.current?.handleSubmit()}>
                  <h6>Save</h6>
                </Button>
              </div>
            }>
              
            <EditRosterForm
              ref={formRef} // Pass formRef to EditRosterForm
              initialName={roster.rosterName}
              initialDescription={roster.description ?? ''}
              rosterId={roster.rosterId}
              hasCustomPortrait={roster.hasCustomPortrait}
              onSave={(name, description) => {
                updateRosterInfo(name, description)
                setShowEditRosterModal(false)
              }}
              onPortraitUpdated={updated => setRoster(updated)}
              onCancel={() => setShowEditRosterModal(false)}
            />
          </Modal>
        )}

        <CarouselModal
          items={carouselItems}
          initialIndex={carouselStartIndex}
          isOpen={carouselIsOpen}
          onClose={() => closeCarousel()}
        />
        {showDeploymentModal && (
          <Modal
            title="Deploy/Reserve"
            footer={null}
            onClose={() => setShowDeploymentModal(false)}
          >
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {ops.map((op, idx) => {
                const toggle = async (next: boolean) => {
                  // optimistic update
                  setOps(prev => prev.map(o => o.opId === op.opId ? { ...o, isDeployed: next } : o))

                  try {
                    const res = await fetch(`/api/ops/${op.opId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ isDeployed: next }),
                    })
                    if (!res.ok) throw new Error('Failed to update deployment')
                  } catch (err) {
                    console.error(err)
                    toast.error(`Could not update ${op.opName}`)
                    // rollback
                    setOps(prev => prev.map(o => o.opId === op.opId ? { ...o, isDeployed: !next } : o))
                  }
                }

                const onRowActivate = () => toggle(!op.isDeployed)

                return (
                  <div
                    key={op.opId}
                    role="button"
                    tabIndex={0}
                    onClick={onRowActivate}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onRowActivate()
                      }
                    }}
                    className="flex items-center justify-between border-border border-b pb-2 cursor-pointer select-none px-1"
                    aria-pressed={op.isDeployed}
                  >
                    <div className="flex items-center gap-2">
                      {/* Checkbox mirrors state; don't let it handle the toggle itself */}
                      <Checkbox
                        id={`deploy_${op.opId}`}
                        checked={op.isDeployed}
                        readOnly // avoid double toggle
                      />
                      <div>
                        <h6 className="font-bold">
                          {(op.seq + 1)}. {op.opName || op.opType?.opTypeName}
                        </h6>
                        <p className="text-muted-foreground text-sm">{op.opType?.opTypeName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {op.isDeployed ? 'Deployed' : 'Reserve'}
                    </div>
                  </div>
                )
              })}
            </div>

          </Modal>
        )}
      </div>
    </>
  )
}
