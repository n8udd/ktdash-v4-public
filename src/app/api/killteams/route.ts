import { getAuthSession } from '@/lib/auth'
import { KillteamScope } from '@/repositories/killteam.repository'
import { UserService } from '@/services'
import { KillteamService } from '@/services/killteam.service'
import { NextResponse } from 'next/server'

// Get all killteams
export async function GET(req: Request) {
  const session = await getAuthSession()
  const viewerUserId = session?.user?.userId
  const { searchParams } = new URL(req.url)
  const fullParam = (searchParams.get('full') || '').toLowerCase()
  const wantsFull = fullParam === 'y' || fullParam === 'yes' || fullParam === 'true' || fullParam === '1'

  const scopeParam = (searchParams.get('scope') || '').toLowerCase()
  let scope: KillteamScope = 'standard'

  switch (scopeParam) {
    case 'all':
      scope = 'all';
      break;
    case 'homebrew':
      scope = 'homebrew'
  }

  if (wantsFull) {
    const killteams = await KillteamService.getAllKillteamsFull(scope, { userId: viewerUserId })
    // Return plain objects for stable JSON dataset consumers
    return NextResponse.json(killteams.map(k => k.toPlain()))
  }

  const killteams = await KillteamService.getAllKillteams(scope, { userId: viewerUserId })

  return NextResponse.json(killteams.map(k => k.toPlain()))
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
  // Default to not published for freshly created homebrew teams
  const isPublished = typeof body.isPublished === 'boolean' ? body.isPublished : false

  if (!name) errors.push('killteamName is required')
  if (name.length > 250) errors.push('killteamName must be <= 250 chars')
  if (archetypes && archetypes.length > 250) errors.push('archetypes must be <= 250 chars')

  if (errors.length) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  // Enforce per-user cap for homebrew teams
  const userId = session.user.userId
  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 })
  }

  const hbTeams = (await UserService.getUser(userId))?.killteams

  const hbCount = hbTeams?.length || 0
  if (hbCount >= 50) {
    return NextResponse.json({ error: 'Homebrew limit reached (10 per user)' }, { status: 400 })
  }

  // Generate a stable, user-scoped homebrew ID: HBR-<user>-<n>
  // This keeps IDs readable, grouped by user, and avoids collisions.
  const short = userId.substring(0, 6)
  const prefix = `HBR-${short}-`

  // Get existing IDs with this prefix and compute the next counter
  const existing = hbTeams || []
  const maxN = existing
    .map(k => {
      const m = k.killteamId.match(/^HBR-[^-]+-(\d+)$/)
      return m ? parseInt(m[1], 10) : 0
    })
    .reduce((a, b) => Math.max(a, b), 0)
  let next = maxN + 1
  let killteamId = `${prefix}${next}`
  
  try {
    const created = await KillteamService.createKillteam({
      killteamId,
      factionId: 'HBR',
      killteamName: name,
      description,
      composition,
      archetypes,
      userId,
      isPublished,
    })
    if (!created) throw new Error('Create failed')
    return NextResponse.json(created.toPlain())
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create killteam' }, { status: 500 })
  }
}
