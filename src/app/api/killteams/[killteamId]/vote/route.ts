import { getAuthSession } from '@/lib/auth'
import { KillteamService } from '@/services/killteam.service'
import { KillteamVoteService, KillteamVoteValue } from '@/services/killteamVote.service'
import { NextResponse } from 'next/server'

async function ensureHomebrew(killteamId: string) {
  const killteam = await KillteamService.getKillteamRow(killteamId)
  if (!killteam || !killteam.isHomebrew) {
    return null
  }
  return killteam
}

export async function GET(req: Request, { params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params
  const killteam = await ensureHomebrew(killteamId)
  if (!killteam) return NextResponse.json({ error: 'Killteam not found' }, { status: 404 })

  const session = await getAuthSession()
  const payload = await KillteamVoteService.getVoteState(killteamId, session?.user?.userId)
  return NextResponse.json(payload)
}

export async function POST(req: Request, { params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const killteam = await ensureHomebrew(killteamId)
  if (!killteam) return NextResponse.json({ error: 'Killteam not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const value = body?.value as KillteamVoteValue | undefined
  if (value !== 'up' && value !== 'down') {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })
  }

  const payload = await KillteamVoteService.castVote(killteamId, session.user.userId, value)
  return NextResponse.json(payload)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const killteam = await ensureHomebrew(killteamId)
  if (!killteam) return NextResponse.json({ error: 'Killteam not found' }, { status: 404 })

  const payload = await KillteamVoteService.clearVote(killteamId, session.user.userId)
  return NextResponse.json(payload)
}
