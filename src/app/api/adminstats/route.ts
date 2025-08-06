import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toLocalIsoDate } from '@/lib/utils/utils'
import { NextResponse } from 'next/server'

// Get the stats
export async function GET() {
  const session = await getAuthSession()
  if (!session?.user || session.user.userId != 'vince') return new NextResponse('Unauthorized', { status: 401 })
    
  const days = getLastNDates(8)
  const startDate = new Date(days[days.length - 1])
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 1) // to include today fully

  const stats: {
    totals: { users: number; rosters: number; ops: number };
    dailyStats: Record<string, any>;
    portraitEvents: any[]; // 👈 this works
  } = {
    totals: {
      users: 0,
      rosters: 0,
      ops: 0
    },
    dailyStats: {},
    portraitEvents: []
  }
  
  // Get the stats
  // Totals: Users, rosters, ops
  const [users, rosters, ops, recentSignups] = await Promise.all([
    prisma.user.count(),
    prisma.roster.count(),
    prisma.op.count(),
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      select: {
        createdAt: true
      }
    })
  ])

  stats.totals = { users, rosters, ops }
  
  const [pageViews] = await Promise.all([
    prisma.webEvent.findMany({
      where: {
        datestamp: {
          gte: startDate,
          lt: endDate
        },
        userIp: {
          notIn: ['127.0.0.1', '::1', '76.98.82.81', '73.188.188.13']
        }
      },
      select: { datestamp: true }
    })
  ])

  // Group into { 'YYYY-MM-DD': count }
  const pageViewsPerDay: Record<string, number> = {}

  for (const e of pageViews) {
    const date = toLocalIsoDate(e.datestamp)
    pageViewsPerDay[date] = (pageViewsPerDay[date] || 0) + 1
  }
  const signupsPerDay: Record<string, number> = {}

  for (const u of recentSignups) {
    const date = toLocalIsoDate(u.createdAt)
    signupsPerDay[date] = (signupsPerDay[date] || 0) + 1
  }

  // Merge into array for frontend
  stats.dailyStats = days.map(date => ({
    date,
    views: pageViewsPerDay[date] || 0,
    signups: signupsPerDay[date] || 0
  }))

  const recentPortraitEvents = await prisma.webEvent.findMany({
    where: {
      eventType: 'roster',
      action: {
        in: ['rosterportrait', 'opportrait']
      },
      datestamp: {
        gte: startDate
      }
    },
    select: {
      datestamp: true,
      var1: true // rosterId
    }
  })
  const recentRosterActivity = new Map<string, Date>()

  for (const { var1: rosterId, datestamp } of recentPortraitEvents) {
    if (!rosterId) continue
    const current = recentRosterActivity.get(rosterId)
    if (!current || datestamp > current) {
      recentRosterActivity.set(rosterId, datestamp)
    }
  }

  const rosterIds = Array.from(recentRosterActivity.keys())

  const portraitRosters = await prisma.roster.findMany({
    where: {
      rosterId: { in: rosterIds },
      hasCustomPortrait: true
    },
    include: {
      ops: {
        select: { opId: true, hasCustomPortrait: true }
      },
      user: {
        select: { userName: true }
      },
      killteam: {
        select: { killteamName: true }
      }
    }
  })

  const portraitCompleteRosters = portraitRosters
  .map(r => {
    const totalOps = r.ops.length
    const customOps = r.ops.filter(op => op.hasCustomPortrait).length
    const isComplete = totalOps > 0 && totalOps === customOps

    return {
      rosterId: r.rosterId,
      rosterName: r.rosterName,
      isSpotlight: r.isSpotlight,
      userName: r.user?.userName ?? 'Unknown',
      killteamName: r.killteam?.killteamName ?? 'Unknown',
      hasCustomPortrait: r.hasCustomPortrait,
      totalOps,
      customOps,
      isComplete,
      latestEventAt: recentRosterActivity.get(r.rosterId) ?? null
    }
  })
  .sort((a, b) => b.latestEventAt!.getTime() - a.latestEventAt!.getTime())

  stats.portraitEvents = portraitCompleteRosters

  return NextResponse.json(stats)
}

function getLastNDates(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().split('T')[0]) // 'YYYY-MM-DD'
  }

  return dates
}