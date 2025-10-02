import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ killteamId: string }> }) {
  const { killteamId } = await params

  const session = await getAuthSession()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const killteam = await prisma.killteam.findUnique({
    where: { killteamId },
    select: {
      killteamId: true,
      userId: true,
      factionId: true,
    },
  })

  if (!killteam) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const requesterId = session.user.userId
  const isAdmin = requesterId === 'vince'

  if (killteam.userId !== requesterId && !isAdmin) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (killteam.factionId !== 'HBR') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (!killteam.userId) {
    return NextResponse.json([])
  }

  const rosters = await prisma.roster.findMany({
    where: {
      killteamId: killteam.killteamId,
      userId: killteam.userId,
    },
    orderBy: [
      { rosterName: 'asc' },
    ],
    select: {
      rosterId: true,
      rosterName: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json(rosters)
}
