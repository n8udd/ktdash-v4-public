import { getAuthSession } from '@/lib/auth'
import { KillteamService } from '@/services/killteam.service'
import { OpTypeService } from '@/services/opType.service'
import { WeaponService } from '@/services/weapon.service'
import { NextResponse } from 'next/server'

function validatePatch(body: any) {
  const errors: string[] = []
  const updates: any = {}

  if (typeof body.wepName === 'string') {
    const v = body.wepName.trim()
    if (!v) errors.push('wepName cannot be empty')
    if (v.length > 250) errors.push('wepName must be <= 250 chars')
    updates.wepName = v
  }
  if (typeof body.wepType === 'string') {
    const v = body.wepType.trim().toUpperCase()
    if (v.length !== 1) errors.push('wepType must be a single character')
    updates.wepType = v
  }
  if (typeof body.isDefault === 'boolean') {
    updates.isDefault = !!body.isDefault
  }

  return { errors, updates }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ wepId: string }> }) {
  const { wepId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const wep = await WeaponService.getWeapon(wepId)
  if (!wep) return new NextResponse('Not Found', { status: 404 })

  // Validate parent ownership
  const opType = await OpTypeService.getOpTypeRow(wep.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await KillteamService.getKillteamRow(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { errors, updates } = validatePatch(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const updated = await WeaponService.updateWeapon(wepId, updates)
  if (!updated) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(updated.toPlain())
}

export async function DELETE(req: Request, { params }: { params: Promise<{ wepId: string }> }) {
  const { wepId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const wep = await WeaponService.getWeaponRow(wepId)
  if (!wep) return new NextResponse('Not Found', { status: 404 })

  // Validate parent ownership
  const opType = await OpTypeService.getOpTypeRow(wep.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await KillteamService.getKillteamRow(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  await WeaponService.deleteWeapon(wepId)
  return NextResponse.json({ success: true })
}

