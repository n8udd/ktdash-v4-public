import { KillteamService } from '@/services/killteam.service'
import { NextResponse } from 'next/server'

// Get all killteams
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fullParam = (searchParams.get('full') || '').toLowerCase()
  const wantsFull = fullParam === 'y' || fullParam === 'yes' || fullParam === 'true' || fullParam === '1'

  if (wantsFull) {
    const killteams = await KillteamService.getAllKillteamsFull()
    // Return plain objects for stable JSON dataset consumers
    return NextResponse.json(killteams.map(k => k.toPlain()))
  }

  const killteams = await KillteamService.getAllKillteams()

  return NextResponse.json(killteams)
}
