import { OpService, RosterService } from '@/services'
import { getAuthSession } from '@/src/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await getAuthSession()
  if (!session?.user?.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  let body: any
  let updates: Array<{ opId: string; seq: number }>
  let normalize = false
  try {
    body = await req.json()
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 })
  }

  // Support both legacy array body and new object body { updates, normalize? }
  if (Array.isArray(body)) {
    updates = body
    normalize = false
  } else {
    updates = body?.updates
    normalize = Boolean(body?.normalize)
  }

  if (!Array.isArray(updates) || !updates.every(op => op.opId && typeof op.seq === 'number')) {
    return new NextResponse('Invalid request body', { status: 400 })
  }

  try {
    let rosterId: string | null = null

    for (const update of updates) {
      // Check if the user is allowed to update this op
      const op = await OpService.getOp(update.opId)
      if (!op || !op.roster || !op.rosterId) {
        return new NextResponse('Op not found', { status: 404 })
      }
      if (op.roster.userId !== session.user.userId) {
        return new NextResponse('Forbidden', { status: 403 })
      }
      // Ensure all updates are for the same roster
      if (!rosterId) {
        rosterId = op.rosterId
      } else if (rosterId !== op.rosterId) {
        return new NextResponse('All updates must target the same roster', { status: 400 })
      }
      // Update the roster order
      await OpService.updateOp(update.opId, { seq: update.seq })
    }

    // Normalize seqs densely (1..N) across the roster if requested
    if (normalize && updates.length > 0) {
      // rosterId is guaranteed when updates are non-empty
      const op = await OpService.getOp(updates[0].opId)
      if (op?.rosterId) {
        await OpService.fixOpSeqs(op.rosterId)
      }
    }

    // Return the updated roster so the client can refresh state consistently
    if (updates.length > 0) {
      const op = await OpService.getOp(updates[0].opId)
      if (op?.rosterId) {
        const updatedRoster = await RosterService.getRoster(op.rosterId)
        return NextResponse.json(updatedRoster, { status: 200 })
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err) {
    console.error('Failed to update roster order', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
