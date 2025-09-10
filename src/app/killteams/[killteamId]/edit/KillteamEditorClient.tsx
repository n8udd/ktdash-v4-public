'use client'

import { KillteamLink } from '@/components/shared/Links'
import { Checkbox, Input, Label } from '@/components/ui'
import { KillteamPlain, OpTypePlain, WeaponPlain, WeaponProfilePlain } from '@/types'
import { commands } from '@uiw/react-md-editor'
import dynamic from 'next/dynamic'
import { useCallback, useRef, useState } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  const [team, setTeam] = useState<KillteamPlain>(killteam)
  const descTimer = useRef<NodeJS.Timeout | null>(null)
  const compTimer = useRef<NodeJS.Timeout | null>(null)

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

  const addOpType = useCallback(async () => {
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
    } catch (e: any) {
      toast.error(e?.message || 'Create failed')
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
  const addProfile = useCallback(async (op: OpTypePlain, w: WeaponPlain) => {
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

  const saveProfile = useCallback(async (p: WeaponProfilePlain) => {
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

  const deleteProfile = useCallback(async (op: OpTypePlain, w: WeaponPlain, wepprofileId: string) => {
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

      {/* Top-level Editors */}
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
      </div>

      {/* JSON Editor */}
      <textarea className="w-full hv-100 hidden">{JSON.stringify(team, null, 2)}</textarea>

      {/* OpTypes Cards */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h5>Operative Types</h5>
          <button
            className="text-main underline disabled:text-muted"
            onClick={addOpType}
            disabled={(team.opTypes?.length ?? 0) >= 20}
            title={(team.opTypes?.length ?? 0) >= 20 ? 'Maximum of 20 operative types reached' : ''}
          >
            Add Operative Type
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.opTypes.map((op) => (
            <div key={op.opTypeId} className="border border-border rounded p-3 bg-card">
              {/* Header: Name + Delete */}
              <div className="flex items-center gap-2 mb-2">
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
                <button className="ml-auto text-destructive whitespace-nowrap" onClick={() => deleteOpType(op.opTypeId)}>Delete</button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                  <Label>APL</Label>
                  <Input
                    type="number"
                    value={op.APL}
                    onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, APL: parseInt(e.target.value || '0', 10) } : o) })}
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
                    value={op.WOUNDS}
                    onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, WOUNDS: parseInt(e.target.value || '0', 10) } : o) })}
                    onBlur={() => saveOpType(op)}
                  />
                </div>
              </div>

              {/* Meta Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                <div className="sm:col-span-2">
                  <Label>Keywords</Label>
                  <Input
                    value={op.keywords}
                    maxLength={250}
                    onChange={(e) => setTeam({ ...team, opTypes: team.opTypes.map(o => o.opTypeId === op.opTypeId ? { ...o, keywords: e.target.value } : o) })}
                    onBlur={() => saveOpType(op)}
                  />
                </div>
                <div>
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
                  <h6>Weapons</h6>
                  <button
                    className="text-main underline disabled:text-muted"
                    onClick={() => addWeapon(op)}
                    disabled={(op.weapons?.length ?? 0) >= 30}
                    title={(op.weapons?.length ?? 0) >= 30 ? 'Maximum of 30 weapons reached' : ''}
                  >
                    Add Weapon
                  </button>
                </div>
                <div className="space-y-2">
                  {(op.weapons ?? []).map((w) => (
                    <div key={w.wepId} className="border border-border rounded p-2">
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
                          <button className="text-destructive" onClick={() => deleteWeapon(op, w.wepId)}>Delete</button>
                        </div>
                      </div>
                      {/* Profiles */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <Label>Profiles</Label>
                          <button
                            className="text-main underline disabled:text-muted"
                            onClick={() => addProfile(op, w)}
                            disabled={(w.profiles?.length ?? 0) >= 4}
                            title={(w.profiles?.length ?? 0) >= 4 ? 'Maximum of 4 profiles reached' : ''}
                          >
                            Add Profile
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
                                  onBlur={() => saveProfile(p)}
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
                                  onBlur={() => saveProfile(p)}
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
                                  onBlur={() => saveProfile(p)}
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
                                  onBlur={() => saveProfile(p)}
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
                                  onBlur={() => saveProfile(p)}
                                />
                              </div>
                              <div className="text-right sm:col-span-5">
                                <button
                                  className="text-destructive"
                                  disabled={(w.profiles?.length ?? 0) <= 1}
                                  title={(w.profiles?.length ?? 0) <= 1 ? 'Weapon must have at least one profile' : ''}
                                  onClick={() => deleteProfile(op, w, p.wepprofileId)}
                                >
                                  Delete Profile
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
         ))}
       </div>
     </div>
      
      {/* Equipments */}
      {/*TBD*/}

      {/* Ploys */}
      {/*TBD*/}
    </div>
  )
}
  
