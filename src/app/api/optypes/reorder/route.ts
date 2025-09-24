import { KillteamService } from '@/services/killteam.service'
import { OpTypeService } from '@/services/opType.service'
import { getAuthSession } from '@/src/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user?.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 })
  }

  // Support both legacy array body and new object body { updates, normalize? }
  const updates: Array<{ opTypeId: string; seq: number }> = Array.isArray(body) ? body : body?.updates
  const normalize = Boolean(Array.isArray(body) ? false : body?.normalize)

  if (!Array.isArray(updates) || !updates.every(u => u.opTypeId && typeof u.seq === 'number')) {
    return new NextResponse('Invalid request body', { status: 400 })
  }

  try {
    let killteamId: string | null = null

    for (const update of updates) {
      const opType = await OpTypeService.getOpTypeRow(update.opTypeId)
      if (!opType) {
        return new NextResponse('OpType not found', { status: 404 })
      }
      const team = await KillteamService.getKillteamRow(opType.killteamId)
      if (!team) {
        return new NextResponse('Killteam not found', { status: 404 })
      }
      if (team.userId !== session.user.userId && session.user.userId !== 'vince') {
        return new NextResponse('Forbidden', { status: 403 })
      }
      if (team.factionId !== 'HBR') {
        return new NextResponse('Forbidden', { status: 403 })
      }

      if (!killteamId) {
        killteamId = opType.killteamId
      } else if (killteamId !== opType.killteamId) {
        return new NextResponse('All updates must target the same killteam', { status: 400 })
      }

      await OpTypeService.updateOpType(update.opTypeId, { seq: update.seq })
    }

    if (normalize && killteamId) {
      await OpTypeService.fixOpTypeSeqs(killteamId)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    console.error('Failed to update opType order', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

