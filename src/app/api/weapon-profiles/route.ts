import { getAuthSession } from '@/lib/auth'
import { genId } from '@/lib/utils/utils'
import { WeaponProfileService } from '@/services/weaponProfile.service'
import { NextResponse } from 'next/server'

function validateCreate(body: any) {
  const errors: string[] = []
  const data: any = {}

  data.wepId = typeof body.wepId === 'string' ? body.wepId.trim() : ''
  if (!data.wepId) errors.push('wepId is required')

  const profileName = typeof body.profileName === 'string' ? body.profileName.trim() : 'Default'
  if (profileName.length > 250) errors.push('profileName must be <= 250 chars')
  data.profileName = profileName

  const ATK = typeof body.ATK === 'string' ? body.ATK.trim() : '4'
  if (ATK.length > 10) errors.push('ATK must be <= 10 chars')
  data.ATK = ATK

  const HIT = typeof body.HIT === 'string' ? body.HIT.trim() : '4+'
  if (HIT.length > 10) errors.push('HIT must be <= 10 chars')
  data.HIT = HIT

  const DMG = typeof body.DMG === 'string' ? body.DMG.trim() : '3/4'
  if (DMG.length > 10) errors.push('DMG must be <= 10 chars')
  data.DMG = DMG

  const WR = typeof body.WR === 'string' ? body.WR.trim() : ''
  if (WR.length > 250) errors.push('WR must be <= 250 chars')
  data.WR = WR

  return { errors, data }
}

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { errors, data } = validateCreate(body)
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 })

  // Validate ownership chain: profile -> weapon -> opType -> killteam
  const weapon = await WeaponProfileService.getWeapon(data.wepId)
  if (!weapon) return new NextResponse('Weapon not found', { status: 404 })
  const opType = await WeaponProfileService.getOpType(weapon.opTypeId)
  if (!opType) return new NextResponse('OpType not found', { status: 404 })
  const team = await WeaponProfileService.getKillteam(opType.killteamId)
  if (!team) return new NextResponse('Killteam not found', { status: 404 })
  if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
  if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

  // Cap profiles per weapon at 4
  const count = await WeaponProfileService.countForWeapon(weapon.wepId)
  if (count >= 4) {
    return NextResponse.json({ error: 'This weapon already has the maximum of 4 profiles.' }, { status: 400 })
  }

  const created = await WeaponProfileService.createProfile({
    wepprofileId: `${data.wepId}-${genId().slice(0,4)}`,
    wepId: data.wepId,
    profileName: data.profileName,
    ATK: data.ATK,
    HIT: data.HIT,
    DMG: data.DMG,
    WR: data.WR,
  })

  if (!created) return new NextResponse('Error', { status: 500 })
  return NextResponse.json(created)
}
