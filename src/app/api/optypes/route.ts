import { getAuthSession } from '@/lib/auth'
import { genId } from '@/lib/utils/utils'
import { KillteamService } from '@/services/killteam.service'
import { OpTypeService } from '@/services/opType.service'
import { NextResponse } from 'next/server'

const MAX_OPTYPES_PER_KILLTEAM = 30

function validateOpTypeInput(body: any) {
  const errors: string[] = []
  const data: any = {}

  // Required
  data.killteamId = typeof body.killteamId === 'string' ? body.killteamId.trim() : ''
  if (!data.killteamId) errors.push('killteamId is required')

  const name = typeof body.opTypeName === 'string' ? body.opTypeName.trim() : ''
  if (!name) errors.push('opTypeName is required')
  if (name.length > 250) errors.push('opTypeName must be <= 250 chars')
  data.opTypeName = name

  // Optional with constraints / defaults
  const MOVE = typeof body.MOVE === 'string' ? body.MOVE.trim() : '6"'
  if (MOVE.length > 10) errors.push('MOVE must be <= 10 chars')
  data.MOVE = MOVE

  const SAVE = typeof body.SAVE === 'string' ? body.SAVE.trim() : '4+'
  if (SAVE.length > 10) errors.push('SAVE must be <= 10 chars')
  data.SAVE = SAVE

  const APLraw = Number.isInteger(body.APL) ? body.APL : parseInt(String(body.APL ?? 2), 10)
  data.APL = isNaN(APLraw) ? 2 : Math.max(0, APLraw)

  const WOUNDSraw = Number.isInteger(body.WOUNDS) ? body.WOUNDS : parseInt(String(body.WOUNDS ?? 10), 10)
  data.WOUNDS = isNaN(WOUNDSraw) ? 10 : Math.max(0, WOUNDSraw)

  const keywords = typeof body.keywords === 'string' ? body.keywords.trim() : ''
  if (keywords.length > 250) errors.push('keywords must be <= 250 chars')
  data.keywords = keywords

  const basesizeRaw = Number.isInteger(body.basesize) ? body.basesize : parseInt(String(body.basesize ?? 32), 10)
  data.basesize = isNaN(basesizeRaw) ? 32 : Math.max(0, basesizeRaw)

  const nameType = typeof body.nameType === 'string' ? body.nameType.trim() : ''
  if (nameType.length > 50) errors.push('nameType must be <= 50 chars')
  data.nameType = nameType

  return { errors, data }
}

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { errors, data } = validateOpTypeInput(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  // Validate parent killteam ownership and HBR-only
  const team = await KillteamService.getKillteamRow(data.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  // Enforce max OpTypes per killteam
  const currentCount = await OpTypeService.countForKillteam(data.killteamId)
  if (currentCount >= MAX_OPTYPES_PER_KILLTEAM) {
    return NextResponse.json({ error: `This killteam already has the maximum of ${MAX_OPTYPES_PER_KILLTEAM} operative types.` }, { status: 400 })
  }

  // Create
  try {
    const created = await OpTypeService.createOpType({
      opTypeId: `${data.killteamId}-${genId().slice(0,4)}`,
      killteamId: data.killteamId,
      opTypeName: data.opTypeName,
      MOVE: data.MOVE,
      APL: data.APL,
      SAVE: data.SAVE,
      WOUNDS: data.WOUNDS,
      keywords: data.keywords,
      basesize: data.basesize,
      nameType: data.nameType,
    })
    if (!created) throw new Error('Create failed')
    return NextResponse.json(created.toPlain())
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create op type' }, { status: 500 })
  }
}
