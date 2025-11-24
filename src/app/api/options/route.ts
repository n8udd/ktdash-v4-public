import { getAuthSession } from '@/lib/auth'
import { genId } from '@/lib/utils/utils'
import { KillteamService } from '@/services/killteam.service'
import { OptionService } from '@/services/option.service'
import { NextResponse } from 'next/server'

function validateCreate(body: any) {
  const errors: string[] = []
  const data: any = {}

  data.opTypeId = typeof body.opTypeId === 'string' ? body.opTypeId.trim() : ''
  if (!data.opTypeId) errors.push('opTypeId is required')

  const name = typeof body.optionName === 'string' ? body.optionName.trim() : ''
  if (!name) errors.push('optionName is required')
  if (name.length > 50) errors.push('optionName must be <= 50 chars')
  data.optionName = name

  const effects = typeof body.effects === 'string' ? body.effects : ''
  if (effects.length > 50) errors.push('effects must be <= 50 chars')
  data.effects = effects

  data.description = typeof body.description === 'string' ? body.description : ''

  return { errors, data }
}

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { errors, data } = validateCreate(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const opType = await OptionService.getOpType(data.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await KillteamService.getKillteamRow(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  try {
    const option = await OptionService.createOption({
      optionId: `${data.opTypeId}-opt-${genId().slice(0,4)}`,
      opTypeId: data.opTypeId,
      optionName: data.optionName,
      description: data.description ?? '',
      effects: data.effects ?? '',
    })
    if (!option) throw new Error('Create failed')
    return NextResponse.json(option.toPlain())
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create option' }, { status: 500 })
  }
}
