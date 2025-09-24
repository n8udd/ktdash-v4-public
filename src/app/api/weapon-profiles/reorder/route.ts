import { getAuthSession } from '@/lib/auth'
import { KillteamService } from '@/services/killteam.service'
import { OpTypeService } from '@/services/opType.service'
import { WeaponService } from '@/services/weapon.service'
import { WeaponProfileService } from '@/services/weaponProfile.service'
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

  const updates: Array<{ wepprofileId: string; seq: number }> = Array.isArray(body) ? body : body?.updates
  const normalize = Boolean(Array.isArray(body) ? false : body?.normalize)

  if (!Array.isArray(updates) || !updates.every(u => u.wepprofileId && typeof u.seq === 'number')) {
    return new NextResponse('Invalid request body', { status: 400 })
  }

  try {
    let wepId: string | null = null

    for (const update of updates) {
      const profile = await WeaponProfileService.getProfile(update.wepprofileId)
      if (!profile) return new NextResponse('Profile not found', { status: 404 })

      const weapon = await WeaponService.getWeapon(profile.wepId)
      if (!weapon) return new NextResponse('Weapon not found', { status: 404 })
      const opType = await OpTypeService.getOpTypeRow(weapon.opTypeId)
      if (!opType) return new NextResponse('OpType not found', { status: 404 })
      const team = await KillteamService.getKillteamRow(opType.killteamId)
      if (!team) return new NextResponse('Killteam not found', { status: 404 })
      if (team.userId !== session.user.userId && session.user.userId !== 'vince') return new NextResponse('Forbidden', { status: 403 })
      if (team.factionId !== 'HBR') return new NextResponse('Forbidden', { status: 403 })

      if (!wepId) wepId = profile.wepId
      else if (wepId !== profile.wepId) return new NextResponse('All updates must target the same weapon', { status: 400 })

      await WeaponProfileService.updateProfile(update.wepprofileId, { seq: update.seq })
    }

    if (normalize && wepId) {
      await WeaponProfileService.fixProfileSeqs(wepId)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    console.error('Failed to update profile order', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

