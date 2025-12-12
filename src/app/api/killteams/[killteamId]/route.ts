import { getAuthSession } from '@/lib/auth'
import { KillteamService } from '@/services/killteam.service'
import { RosterService } from '@/services/roster.service'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params
  const session = await getAuthSession()
  const killteam = await KillteamService.getKillteam(killteamId, { userId: session?.user?.userId })
  if (!killteam) {
    return NextResponse.json({ error: 'Killteam not found' }, { status: 404 })
  }

  return NextResponse.json(killteam.toPlain())
}

// Update a killteam (owner or admin)
export async function PATCH(req: Request, { params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params

  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const row = await KillteamService.getKillteamRow(killteamId)
  if (!row) return new NextResponse('Not Found', { status: 404 })

  // Enforce ownership or admin override
  if (row.userId !== session.user.userId && session.user.userId !== 'vince') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Only allow editing homebrew teams
  if (row.factionId !== 'HBR') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const body = await req.json().catch(() => ({} as any))
  const updates: any = {}
  const errors: string[] = []

  if (typeof body.killteamName === 'string') {
    const v = body.killteamName.trim()
    if (!v) errors.push('KillteamName cannot be empty')
    if (v.length > 250) errors.push('KillteamName must be <= 250 chars')
    updates.killteamName = v
  }

  if (typeof body.description === 'string') {
    updates.description = body.description
  }

  if (typeof body.composition === 'string') {
    updates.composition = body.composition
  }

  if (typeof body.archetypes === 'string') {
    const a = body.archetypes.trim()
    if (a.length > 250) errors.push('Archetypes must be <= 250 chars')
    updates.archetypes = a
  }

  if (typeof body.isPublished === 'boolean') {
    updates.isPublished = !!body.isPublished
  }

  if (Object.prototype.hasOwnProperty.call(body, 'defaultRosterId')) {
    const raw = body.defaultRosterId

    if (raw === null) {
      updates.defaultRosterId = null
    } else if (typeof raw === 'string') {
      const rosterId = raw.trim()
      if (!rosterId) {
        updates.defaultRosterId = null
      } else {
        const roster = await RosterService.getRosterRow(rosterId)
        if (!roster || roster.killteamId !== killteamId || roster.userId !== row.userId) {
          errors.push('Invalid default roster selection')
        } else {
          updates.defaultRosterId = rosterId
        }
      }
    } else {
      errors.push('Invalid default roster selection')
    }
  }

  if (errors.length) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const updated = await KillteamService.updateKillteam(killteamId, updates)
  if (!updated) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(updated.toPlain())
}

// Delete a killteam (owner or admin)
export async function DELETE(req: Request, { params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params

  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const row = await KillteamService.getKillteamRow(killteamId)
  if (!row) return new NextResponse('Not Found', { status: 404 })

  if (row.userId !== session.user.userId && session.user.userId !== 'vince') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (row.factionId !== 'HBR') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  await KillteamService.deleteKillteam(killteamId)
  return NextResponse.json({ success: true })
}
