import { RosterService } from '@/services/roster.service'
import { NextResponse } from 'next/server'

export async function GET() {
  const roster = await RosterService.getRandomSpotlight()
  if (!roster) return new NextResponse('Not Found', { status: 404 })
  return NextResponse.json(roster.toPlain())
}
