import { getAuthSession } from '@/lib/auth'
import { genId } from '@/lib/utils/utils'
import { KillteamService } from '@/services/killteam.service'
import { AbilityService } from '@/services/ability.service'
import { NextResponse } from 'next/server'

function validateCreate(body: any) {
  const errors: string[] = []
  const data: any = {}

  data.opTypeId = typeof body.opTypeId === 'string' ? body.opTypeId.trim() : ''
  if (!data.opTypeId) errors.push('opTypeId is required')

  const name = typeof body.abilityName === 'string' ? body.abilityName.trim() : ''
  if (!name) errors.push('abilityName is required')
  if (name.length > 250) errors.push('abilityName must be <= 250 chars')
  data.abilityName = name

  const desc = typeof body.description === 'string' ? body.description : ''
  data.description = desc

  if (body.AP !== undefined && body.AP !== null && body.AP !== '') {
    const APraw = Number.isInteger(body.AP) ? body.AP : parseInt(String(body.AP), 10)
    if (isNaN(APraw)) errors.push('AP must be a number')
    else data.AP = APraw
  }

  return { errors, data }
}

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { errors, data } = validateCreate(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  // Validate opType and parent killteam ownership (HBR-only)
  const opType = await AbilityService.getOpType(data.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await KillteamService.getKillteamRow(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  // Optional: cap abilities per opType
  // const count = await AbilityService.countForOpType(opType.opTypeId)
  // if (count >= 20) return NextResponse.json({ error: 'Maximum of 20 abilities reached' }, { status: 400 })

  try {
    const ab = await AbilityService.createAbility({
      abilityId: `${data.opTypeId}-ab-${genId().slice(0,4)}`,
      opTypeId: data.opTypeId,
      abilityName: data.abilityName,
      description: data.description ?? '',
      AP: data.AP ?? null,
    })
    if (!ab) throw new Error('Create failed')
    return NextResponse.json(ab.toPlain())
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create ability' }, { status: 500 })
  }
}

