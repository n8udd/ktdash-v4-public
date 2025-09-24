export const runtime = 'nodejs';

import { getAuthSession } from '@/lib/auth';
import { GAME } from '@/lib/config/game_config';
import { prisma } from '@/lib/prisma';
import { resizeImageToWebp, saveKillteamImage } from '@/lib/utils/imageProcessing';
import { sanitizeFileName } from '@/lib/utils/utils';
import { KillteamService } from '@/services/killteam.service';
import fs from 'fs/promises';
import { NextRequest, NextResponse, userAgent } from 'next/server';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const uploadDir = process.env.UPLOADS_DIR!;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ killteamId: string }> }
) {
  const { killteamId } = await params;

  try {
    const killteam = await KillteamService.getKillteamRow(killteamId);
    if (!killteam) return new NextResponse('Not Found', { status: 404 });

    // Homebrew portraits are stored under the owner's uploads folder
    const ownerUserId = killteam.userId;
    if (!ownerUserId) return new NextResponse('Not Found', { status: 404 });

    const useThumb = (new URL(req.url)).searchParams.get('thumb') === '1';

    const ktName = sanitizeFileName(killteam.killteamName || killteam.killteamId);

    const filename = useThumb
      ? `killteam_${killteamId}_thumb.webp`
      : `killteam_${killteamId}.webp`;

    const filePath = path.resolve(
      uploadDir,
      `user_${ownerUserId}`,
      `killteam_${killteamId}`,
      filename
    );

    const buffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${ktName}.webp"`,
        'Link': `<${GAME.ROOT_URL}/api/killteams/${killteamId}/portrait>; rel="canonical"`
      },
    });
  } catch (err) {
    return new NextResponse('Image not found', { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ killteamId: string }> }) {
  try {
    // Validate user - Must be logged in
    const session = await getAuthSession();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    // Parse form data
    const formData = await req.formData();
    const { killteamId } = await params;
    const file = formData.get('image') as File | null;

    if (!killteamId) return NextResponse.json({ error: 'Missing killteamId' }, { status: 400 });
    if (!file || !file.type.startsWith('image/')) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File too large' }, { status: 400 });

    const killteam = await KillteamService.getKillteamRow(killteamId);
    if (!killteam || !killteam.userId) return NextResponse.json({ error: 'Killteam not found' }, { status: 404 });
    if (killteam.userId !== session.user.userId) return new NextResponse('Forbidden', { status: 403 });

    // Process images: main 900x600 and thumb 225x150
    const mainBuf = await resizeImageToWebp(file, 900, 600);
    const thumbBuf = await resizeImageToWebp(file, 225, 150);

    await saveKillteamImage(mainBuf, killteam.userId, killteamId, `killteam_${killteamId}.webp`);
    await saveKillteamImage(thumbBuf, killteam.userId, killteamId, `killteam_${killteamId}_thumb.webp`);

    // Track the portrait event (no DB flags required)
    await prisma.webEvent.create({
      data: {
        eventType: 'killteam',
        action: 'portrait',
        label: 'custom',
        var1: killteamId,
        var2: '',
        var3: '',
        url: (req.headers.get('referer') || '').substring(0, 500),
        sessionType: '',
        referrer: (req.headers.get('referer') || '').substring(0, 500),
        userAgent: userAgent(req).ua,
        userIp: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '',
        userId: session.user.userId
      },
    })

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Upload failed', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ killteamId: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const { killteamId } = await params;
    const killteam = await KillteamService.getKillteamRow(killteamId);
    if (!killteam || !killteam.userId) return NextResponse.json({ error: 'Killteam not found' }, { status: 404 });
    if (killteam.userId !== session.user.userId) return new NextResponse('Forbidden', { status: 403 });

    // Delete files if they exist; ignore if missing
    const baseDir = path.resolve(uploadDir, `user_${killteam.userId}`, `killteam_${killteamId}`);
    const files = [
      path.join(baseDir, `killteam_${killteamId}.webp`),
      path.join(baseDir, `killteam_${killteamId}_thumb.webp`),
    ];
    for (const f of files) {
      try { await fs.unlink(f); } catch {}
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed', details: String(err) }, { status: 500 });
  }
}

