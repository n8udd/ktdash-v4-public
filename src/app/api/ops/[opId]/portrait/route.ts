export const runtime = 'nodejs';

import { getAuthSession } from '@/lib/auth';
import { GAME } from '@/lib/config/game_config';
import { prisma } from '@/lib/prisma';
import { resizeImage, saveImage } from '@/lib/utils/imageProcessing';
import { sanitizeFileName } from '@/lib/utils/utils';
import { OpService, RosterService } from '@/services';
import fs from 'fs/promises';
import { NextRequest, NextResponse, userAgent } from 'next/server';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const uploadDir = process.env.UPLOADS_DIR!;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ opId: string }> }
) {
  const { opId } = await params;

  try {
    const op = await OpService.getOpRow(opId);
    if (!op?.hasCustomPortrait) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const opName = sanitizeFileName(op.opName ? op.opName : op.opId)

    const roster = await RosterService.getRosterRow(op.rosterId ?? '');
    if (!roster) {
      return new NextResponse('Roster not found', { status: 404 });
    }

    const filePath = path.resolve(
      uploadDir,
      `user_${roster.userId}`,
      `roster_${op.rosterId}`,
      `op_${opId}.jpg`
    );

    const buffer = await fs.readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${opName}.jpg"`,
        'Link': `<${GAME.ROOT_URL}/api/ops/${opId}/portrait>; rel="canonical"`
      },
    });
  } catch (err) {
    return new NextResponse('Image not found', { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ opId: string }> }) {
  try {
    // Validate user - Must be logged in
    const session = await getAuthSession()
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

    // Parse form data
    const formData = await req.formData();
    const { opId } = await params;
    const file = formData.get('image') as File | null;

    // Validate inputs
    if (!opId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Get the op
    const op = await OpService.getOp(opId);
    if (!op || !op.roster || !op.rosterId || op.roster.userId !== session.user.userId) {
      return NextResponse.json({ error: 'Operative not found' }, { status: 404 });
    }

    // Process the image
    const filename = `op_${opId}.jpg`;
    const resizedBuffer = await resizeImage(file, 900, 600);
    const publicUrl = await saveImage(resizedBuffer, session.user.userId, op.rosterId, filename);

    // Update the op record
    await OpService.updateOp(opId, { hasCustomPortrait: true });

    // Track the portrait event
    await prisma.webEvent.create({
      data: {
        eventType: 'roster',
        action: 'opportrait',
        label: 'custom',
        var1: op.rosterId,
        var2: op.opId,
        var3: '',
        url: (req.headers.get('referer') || '').substring(0, 500),
        sessionType: '',
        referrer: (req.headers.get('referer') || '').substring(0, 500),
        userAgent: userAgent(req).ua,
        userIp: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '',
        userId: session.user.userId
      },
    })

    // Done
    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (err) {
    // Something went wrong
    return NextResponse.json({ error: 'Upload failed', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ opId: string }> }) {
  try {
    // Validate user - Must be logged in
    const session = await getAuthSession()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { opId } = await params;

    const op = await OpService.getOp(opId);
    if (!op || !op.roster || !op.rosterId || op.roster.userId !== session.user.userId) {
      return NextResponse.json({ error: 'Operative not found' }, { status: 404 });
    }

    await OpService.deleteOpPortrait(opId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.log("Portrait delete failed for op:", err)
    return NextResponse.json({ error: 'Delete failed', details: String(err) }, { status: 500 });
  }
}
