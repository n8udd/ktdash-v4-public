import { getAuthSession } from '@/lib/auth'
import { WeaponProfileService } from '@/services/weaponProfile.service'
import { NextResponse } from 'next/server'

function validatePatch(body: any) {
  const errors: string[] = []
  const updates: any = {}

  if (typeof body.profileName === 'string') {
    const v = body.profileName.trim()
    if (v.length > 250) errors.push('profileName must be <= 250 chars')
    updates.profileName = v
  }
  if (typeof body.ATK === 'string') {
    const v = body.ATK.trim()
    if (v.length > 10) errors.push('ATK must be <= 10 chars')
    updates.ATK = v
  }
  if (typeof body.HIT === 'string') {
    const v = body.HIT.trim()
    if (v.length > 10) errors.push('HIT must be <= 10 chars')
    updates.HIT = v
  }
  if (typeof body.DMG === 'string') {
    const v = body.DMG.trim()
    if (v.length > 10) errors.push('DMG must be <= 10 chars')
    updates.DMG = v
  }
  if (typeof body.WR === 'string') {
    const v = body.WR.trim()
    if (v.length > 250) errors.push('WR must be <= 250 chars')
    updates.WR = v
  }

  return { errors, updates }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ wepprofileId: string }> }) {
  const { wepprofileId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const profile = await WeaponProfileService.getProfile(wepprofileId)
  if (!profile) return new NextResponse('Not Found', { status: 404 })

  const weapon = await WeaponProfileService.getWeapon(profile.wepId)
  if (!weapon) return new NextResponse('Weapon not found', { status: 404 })
  const opType = await WeaponProfileService.getOpType(weapon.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await WeaponProfileService.getKillteam(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { errors, updates } = validatePatch(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const updated = await WeaponProfileService.updateProfile(wepprofileId, updates)
  if (!updated) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ wepprofileId: string }> }) {
  const { wepprofileId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const profile = await WeaponProfileService.getProfileRow(wepprofileId)
  if (!profile) return new NextResponse('Not Found', { status: 404 })

  const weapon = await WeaponProfileService.getWeapon(profile.wepId)
  if (!weapon) return new NextResponse('Weapon not found', { status: 404 })
  const opType = await WeaponProfileService.getOpType(weapon.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await WeaponProfileService.getKillteam(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const count = await WeaponProfileService.countForWeapon(profile.wepId)
  if (count <= 1) return NextResponse.json({ error: 'Weapon must have at least one profile' }, { status: 400 })

  await WeaponProfileService.deleteProfile(wepprofileId)
  return NextResponse.json({ success: true })
}

