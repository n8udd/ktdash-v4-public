import { getAuthSession } from '@/lib/auth'
import { EquipmentService } from '@/services/equipment.service'
import { KillteamService } from '@/services/killteam.service'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ eqId: string }> }) {
  const { eqId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const eq = await EquipmentService.getEquipmentRow(eqId)
  if (!eq) return new NextResponse('Not Found', { status: 404 })
  if (!eq.killteamId) return new NextResponse('Forbidden', { status: 403 }) // universal not editable here
  const team = await KillteamService.getKillteamRow(eq.killteamId)
  if (!team) return new NextResponse('Not Found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  const body = await req.json().catch(() => ({} as any))
  const updates: any = {}
  const errors: string[] = []

  if (typeof body.eqName === 'string') {
    const v = body.eqName.trim()
    if (!v) errors.push('eqName cannot be empty')
    if (v.length > 250) errors.push('eqName must be <= 250 chars')
    updates.eqName = v
  }

  if (typeof body.description === 'string') updates.description = body.description
  if (typeof body.effects === 'string') updates.effects = body.effects

  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  const updated = await EquipmentService.updateEquipment(eqId, updates)
  if (!updated) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(updated.toPlain())
}

export async function DELETE(req: Request, { params }: { params: Promise<{ eqId: string }> }) {
  const { eqId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const eq = await EquipmentService.getEquipmentRow(eqId)
  if (!eq) return new NextResponse('Not Found', { status: 404 })
  if (!eq.killteamId) return new NextResponse('Forbidden', { status: 403 })
  const team = await KillteamService.getKillteamRow(eq.killteamId)
  if (!team) return new NextResponse('Not Found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  await EquipmentService.deleteEquipment(eqId)
  return NextResponse.json({ success: true })
}

