import { getAuthSession } from '@/lib/auth'
import { AbilityService } from '@/services/ability.service'
import { KillteamService } from '@/services/killteam.service'
import { NextResponse } from 'next/server'

function validatePatch(body: any) {
  const errors: string[] = []
  const updates: any = {}

  if (typeof body.abilityName === 'string') {
    const v = body.abilityName.trim()
    if (!v) errors.push('abilityName cannot be empty')
    if (v.length > 250) errors.push('abilityName must be <= 250 chars')
    updates.abilityName = v
  }

  if (typeof body.description === 'string') updates.description = body.description

  if (body.AP === null) {
    updates.AP = null
  } else if (body.AP !== undefined) {
    const v = Number.isInteger(body.AP) ? body.AP : parseInt(String(body.AP), 10)
    if (isNaN(v)) errors.push('AP must be a number')
    else updates.AP = v
  }

  return { errors, updates }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ abilityId: string }> }) {
  const { abilityId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const ab = await AbilityService.getAbilityRow(abilityId)
  if (!ab) return new NextResponse('Not Found', { status: 404 })

  const opType = await AbilityService.getOpType(ab.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await KillteamService.getKillteamRow(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const body = await req.json().catch(() => ({} as any))
  const { errors, updates } = validatePatch(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const updated = await AbilityService.updateAbility(abilityId, updates)
  if (!updated) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(updated.toPlain())
}

export async function DELETE(req: Request, { params }: { params: Promise<{ abilityId: string }> }) {
  const { abilityId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const ab = await AbilityService.getAbilityRow(abilityId)
  if (!ab) return new NextResponse('Not Found', { status: 404 })

  const opType = await AbilityService.getOpType(ab.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await KillteamService.getKillteamRow(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  await AbilityService.deleteAbility(abilityId)
  return NextResponse.json({ success: true })
}

