import { KillteamService } from '@/services/killteam.service'
import { getAuthSession } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { genId } from '@/lib/utils/utils'

// Get all killteams
export async function GET() {
  const killteams = await KillteamService.getAllKillteams()

  return NextResponse.json(killteams)
}

// Create a homebrew killteam for the current user
export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => ({}))
  const errors: string[] = []

  // Validate inputs
  const name = typeof body.killteamName === 'string' ? body.killteamName.trim() : ''
  const description = typeof body.description === 'string' ? body.description : ''
  const composition = typeof body.composition === 'string' ? body.composition : ''
  const archetypes = typeof body.archetypes === 'string' ? body.archetypes.trim() : undefined
  const isPublished = typeof body.isPublished === 'boolean' ? body.isPublished : true

  if (!name) errors.push('killteamName is required')
  if (name.length > 250) errors.push('killteamName must be <= 250 chars')
  if (archetypes && archetypes.length > 250) errors.push('archetypes must be <= 250 chars')

  if (errors.length) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const killteamId = `HBR-${genId()}` // HBR faction; keep IDs readable
  try {
    const created = await KillteamService.createKillteam({
      killteamId,
      factionId: 'HBR',
      killteamName: name,
      description,
      composition,
      archetypes,
      userId: session.user.userId,
      isPublished,
    })
    if (!created) throw new Error('Create failed')
    return NextResponse.json(created.toPlain())
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create killteam' }, { status: 500 })
  }
}
