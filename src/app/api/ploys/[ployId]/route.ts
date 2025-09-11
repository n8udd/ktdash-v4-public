import { getAuthSession } from '@/lib/auth'
import { KillteamService } from '@/services/killteam.service'
import { PloyService } from '@/services/ploy.service'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ ployId: string }> }) {
  const { ployId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const ploy = await PloyService.getPloyRow(ployId)
  if (!ploy) return new NextResponse('Not Found', { status: 404 })
  const team = await KillteamService.getKillteamRow(ploy.killteamId)
  if (!team) return new NextResponse('Not Found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const body = await req.json().catch(() => ({} as any))
  const updates: any = {}
  const errors: string[] = []

  if (typeof body.ployName === 'string') {
    const v = body.ployName.trim()
    if (!v) errors.push('ployName cannot be empty')
    if (v.length > 250) errors.push('ployName must be <= 250 chars')
    updates.ployName = v
  }

  if (typeof body.ployType === 'string') {
    const t = body.ployType.trim().toUpperCase()
    if (!['S','F'].includes(t)) errors.push('ployType must be S or F')
    updates.ployType = t
  }

  if (typeof body.description === 'string') updates.description = body.description
  if (typeof body.effects === 'string') updates.effects = body.effects

  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const updated = await PloyService.updatePloy(ployId, updates)
  if (!updated) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(updated.toPlain())
}

export async function DELETE(req: Request, { params }: { params: Promise<{ ployId: string }> }) {
  const { ployId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const ploy = await PloyService.getPloyRow(ployId)
  if (!ploy) return new NextResponse('Not Found', { status: 404 })
  const team = await KillteamService.getKillteamRow(ploy.killteamId)
  if (!team) return new NextResponse('Not Found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  await PloyService.deletePloy(ployId)
  return NextResponse.json({ success: true })
}
