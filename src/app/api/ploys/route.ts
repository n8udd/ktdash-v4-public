import { getAuthSession } from '@/lib/auth'
import { genId } from '@/lib/utils/utils'
import { KillteamService } from '@/services/killteam.service'
import { PloyService } from '@/services/ploy.service'
import { NextResponse } from 'next/server'

function validateCreate(body: any) {
  const errors: string[] = []
  const data: any = {}

  data.killteamId = typeof body.killteamId === 'string' ? body.killteamId.trim() : ''
  if (!data.killteamId) errors.push('killteamId is required')

  const name = typeof body.ployName === 'string' ? body.ployName.trim() : ''
  if (!name) errors.push('ployName is required')
  if (name.length > 250) errors.push('ployName must be <= 250 chars')
  data.ployName = name

  const type = typeof body.ployType === 'string' ? body.ployType.trim().toUpperCase() : 'S'
  if (!['S', 'F'].includes(type)) errors.push('ployType must be S or F')
  data.ployType = type

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

  // Validate killteam ownership and homebrew
  const team = await KillteamService.getKillteamRow(data.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  // Cap per-team ploys
  const count = await PloyService.countForKillteam(team.killteamId)
  if (count >= 30) {
    return NextResponse.json({ error: 'Maximum of 30 ploys reached' }, { status: 400 })
  }

  try {
    const ploy = await PloyService.createPloy({
      ployId: `${team.killteamId}-p-${genId().slice(0,4)}`,
      killteamId: team.killteamId,
      ployType: data.ployType,
      ployName: data.ployName,
      description: data.description ?? '',
      effects: data.effects ?? ''
    })
    if (!ploy) throw new Error('Create failed')
    return NextResponse.json(ploy.toPlain())
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create ploy' }, { status: 500 })
  }
}
