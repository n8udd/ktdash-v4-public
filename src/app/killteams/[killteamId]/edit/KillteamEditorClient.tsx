'use client'

import { KillteamLink } from '@/components/shared/Links'
import { Button, Checkbox, Input, Label, Modal } from '@/components/ui'
import { AbilityPlain, KillteamPlain, OpTypePlain, WeaponPlain, WeaponProfilePlain } from '@/types'
import { commands } from '@uiw/react-md-editor'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiChevronRight, FiPlus, FiTrash } from 'react-icons/fi'
import { toast } from 'sonner'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const NAME_TYPES = [
  'AESBAER',
  'CORVIUS',
  'DECAETA',
  'FYHUCHO',
  'BEARAXE',
  'CZIGHEO',
  'STACEY',
  'GEORGE',
  'ADMECH',
  'HIEROTEK',
  'NECRON',
  'KASSOTHOR',
  'ORK',
  'BEASTMAN',
  'CULTIST',
  'TYRANID',
  'KROOT',
  'TAU',
]

export default function KillteamEditorClient({killteam}: { killteam: KillteamPlain }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [team, setTeam] = useState<KillteamPlain>(killteam)
  const descTimer = useRef<NodeJS.Timeout | null>(null)
  const compTimer = useRef<NodeJS.Timeout | null>(null)
  const abilityTimers = useRef<Record<string, NodeJS.Timeout | null>>({})

  // ===== Tabs (local, no URL changes) =====
  const validTabs = ['general', 'operatives', 'ploys', 'equipments'] as const
  type Tab = typeof validTabs[number]
  const [tab, setTab] = useState<Tab>('general')
  const [selectedOpTypeId, setSelectedOpTypeId] = useState<string>(killteam.opTypes[0]?.opTypeId ?? '')
  const [showWeapons, setShowWeapons] = useState(false)
  const [showAbilities, setShowAbilities] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: 'optype', op: OpTypePlain }
    | { kind: 'weapon', op: OpTypePlain, wep: WeaponPlain }
    | { kind: 'wepprofile', op: OpTypePlain, wep: WeaponPlain, profile: WeaponProfilePlain }
    | { kind: 'ability', op: OpTypePlain, ab: AbilityPlain }
    | { kind: 'equipment', eq: any }
    | { kind: 'ploy', ploy: any }
    | null
  >(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false)

  const tabClasses = (selected: boolean) =>
    selected
      ? 'px-2 py-2 border-b-2 border-main text-main'
      : 'px-2 py-2 border-b-2 border-transparent text-muted hover:text-foreground'

  const handleTabChange = (newTab: Tab) => setTab(newTab)

  useEffect(() => {
    // Ensure selected opType exists in current team state
    if (!team.opTypes.find(o => o.opTypeId === selectedOpTypeId)) {
      setSelectedOpTypeId(team.opTypes[0]?.opTypeId ?? '')
    }
  }, [team.opTypes, selectedOpTypeId])

  useEffect(() => {
    // Reset collapsibles when switching selected opType
    setShowWeapons(false)
    setShowAbilities(false)
  }, [selectedOpTypeId])

  const saveField = useCallback(async (patch: Partial<KillteamPlain>) => {
    try {
      const res = await fetch(`/api/killteams/${team.killteamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Save failed')
      }
      const updated: KillteamPlain = await res.json()
      setTeam(updated)
      toast.success('Saved')
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    }
  }, [team.killteamId])

  const saveOpType = useCallback(async (op: OpTypePlain) => {
    try {
      const res = await fetch(`/api/optypes/${op.opTypeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opTypeName: op.opTypeName,
          MOVE: op.MOVE,
          APL: op.APL,
          SAVE: op.SAVE,
          WOUNDS: op.WOUNDS,
          keywords: op.keywords,
          basesize: op.basesize,
          nameType: op.nameType,
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Save failed')
      }
      const updated = await res.json()
      toast.success('Operative type saved')
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    }
  }, [])

  const addOpType = useCallback(async (): Promise<OpTypePlain | null> => {
    try {
      const res = await fetch(`/api/optypes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          killteamId: team.killteamId,
          opTypeName: 'New Operative',
          MOVE: '6"',
          APL: 2,
          SAVE: '4+',
          WOUNDS: 10,
          keywords: '',
          basesize: 32,
          nameType: ''
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Create failed')
      }
      const created: OpTypePlain = await res.json()
      setTeam({ ...team, opTypes: [...team.opTypes, created] })
      toast.success('Operative type added')
      return created
    } catch (e: any) {
      toast.error(e?.message || 'Create failed')
      return null
    }
  }, [team])

  const deleteOpType = useCallback(async (opTypeId: string) => {
    try {
      const res = await fetch(`/api/optypes/${opTypeId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Delete failed')
      }
      setTeam({ ...team, opTypes: team.opTypes.filter(o => o.opTypeId !== opTypeId) })
      toast.success('Operative type deleted')
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed')
    }
  }, [team])

  // ===== Weapons helpers =====
  const addWeapon = useCallback(async (op: OpTypePlain) => {
    try {
      const res = await fetch('/api/weapons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opTypeId: op.opTypeId,
          wepName: 'New Weapon',
          wepType: 'M',
          isDefault: false,
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Create failed')
      }
      const created: WeaponPlain = await res.json()
      const nextOps = team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, weapons: [...(o.weapons ?? []), created] } : o)
      setTeam({ ...team, opTypes: nextOps })
      // Ensure section is visible and scroll to new item
      setShowWeapons(true)
      setTimeout(() => {
        const el = document.getElementById(`wep-${created.wepId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          const input = el.querySelector('input') as HTMLInputElement | null
          input?.focus()
        }
      }, 50)
      toast.success('Weapon added')
    } catch (e: any) {
      toast.error(e?.message || 'Create failed')
    }
  }, [team])

  const saveWeapon = useCallback(async (wep: WeaponPlain) => {
    try {
      const res = await fetch(`/api/weapons/${wep.wepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wepName: wep.wepName,
          wepType: wep.wepType,
          isDefault: wep.isDefault,
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Save failed')
      }
      await res.json()
      toast.success('Weapon saved')
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    }
  }, [])

  const deleteWeapon = useCallback(async (op: OpTypePlain, wepId: string) => {
    try {
      const res = await fetch(`/api/weapons/${wepId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Delete failed')
      }
      const nextOps = team.opTypes.map(o =>
        o.opTypeId === op.opTypeId ? { ...o, weapons: (o.weapons ?? []).filter(w => w.wepId !== wepId) } : o
      )
      setTeam({ ...team, opTypes: nextOps })
      toast.success('Weapon deleted')
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed')
    }
  }, [team])

  // ===== Weapon Profile helpers =====
  const addWeaponProfile = useCallback(async (op: OpTypePlain, w: WeaponPlain) => {
    try {
      const res = await fetch('/api/weapon-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wepId: w.wepId,
          profileName: 'Profile',
          ATK: '4', HIT: '4+', DMG: '3/4', WR: ''
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Create failed')
      }
      const created: WeaponProfilePlain = await res.json()
      const nextOps = team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
        ...o,
        weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? { ...ww, profiles: [ ...(ww.profiles ?? []), created ] } : ww)
      } : o)
      setTeam({ ...team, opTypes: nextOps })
      toast.success('Profile added')
    } catch (e: any) {
      toast.error(e?.message || 'Create failed')
    }
  }, [team])

  const saveWeaponProfile = useCallback(async (p: WeaponProfilePlain) => {
    try {
      const res = await fetch(`/api/weapon-profiles/${p.wepprofileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileName: p.profileName,
          ATK: p.ATK,
          HIT: p.HIT,
          DMG: p.DMG,
          WR: p.WR,
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Save failed')
      }
      await res.json()
      toast.success('Profile saved')
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    }
  }, [])

  const deleteWeaponProfile = useCallback(async (op: OpTypePlain, w: WeaponPlain, wepprofileId: string) => {
    try {
      const res = await fetch(`/api/weapon-profiles/${wepprofileId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Delete failed')
      }
      const nextOps = team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
        ...o,
        weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? { ...ww, profiles: (ww.profiles ?? []).filter(pp => pp.wepprofileId !== wepprofileId) } : ww)
      } : o)
      setTeam({ ...team, opTypes: nextOps })
      toast.success('Profile deleted')
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed')
    }
  }, [team])

  // ===== Abilities helpers =====
  const addAbility = useCallback(async (op: OpTypePlain) => {
    try {
      const res = await fetch('/api/abilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opTypeId: op.opTypeId,
          abilityName: 'New Ability',
          description: '',
          AP: null,
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Create failed')
      }
      const created: AbilityPlain = await res.json()
      const nextOps = team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, abilities: [...(o.abilities ?? []), created] } : o)
      setTeam({ ...team, opTypes: nextOps })
      // Ensure section is visible and scroll to new item
      setShowAbilities(true)
      setTimeout(() => {
        const el = document.getElementById(`ab-${created.abilityId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          const input = el.querySelector('input') as HTMLInputElement | null
          input?.focus()
        }
      }, 50)
      toast.success('Ability added')
    } catch (e: any) {
      toast.error(e?.message || 'Create failed')
    }
  }, [team])

  const saveAbility = useCallback(async (ab: AbilityPlain) => {
    try {
      const res = await fetch(`/api/abilities/${ab.abilityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abilityName: ab.abilityName,
          description: ab.description,
          AP: ab.AP ?? null,
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Save failed')
      }
      await res.json()
      toast.success('Ability saved')
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    }
  }, [])

  const deleteAbility = useCallback(async (op: OpTypePlain, abilityId: string) => {
    try {
      const res = await fetch(`/api/abilities/${abilityId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Delete failed')
      }
      const nextOps = team.opTypes.map(o =>
        o.opTypeId === op.opTypeId ? { ...o, abilities: (o.abilities ?? []).filter(a => a.abilityId !== abilityId) } : o
      )
      setTeam({ ...team, opTypes: nextOps })
      toast.success('Ability deleted')
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed')
    }
  }, [team])

  // ===== Ploys helpers =====
  const addPloy = useCallback(async () => {
    try {
      const res = await fetch('/api/ploys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          killteamId: team.killteamId,
          ployType: 'S',
          ployName: 'New Ploy',
          description: '',
          effects: ''
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Create failed')
      }
      const created = await res.json()
      setTeam({ ...team, ploys: [...team.ploys, created] })
      toast.success('Ploy added')
    } catch (e: any) {
      toast.error(e?.message || 'Create failed')
    }
  }, [team])

  const savePloy = useCallback(async (ploy: any) => {
    try {
      const res = await fetch(`/api/ploys/${ploy.ployId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ployType: ploy.ployType,
          ployName: ploy.ployName,
          description: ploy.description,
          effects: ploy.effects,
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Save failed')
      }
      await res.json()
      toast.success('Ploy saved')
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    }
  }, [])

  const deletePloy = useCallback(async (ployId: string) => {
    try {
      const res = await fetch(`/api/ploys/${ployId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Delete failed')
      }
      setTeam({ ...team, ploys: team.ploys.filter(p => p.ployId !== ployId) })
      toast.success('Ploy deleted')
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed')
    }
  }, [team])

  // ===== Equipment helpers =====
  const addEquipment = useCallback(async () => {
    try {
      const res = await fetch('/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          killteamId: team.killteamId,
          eqName: 'New Equipment',
          description: '',
          effects: ''
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Create failed')
      }
      const created = await res.json()
      setTeam({ ...team, equipments: [...team.equipments, created] })
      toast.success('Equipment added')
    } catch (e: any) {
      toast.error(e?.message || 'Create failed')
    }
  }, [team])

  const saveEquipment = useCallback(async (eq: any) => {
    try {
      const res = await fetch(`/api/equipments/${eq.eqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eqName: eq.eqName,
          description: eq.description,
          effects: eq.effects,
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Save failed')
      }
      await res.json()
      toast.success('Equipment saved')
    } catch (e: any) {
      toast.error(e?.message || 'Save failed')
    }
  }, [])

  const deleteEquipment = useCallback(async (eqId: string) => {
    try {
      const res = await fetch(`/api/equipments/${eqId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Delete failed')
      }
      setTeam({ ...team, equipments: team.equipments.filter(e => e.eqId !== eqId) })
      toast.success('Equipment deleted')
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed')
    }
  }, [team])

  if (error || !killteam) {
    return (
      <div className="px-1 py-8 max-w-7xl mx-auto">
        <p className="text-sm text-destructive">{error ?? 'Killteam not found'}</p>
      </div>
    )
  }

  return (
    <div className="p-2 max-w-7xl mx-auto">
      {/* Preview Button */}
      Preview: <KillteamLink killteam={team} newTab={true} />

      {/* Tabs */}
      <div className="overflow-x-auto px-2 mt-2">
        <div className="flex justify-center space-x-2 border-b border-border mb-4">
          {([
            { key: 'general', label: 'General' },
            { key: 'operatives', label: 'Operatives' },
            { key: 'ploys', label: 'Ploys' },
            { key: 'equipments', label: 'Equipments' },
          ] as {key: Tab; label: string}[]).map(({ key, label }) => (
            <button
              key={key}
              className={tabClasses(tab === key)}
              onClick={() => handleTabChange(key)}
              aria-current={tab === key ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* General */}
      {tab === 'general' && (
      <div className="mt-4 grid gap-4">
        {/* Name + Publish in one row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Label htmlFor="ktName" className="whitespace-nowrap">Killteam Name:</Label>
          <Input
            id="ktName"
            value={team.killteamName}
            maxLength={250}
            className="min-w-[220px] flex-1"
            onChange={(e) => setTeam({ ...team, killteamName: e.target.value })}
            onBlur={(e) => {
              const v = e.target.value.trim()
              if (v && v !== killteam.killteamName) saveField({ killteamName: v })
            }}
            placeholder="Enter killteam name"
          />
          <div className="flex items-center gap-2 ml-auto">
            <Checkbox
              id="isPublished"
              checked={!!team.isPublished}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked
                setTeam({ ...team, isPublished: checked })
                saveField({ isPublished: checked })
              }}
            />
            <Label htmlFor="isPublished" className="whitespace-nowrap">Publish</Label>
          </div>
        </div>

        {/* Archetypes in one row */}
        <div className="flex items-center gap-4 flex-wrap">
          <Label className="whitespace-nowrap">Archetypes:</Label>
          <div className="flex items-center gap-4 flex-wrap">
            {['Seek And Destroy', 'Security', 'Recon', 'Infiltration'].map((arch) => {
              const selected = (team.archetypes || '').split('/').map(a => a.trim()).filter(Boolean)
              const isChecked = selected.includes(arch)
              return (
                <label key={arch} className="inline-flex items-center gap-2">
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => {
                      const checked = (e.target as HTMLInputElement).checked
                      const baseOrder = ['Seek And Destroy', 'Security', 'Recon', 'Infiltration']
                      const current = new Set((team.archetypes || '').split('/').map(a => a.trim()).filter(Boolean))
                      if (checked) current.add(arch); else current.delete(arch)
                      const next = baseOrder.filter(a => current.has(a)).join('/')
                      const updated = { ...team, archetypes: next }
                      setTeam(updated)
                      saveField({ archetypes: next })
                    }}
                  />
                  <span>{arch}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Two-column editors: Description (left) | Composition (right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ktDescription">Description</Label>
            <div className="custom-md-editor">
              <MDEditor
                id="ktDescription"
                value={team.description}
                onChange={(val) => {
                  const v = val || ''
                  setTeam({ ...team, description: v })
                  if (descTimer.current) clearTimeout(descTimer.current)
                  descTimer.current = setTimeout(() => saveField({ description: v }), 800)
                }}
                preview="edit"
                data-color-mode="dark"
                style={{ minHeight: 300 }}
                commands={[
                  commands.bold,
                  commands.italic,
                  commands.hr,
                  commands.divider,
                  commands.quote,
                  commands.unorderedListCommand,
                  commands.orderedListCommand,
                ]}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ktComposition">Composition</Label>
            <div className="custom-md-editor">
              <MDEditor
                id="ktComposition"
                value={team.composition}
                onChange={(val) => {
                  const v = val || ''
                  setTeam({ ...team, composition: v })
                  if (compTimer.current) clearTimeout(compTimer.current)
                  compTimer.current = setTimeout(() => saveField({ composition: v }), 800)
                }}
                preview="edit"
                data-color-mode="dark"
                style={{ minHeight: 300 }}
                commands={[
                  commands.bold,
                  commands.italic,
                  commands.hr,
                  commands.divider,
                  commands.quote,
                  commands.unorderedListCommand,
                  commands.orderedListCommand,
                ]}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone: Delete Killteam */}
        <div className="border border-red-700/50 bg-red-900/10 rounded p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h6 className="text-red-600">Danger Zone</h6>
              <p className="text-sm text-muted-foreground mt-1">
                Deleting this homebrew killteam will permanently remove all of its data. This includes all
                operatives, weapons, abilities, ploys, and equipments. Any rosters built using this team — even those
                owned by other users — will be deleted. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-red-600 border border-red-600 hover:text-red-700 hover:border-red-700"
              onClick={() => setShowDeleteTeamModal(true)}
            >
              <FiTrash /> Delete Killteam
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Operatives */}
      {tab === 'operatives' && (
      <div className="mt-6 flex gap-4">
        {/* Left: List of operative types */}
        <div className="w-72 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h5>Operative Types</h5>
            <button
              className="text-main disabled:text-muted p-1 border border-main rounded hover:bg-muted/20"
              onClick={async () => {
                const created = await addOpType()
                if (created) setSelectedOpTypeId(created.opTypeId)
              }}
              disabled={(team.opTypes?.length ?? 0) >= 20}
              title={(team.opTypes?.length ?? 0) >= 20 ? 'Maximum of 20 operative types reached' : ''}
            >
              <FiPlus aria-label="Add Operative Type" />
            </button>
          </div>
          <div className="space-y-1">
            {team.opTypes.map((o) => {
              const selected = o.opTypeId === selectedOpTypeId
              return (
                <button
                  key={o.opTypeId}
                  className={`w-full text-left border rounded px-2 py-2 ${selected ? 'border-main bg-muted/20' : 'border-border hover:border-muted'}`}
                  onClick={() => setSelectedOpTypeId(o.opTypeId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{o.opTypeName || 'Unnamed'}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">W:{o.weapons?.length ?? 0} A:{o.abilities?.length ?? 0}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Details for selected operative type */}
        <div className="flex-1">
          {(() => {
            const op = team.opTypes.find(o => o.opTypeId === selectedOpTypeId)
            if (!op) return (
              <div className="text-muted-foreground">Select an operative type to edit.</div>
            )
            return (
              <div key={op.opTypeId} className="border border-border rounded p-3 bg-card">
                <h6>General</h6>
                {/* Main: Name + Stats + Delete */}
                <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 md:col-span-7">
                  <Label className="whitespace-nowrap">Name</Label>
                  <Input
                    value={op.opTypeName}
                    maxLength={250}
                    onChange={(e) => setTeam({
                      ...team,
                      opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, opTypeName: e.target.value } : o)
                    })}
                    onBlur={() => saveOpType(op)}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label>APL</Label>
                      <Input
                        type="number"
                        className="no-spinner"
                        value={op.APL}
                        onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, APL: parseInt(e.target.value || '0', 10) } : o) })}
                        onBlur={() => saveOpType(op)}
                      />
                    </div>
                    <div>
                      <Label>MOVE</Label>
                      <Input
                        value={op.MOVE}
                        maxLength={10}
                        onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, MOVE: e.target.value } : o) })}
                        onBlur={() => saveOpType(op)}
                      />
                    </div>
                    <div>
                      <Label>SAVE</Label>
                      <Input
                        value={op.SAVE}
                        maxLength={10}
                        onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, SAVE: e.target.value } : o) })}
                        onBlur={() => saveOpType(op)}
                      />
                    </div>
                    <div>
                      <Label>WOUNDS</Label>
                      <Input
                        type="number"
                        className="no-spinner"
                        value={op.WOUNDS}
                        onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, WOUNDS: parseInt(e.target.value || '0', 10) } : o) })}
                        onBlur={() => saveOpType(op)}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-1 md:text-right self-start">
                  <button
                    className="text-destructive whitespace-nowrap p-1 border border-main rounded hover:bg-muted/20"
                    onClick={() => setPendingDelete({ kind: 'optype', op })}
                    title="Delete Operative Type"
                  >
                    <FiTrash aria-label="Delete" />
                  </button>
                </div>
              </div>

              {/* Meta: Keywords + NameType */}
              <div className="grid grid-cols-12 gap-2 mt-2">
                <div className="col-span-12 md:col-span-8">
                  <Label>Keywords</Label>
                  <Input
                    value={op.keywords}
                    maxLength={250}
                    onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, keywords: e.target.value } : o) })}
                    onBlur={() => saveOpType(op)}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Label>NameType</Label>
                  <select
                    className="bg-card text-foreground border border-border rounded p-1 my-2 focus:outline-none focus:ring-2 focus:ring-main w-full"
                    value={op.nameType}
                    onChange={(e) => {
                      const v = e.target.value
                      const nextOps = team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, nameType: v } : o)
                      setTeam({ ...team, opTypes: nextOps })
                      // Save immediately on selection
                      saveOpType({ ...op, nameType: v })
                    }}
                  >
                    <option value="">Select…</option>
                    {NAME_TYPES.map(nt => (
                      <option key={nt} value={nt}>{nt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weapons */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    className="flex items-center gap-2 text-foreground hover:text-main"
                    onClick={() => setShowWeapons(!showWeapons)}
                    aria-expanded={showWeapons}
                    aria-controls="weapons-section"
                  >
                    {showWeapons ? <FiChevronDown /> : <FiChevronRight />}
                    <h6>Weapons</h6>
                    <span className="text-xs bg-muted/20 text-muted-foreground border border-border rounded-full px-2 py-0.5">{op.weapons?.length ?? 0}</span>
                  </button>
                  <button
                    className="text-main disabled:text-muted p-1 border border-main rounded hover:bg-muted/20"
                    onClick={() => addWeapon(op)}
                    disabled={(op.weapons?.length ?? 0) >= 30}
                    title={(op.weapons?.length ?? 0) >= 30 ? 'Maximum of 30 weapons reached' : ''}
                  >
                    <FiPlus aria-label="Add Weapon" />
                  </button>
                </div>
                {showWeapons && (
                  <div id="weapons-section" className="space-y-2">
                   {(op.weapons ?? []).map((w) => (
                     <div key={w.wepId} id={`wep-${w.wepId}`} className="border border-border rounded p-2">
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                        <div className="sm:col-span-2">
                          <Label>Name</Label>
                          <Input
                            value={w.wepName}
                            maxLength={250}
                            onChange={(e) => setTeam({
                              ...team,
                              opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                ...o,
                                weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? { ...ww, wepName: e.target.value } : ww)
                              } : o)
                            })}
                            onBlur={() => saveWeapon(w)}
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <select
                            className="bg-card text-foreground border border-border rounded p-1 my-2 focus:outline-none focus:ring-2 focus:ring-main w-full"
                            value={w.wepType}
                            onChange={(e) => {
                              const v = e.target.value
                              setTeam({
                                ...team,
                                opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                  ...o,
                                  weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? { ...ww, wepType: v } : ww)
                                } : o)
                              })
                              saveWeapon({ ...w, wepType: v })
                            }}
                          >
                            {['M','R','E','P'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={w.isDefault}
                            onChange={(e) => {
                              const checked = (e.target as HTMLInputElement).checked
                              setTeam({
                                ...team,
                                opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                  ...o,
                                  weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? { ...ww, isDefault: checked } : ww)
                                } : o)
                              })
                              saveWeapon({ ...w, isDefault: checked })
                            }}
                          />
                          <Label className="whitespace-nowrap">Default</Label>
                        </div>
                        <div className="text-right">
                          <button className="text-destructive p-1 border border-main rounded hover:bg-muted/20" title="Delete Weapon" onClick={() => setPendingDelete({ kind: 'weapon', op, wep: w })}>
                            <FiTrash aria-label="Delete Weapon" />
                          </button>
                        </div>
                      </div>
                      {/* Profiles */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <Label>Profiles</Label>
                          <button
                            className="text-main disabled:text-muted p-1 border border-main rounded hover:bg-muted/20"
                            onClick={() => addWeaponProfile(op, w)}
                            disabled={(w.profiles?.length ?? 0) >= 4}
                            title={(w.profiles?.length ?? 0) >= 4 ? 'Maximum of 4 profiles reached' : ''}
                          >
                            <FiPlus aria-label="Add Profile" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(w.profiles ?? []).map((p) => (
                            <div key={p.wepprofileId} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                              <div>
                                <Label>Name</Label>
                                <Input
                                  value={p.profileName}
                                  maxLength={250}
                                  onChange={(e) => setTeam({
                                    ...team,
                                    opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                      ...o,
                                      weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? {
                                        ...ww,
                                        profiles: (ww.profiles ?? []).map(pp => pp.wepprofileId === p.wepprofileId ? { ...pp, profileName: e.target.value } : pp)
                                      } : ww)
                                    } : o)
                                  })}
                                  onBlur={() => saveWeaponProfile(p)}
                                />
                              </div>
                              <div>
                                <Label>ATK</Label>
                                <Input
                                  value={p.ATK}
                                  maxLength={10}
                                  onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                    ...o,
                                    weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? {
                                      ...ww,
                                      profiles: (ww.profiles ?? []).map(pp => pp.wepprofileId === p.wepprofileId ? { ...pp, ATK: e.target.value } : pp)
                                    } : ww)
                                  } : o) })}
                                  onBlur={() => saveWeaponProfile(p)}
                                />
                              </div>
                              <div>
                                <Label>HIT</Label>
                                <Input
                                  value={p.HIT}
                                  maxLength={10}
                                  onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                    ...o,
                                    weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? {
                                      ...ww,
                                      profiles: (ww.profiles ?? []).map(pp => pp.wepprofileId === p.wepprofileId ? { ...pp, HIT: e.target.value } : pp)
                                    } : ww)
                                  } : o) })}
                                  onBlur={() => saveWeaponProfile(p)}
                                />
                              </div>
                              <div>
                                <Label>DMG</Label>
                                <Input
                                  value={p.DMG}
                                  maxLength={10}
                                  onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                    ...o,
                                    weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? {
                                      ...ww,
                                      profiles: (ww.profiles ?? []).map(pp => pp.wepprofileId === p.wepprofileId ? { ...pp, DMG: e.target.value } : pp)
                                    } : ww)
                                  } : o) })}
                                  onBlur={() => saveWeaponProfile(p)}
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <Label>WR</Label>
                                <Input
                                  value={p.WR}
                                  maxLength={250}
                                  onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                    ...o,
                                    weapons: (o.weapons ?? []).map(ww => ww.wepId === w.wepId ? {
                                      ...ww,
                                      profiles: (ww.profiles ?? []).map(pp => pp.wepprofileId === p.wepprofileId ? { ...pp, WR: e.target.value } : pp)
                                    } : ww)
                                  } : o) })}
                                  onBlur={() => saveWeaponProfile(p)}
                                />
                              </div>
                              <div className="text-right sm:col-span-5">
                                <button
                                  className="text-destructive p-1 border border-main rounded hover:bg-muted/20"
                                  disabled={(w.profiles?.length ?? 0) <= 1}
                                  title={(w.profiles?.length ?? 0) <= 1 ? 'Weapon must have at least one profile' : ''}
                                  onClick={() => setPendingDelete({ kind: 'wepprofile', op, wep: w, profile: p })}
                                >
                                  <FiTrash aria-label="Delete Profile" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

                {/* Abilities */}
                <div className="mt-3">
                 <div className="flex items-center justify-between mb-2">
                   <button
                     className="flex items-center gap-2 text-foreground hover:text-main"
                     onClick={() => setShowAbilities(!showAbilities)}
                     aria-expanded={showAbilities}
                     aria-controls="abilities-section"
                   >
                     {showAbilities ? <FiChevronDown /> : <FiChevronRight />}
                     <h6>Abilities</h6>
                     <span className="text-xs bg-muted/20 text-muted-foreground border border-border rounded-full px-2 py-0.5">{op.abilities?.length ?? 0}</span>
                   </button>
                   <button
                     className="text-main p-1 border border-main rounded hover:bg-muted/20"
                     onClick={() => addAbility(op)}
                   >
                     <FiPlus aria-label="Add Ability" />
                   </button>
                 </div>
                {showAbilities && (
                  <div id="abilities-section" className="space-y-2">
                    {(op.abilities ?? []).map((ab) => (
                     <div key={ab.abilityId} id={`ab-${ab.abilityId}`} className="border border-border rounded p-2">
                      {/* Top row: Name, AP, Delete */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-start">
                        <div className="sm:col-span-3">
                          <Label>Name</Label>
                          <Input
                            value={ab.abilityName}
                            maxLength={250}
                            onChange={(e) => setTeam({
                              ...team,
                              opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                ...o,
                                abilities: (o.abilities ?? []).map(a => a.abilityId === ab.abilityId ? { ...a, abilityName: e.target.value } : a)
                              } : o)
                            })}
                            onBlur={() => saveAbility(ab)}
                          />
                        </div>
                        <div>
                          <Label>AP</Label>
                          <Input
                            type="number"
                            value={ab.AP ?? ''}
                            onChange={(e) => {
                              const val = e.target.value
                              const num = val === '' ? NaN : Number(val)
                              setTeam({
                                ...team,
                                opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                  ...o,
                                  abilities: (o.abilities ?? []).map(a => a.abilityId === ab.abilityId ? { ...a, AP: (val === '' || Number.isNaN(num)) ? undefined : num } : a)
                                } : o)
                              })
                            }}
                            onBlur={() => saveAbility(ab)}
                          />
                        </div>
                        <div className="text-right sm:col-span-1 sm:self-end">
                          <button className="text-destructive p-1 border border-main rounded hover:bg-muted/20" title="Delete Ability" onClick={() => setPendingDelete({ kind: 'ability', op, ab })}>
                            <FiTrash aria-label="Delete Ability" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom row: Description editor full width */}
                      <div className="mt-2">
                        <Label>Description</Label>
                        <div className="custom-md-editor">
                          <MDEditor
                            value={ab.description}
                            onChange={(val) => {
                              const v = val || ''
                              setTeam({
                                ...team,
                                opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? {
                                  ...o,
                                  abilities: (o.abilities ?? []).map(a => a.abilityId === ab.abilityId ? { ...a, description: v } : a)
                                } : o)
                              })
                              // debounce save per-ability
                              const id = ab.abilityId
                              if (abilityTimers.current[id]) clearTimeout(abilityTimers.current[id]!)
                              abilityTimers.current[id] = setTimeout(() => saveAbility({ ...ab, description: v }), 800)
                            }}
                            preview="edit"
                            data-color-mode="dark"
                            style={{ minHeight: 120 }}
                            commands={[
                              commands.bold,
                              commands.italic,
                              commands.hr,
                              commands.divider,
                              commands.quote,
                              commands.unorderedListCommand,
                              commands.orderedListCommand,
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
            )
          })()}
        </div>
      </div>
      )}
      
      {/* Equipments */}
      {tab === 'equipments' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h5>Equipment</h5>
            <button className="text-main p-1 border border-main rounded hover:bg-muted/20" onClick={addEquipment} title="Add Equipment">
              <FiPlus aria-label="Add Equipment" />
            </button>
          </div>
          <div className="space-y-3">
            {team.equipments.filter(eq => eq.killteamId === team.killteamId).map((eq) => (
              <div key={eq.eqId} className="border border-border rounded p-3 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={eq.eqName}
                      maxLength={250}
                      onChange={(e) => setTeam({ ...team, equipments: team.equipments.map(x => x.eqId === eq.eqId ? { ...x, eqName: e.target.value } : x) })}
                      onBlur={() => saveEquipment(eq)}
                    />
                  </div>
                  <div>
                    <Label>Effects</Label>
                    <Input
                      value={eq.effects || ''}
                      maxLength={250}
                      onChange={(e) => setTeam({ ...team, equipments: team.equipments.map(x => x.eqId === eq.eqId ? { ...x, effects: e.target.value } : x) })}
                      onBlur={() => saveEquipment(eq)}
                    />
                  </div>
                  <div className="text-right md:self-end">
                    <button className="text-destructive p-1 border border-main rounded hover:bg-muted/20" title="Delete Equipment" onClick={() => setPendingDelete({ kind: 'equipment', eq })}>
                      <FiTrash aria-label="Delete Equipment" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <Label>Description</Label>
                  <textarea
                    className="w-full bg-card border border-border rounded p-2 min-h-[120px]"
                    value={eq.description || ''}
                    onChange={(e) => setTeam({ ...team, equipments: team.equipments.map(x => x.eqId === eq.eqId ? { ...x, description: e.target.value } : x) })}
                    onBlur={() => saveEquipment(eq)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ploys */}
      {tab === 'ploys' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h5>Ploys</h5>
            <button className="text-main p-1 border border-main rounded hover:bg-muted/20" onClick={addPloy} title="Add Ploy">
              <FiPlus aria-label="Add Ploy" />
            </button>
          </div>
          <div className="space-y-3">
            {team.ploys.map((p) => (
              <div key={p.ployId} className="border border-border rounded p-3 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                  <div>
                    <Label>Type</Label>
                    <select
                      className="bg-card text-foreground border border-border rounded p-1 my-2 focus:outline-none focus:ring-2 focus:ring-main w-full"
                      value={p.ployType}
                      onChange={(e) => {
                        const v = e.target.value
                        setTeam({ ...team, ploys: team.ploys.map(x => x.ployId === p.ployId ? { ...x, ployType: v } : x) })
                        savePloy({ ...p, ployType: v })
                      }}
                    >
                      <option value="S">Strategy</option>
                      <option value="F">Firefight</option>
                    </select>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={p.ployName}
                      maxLength={250}
                      onChange={(e) => setTeam({ ...team, ploys: team.ploys.map(x => x.ployId === p.ployId ? { ...x, ployName: e.target.value } : x) })}
                      onBlur={() => savePloy(p)}
                    />
                  </div>
                  <div className="text-right md:self-end">
                    <button className="text-destructive p-1 border border-main rounded hover:bg-muted/20" title="Delete Ploy" onClick={() => setPendingDelete({ kind: 'ploy', ploy: p })}>
                      <FiTrash aria-label="Delete Ploy" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <Label>Description</Label>
                  <textarea
                    className="w-full bg-card border border-border rounded p-2 min-h-[120px]"
                    value={p.description || ''}
                    onChange={(e) => setTeam({ ...team, ploys: team.ploys.map(x => x.ployId === p.ployId ? { ...x, description: e.target.value } : x) })}
                    onBlur={() => savePloy(p)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for sub-items */}
      {pendingDelete && (
        <Modal
          title={
            pendingDelete.kind === 'optype' ? `Delete ${pendingDelete.op.opTypeName}` :
            pendingDelete.kind === 'weapon' ? `Delete ${pendingDelete.wep.wepName}` :
            pendingDelete.kind === 'wepprofile' ? `Delete profile ${pendingDelete.profile.profileName}` :
            pendingDelete.kind === 'ability' ? `Delete ${pendingDelete.ab.abilityName}` :
            pendingDelete.kind === 'equipment' ? `Delete ${pendingDelete.eq.eqName}` :
            pendingDelete.kind === 'ploy' ? `Delete ${pendingDelete.ploy.ployName}` :
            'Delete'
          }
          onClose={() => { if (!deleting) setPendingDelete(null) }}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
                <h6>Cancel</h6>
              </Button>
              <Button
                onClick={async () => {
                  if (!pendingDelete) return
                  setDeleting(true)
                  setDeleteError('')
                  try {
                    switch (pendingDelete.kind) {
                      case 'optype': {
                        const remaining = team.opTypes.filter(o => o.opTypeId !== pendingDelete.op.opTypeId)
                        await deleteOpType(pendingDelete.op.opTypeId)
                        setSelectedOpTypeId(remaining[0]?.opTypeId ?? '')
                        break
                      }
                      case 'weapon': {
                        await deleteWeapon(pendingDelete.op, pendingDelete.wep.wepId)
                        break
                      }
                      case 'wepprofile': {
                        await deleteWeaponProfile(pendingDelete.op, pendingDelete.wep, pendingDelete.profile.wepprofileId)
                        break
                      }
                      case 'ability': {
                        await deleteAbility(pendingDelete.op, pendingDelete.ab.abilityId)
                        break
                      }
                      case 'equipment': {
                        await deleteEquipment(pendingDelete.eq.eqId)
                        break
                      }
                      case 'ploy': {
                        await deletePloy(pendingDelete.ploy.ployId)
                        break
                      }
                    }
                    setPendingDelete(null)
                  } catch (err: any) {
                    setDeleteError(err?.message || 'Delete failed')
                  } finally {
                    setDeleting(false)
                  }
                }}
                disabled={deleting}
              >
                <h6>{deleting ? 'Deleting…' : 'Delete'}</h6>
              </Button>
            </div>
          }
        >
          <p className="text-sm text-foreground">
            Are you sure you want to delete this {pendingDelete.kind}? This cannot be undone.
          </p>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
        </Modal>
      )}

      {/* Delete Killteam Modal */}
      {showDeleteTeamModal && (
        <Modal
          title={'Delete Homebrew Killteam'}
          onClose={() => { if (!deleting) setShowDeleteTeamModal(false) }}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDeleteTeamModal(false)} disabled={deleting}>
                <h6>Cancel</h6>
              </Button>
              <Button
                variant="ghost"
                className="text-white bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  setDeleting(true)
                  setDeleteError('')
                  try {
                    const res = await fetch(`/api/killteams/${team.killteamId}`, { method: 'DELETE' })
                    if (!res.ok) {
                      const msg = await res.text().catch(() => '')
                      throw new Error(msg || 'Delete failed')
                    }
                    toast.success('Killteam deleted')
                    setShowDeleteTeamModal(false)
                    const dest = team.user?.userName ? `/users/${team.user.userName}` : '/'
                    router.push(dest)
                  } catch (err: any) {
                    setDeleteError(err?.message || 'Delete failed')
                    toast.error('Could not delete killteam')
                  } finally {
                    setDeleting(false)
                  }
                }}
                disabled={deleting}
              >
                <h6>{deleting ? 'Deleting…' : 'Delete Forever'}</h6>
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-red-600 font-semibold">
              Warning: This will permanently delete this homebrew team and all associated data.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>All operatives, weapons, abilities, ploys, and equipments will be removed.</li>
              <li>All rosters using this team will be deleted, including those owned by other users.</li>
              <li>This action is irreversible. There is no recovery.</li>
            </ul>
            {deleteError && (
              <div className="text-red-500 text-sm">{deleteError}</div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
  
