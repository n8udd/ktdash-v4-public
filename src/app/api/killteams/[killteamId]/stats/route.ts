import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ killteamId: string }> }
) {
  const { killteamId } = await params
  if (!killteamId) return NextResponse.json({ error: 'Missing killteamId' }, { status: 400 })

  try {
    // Ensure killteam exists
    const kt = await prisma.killteam.findUnique({ where: { killteamId } })
    if (!kt) return NextResponse.json({ error: 'Killteam not found' }, { status: 404 })

    // Total rosters for this killteam
    const totalRosters = await prisma.roster.count({ where: { killteamId } })

    // New rosters in trailing windows
    const now = new Date()
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [newRosters7d, newRosters30d] = await Promise.all([
      prisma.roster.count({ where: { killteamId, createdAt: { gte: d7 } } }),
      prisma.roster.count({ where: { killteamId, createdAt: { gte: d30 } } }),
    ])

    // Views in past 7 days: WebEvent with type 'page', action 'view', url contains /killteams/{id}
    const views7d = await prisma.webEvent.count({
      where: {
        eventType: 'page',
        action: 'view',
        url: { contains: `/killteams/${killteamId}` },
        datestamp: { gte: d7 },
      },
    })

    // Rank among homebrew teams by total rosters
    // Determine all homebrew killteams (factionId === 'HBR')
    const hbTeams = await prisma.killteam.findMany({
      where: { factionId: 'HBR' },
      select: { killteamId: true },
    })
    const hbIds = hbTeams.map(t => t.killteamId)

    let rankByRosters = null as number | null
    let rankTotalHomebrew = hbIds.length

    if (rankTotalHomebrew > 0) {
      // Group roster counts for all homebrew ids
      const hbCounts = await prisma.roster.groupBy({
        by: ['killteamId'],
        _count: { _all: true },
        where: { killteamId: { in: hbIds } },
      })

      // Map all hb ids to counts (default 0)
      const countMap = new Map<string, number>()
      hbIds.forEach(id => countMap.set(id, 0))
      hbCounts.forEach(row => countMap.set(row.killteamId, row._count._all))

      const thisCount = countMap.get(killteamId) ?? 0
      const higher = Array.from(countMap.values()).filter(c => c > thisCount).length
      rankByRosters = higher + 1
    }

    return NextResponse.json({
      totalRosters,
      views7d,
      rankByRosters,
      rankTotalHomebrew,
      newRosters7d,
      newRosters30d,
    })
  } catch (err) {
    console.error('Stats error', err)
    return NextResponse.json({ error: 'Failed to compute stats' }, { status: 500 })
  }
}

