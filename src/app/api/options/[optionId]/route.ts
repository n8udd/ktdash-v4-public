import { getAuthSession } from '@/lib/auth'
import { KillteamService } from '@/services/killteam.service'
import { OptionService } from '@/services/option.service'
import { NextResponse } from 'next/server'

function validatePatch(body: any) {
  const errors: string[] = []
  const updates: any = {}

  if (typeof body.optionName === 'string') {
    const v = body.optionName.trim()
    if (!v) errors.push('optionName cannot be empty')
    if (v.length > 50) errors.push('optionName must be <= 50 chars')
    updates.optionName = v
  }

  if (typeof body.description === 'string') updates.description = body.description

  if (typeof body.effects === 'string') {
    if (body.effects.length > 50) errors.push('effects must be <= 50 chars')
    updates.effects = body.effects
  }

  if (body.seq !== undefined) {
    const v = Number.isInteger(body.seq) ? body.seq : parseInt(String(body.seq), 10)
    if (isNaN(v)) errors.push('seq must be a number')
    else updates.seq = v
  }

  return { errors, updates }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ optionId: string }> }) {
  const { optionId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const option = await OptionService.getOptionRow(optionId)
  if (!option) return new NextResponse('Not Found', { status: 404 })

  const opType = await OptionService.getOpType(option.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await KillteamService.getKillteamRow(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const body = await req.json().catch(() => ({} as any))
  const { errors, updates } = validatePatch(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const updated = await OptionService.updateOption(optionId, updates)
  if (!updated) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(updated.toPlain())
}

export async function DELETE(req: Request, { params }: { params: Promise<{ optionId: string }> }) {
  const { optionId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const option = await OptionService.getOptionRow(optionId)
  if (!option) return new NextResponse('Not Found', { status: 404 })

  const opType = await OptionService.getOpType(option.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await KillteamService.getKillteamRow(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  await OptionService.deleteOption(optionId)
  return NextResponse.json({ success: true })
}
