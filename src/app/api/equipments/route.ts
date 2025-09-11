import { getAuthSession } from '@/lib/auth'
import { genId } from '@/lib/utils/utils'
import { KillteamService } from '@/services/killteam.service'
import { EquipmentService } from '@/services/equipment.service'
import { NextResponse } from 'next/server'

function validateCreate(body: any) {
  const errors: string[] = []
  const data: any = {}

  data.killteamId = typeof body.killteamId === 'string' ? body.killteamId.trim() : ''
  if (!data.killteamId) errors.push('killteamId is required')

  const name = typeof body.eqName === 'string' ? body.eqName.trim() : ''
  if (!name) errors.push('eqName is required')
  if (name.length > 250) errors.push('eqName must be <= 250 chars')
  data.eqName = name

  data.description = typeof body.description === 'string' ? body.description : ''
  data.effects = typeof body.effects === 'string' ? body.effects : ''
  return { errors, data }
}

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { errors, data } = validateCreate(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const team = await KillteamService.getKillteamRow(data.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const count = await EquipmentService.countForKillteam(team.killteamId)
  if (count >= 40) {
    return NextResponse.json({ error: 'Maximum of 40 equipment reached' }, { status: 400 })
  }

  try {
    const eq = await EquipmentService.createEquipment({
      eqId: `${team.killteamId}-e-${genId().slice(0,4)}`,
      killteamId: team.killteamId,
      eqName: data.eqName,
      description: data.description ?? '',
      effects: data.effects ?? '',
    })
    if (!eq) throw new Error('Create failed')
    return NextResponse.json(eq.toPlain())
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create equipment' }, { status: 500 })
  }
}

