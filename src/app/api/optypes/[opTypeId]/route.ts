import { getAuthSession } from '@/lib/auth'
import { KillteamService } from '@/services/killteam.service'
import { OpTypeService } from '@/services/opType.service'
import { NextResponse } from 'next/server'

function validatePatch(body: any) {
  const errors: string[] = []
  const updates: any = {}

  if (typeof body.opTypeName === 'string') {
    const v = body.opTypeName.trim()
    if (!v) errors.push('opTypeName cannot be empty')
    if (v.length > 250) errors.push('opTypeName must be <= 250 chars')
    updates.opTypeName = v
  }
  if (typeof body.MOVE === 'string') {
    const v = body.MOVE.trim()
    if (v.length > 10) errors.push('MOVE must be <= 10 chars')
    updates.MOVE = v
  }
  if (typeof body.SAVE === 'string') {
    const v = body.SAVE.trim()
    if (v.length > 10) errors.push('SAVE must be <= 10 chars')
    updates.SAVE = v
  }
  if (body.APL !== undefined) {
    const v = Number.isInteger(body.APL) ? body.APL : parseInt(String(body.APL), 10)
    updates.APL = isNaN(v) ? undefined : Math.max(0, v)
  }
  if (body.WOUNDS !== undefined) {
    const v = Number.isInteger(body.WOUNDS) ? body.WOUNDS : parseInt(String(body.WOUNDS), 10)
    updates.WOUNDS = isNaN(v) ? undefined : Math.max(0, v)
  }
  if (typeof body.keywords === 'string') {
    const v = body.keywords.trim()
    if (v.length > 250) errors.push('keywords must be <= 250 chars')
    updates.keywords = v
  }
  if (body.basesize !== undefined) {
    const v = Number.isInteger(body.basesize) ? body.basesize : parseInt(String(body.basesize), 10)
    updates.basesize = isNaN(v) ? undefined : Math.max(0, v)
  }
  if (typeof body.nameType === 'string') {
    const v = body.nameType.trim()
    if (v.length > 50) errors.push('nameType must be <= 50 chars')
    updates.nameType = v
  }

  return { errors, updates }
}

export async function GET(req: Request, { params }: { params: Promise<{ opTypeId: string }> }) {
  const { opTypeId } = await params
  const opType = await OpTypeService.getOpType(opTypeId)
  if (!opType) return new NextResponse('Not Found', { status: 404 })
  return NextResponse.json(opType.toPlain())
}

export async function PATCH(req: Request, { params }: { params: Promise<{ opTypeId: string }> }) {
  const { opTypeId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const row = await OpTypeService.getOpTypeRow(opTypeId)
  if (!row) return new NextResponse('Not Found', { status: 404 })

  const team = await KillteamService.getKillteamRow(row.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { errors, updates } = validatePatch(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const updated = await OpTypeService.updateOpType(opTypeId, updates)
  if (!updated) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(updated.toPlain())
}

export async function DELETE(req: Request, { params }: { params: Promise<{ opTypeId: string }> }) {
  const { opTypeId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const row = await OpTypeService.getOpTypeRow(opTypeId)
  if (!row) return new NextResponse('Not Found', { status: 404 })

  const team = await KillteamService.getKillteamRow(row.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  await OpTypeService.deleteOpType(opTypeId)
  return NextResponse.json({ success: true })
}

