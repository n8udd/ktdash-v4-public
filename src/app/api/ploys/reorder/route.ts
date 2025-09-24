import { getAuthSession } from '@/lib/auth'
import { KillteamService } from '@/services/killteam.service'
import { PloyService } from '@/services/ploy.service'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user?.userId) return new NextResponse('Unauthorized', { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 })
  }

  const updates: Array<{ ployId: string; seq: number }> = Array.isArray(body) ? body : body?.updates
  const normalize = Boolean(Array.isArray(body) ? false : body?.normalize)

  if (!Array.isArray(updates) || !updates.every(u => u.ployId && typeof u.seq === 'number')) {
    return new NextResponse('Invalid request body', { status: 400 })
  }

  try {
    let killteamId: string | null = null
    let ployType: 'S' | 'F' | null = null

    for (const update of updates) {
      const ploy = await PloyService.getPloyRow(update.ployId)
      if (!ploy) return new NextResponse('Ploy not found', { status: 404 })

      const team = await KillteamService.getKillteamRow(ploy.killteamId)
      if (!team) return new NextResponse('Killteam not found', { status: 404 })
      if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
      if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

      if (!killteamId) killteamId = ploy.killteamId
      else if (killteamId !== ploy.killteamId) return new NextResponse('All updates must target the same killteam', { status: 400 })

      if (!ployType) ployType = (ploy.ployType as 'S' | 'F')
      else if (ployType !== ploy.ployType) return new NextResponse('All updates must target the same ploy type', { status: 400 })

      await PloyService.updatePloy(update.ployId, { seq: update.seq })
    }

    if (normalize && killteamId && ployType) {
      await PloyService.fixPloySeqs(killteamId, ployType)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    console.error('Failed to update ploy order', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

