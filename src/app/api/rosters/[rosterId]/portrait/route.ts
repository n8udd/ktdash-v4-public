export const runtime = 'nodejs';

import { getAuthSession } from '@/lib/auth';
import { resizeImage, saveImage } from '@/lib/utils/imageProcessing';
import { RosterService } from '@/services';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const uploadDir = process.env.UPLOADS_DIR!;

export async function GET(
  req: NextRequest,
  { params }: { params: { rosterId: string } }
) {
  const { rosterId } = await params;

  try {
    const roster = await RosterService.getRosterRow(rosterId);
    if (!roster?.hasCustomPortrait) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const rosterName = roster.rosterName ? roster.rosterName : roster.rosterId

    const filePath = path.resolve(
      uploadDir,
      `user_${roster.userId}`,
      `roster_${roster.rosterId}`,
      `roster_${roster.rosterId}.jpg`
    );

    const buffer = await fs.readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${rosterName}.jpg"`,
      },
    });
  } catch (err) {
    return new NextResponse('Image not found', { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ rosterId: string }> }) {
  try {
    // Validate user - Must be logged in
    const session = await getAuthSession()
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

    // Parse form data
    const formData = await req.formData();
    const { rosterId } = await params;
    const file = formData.get('image') as File | null;

    // Validate inputs
    if (!rosterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Get the roster
    const roster = await RosterService.getRoster(rosterId);
    if (!roster || !roster.rosterId || roster.userId !== session.user.userId) {
      return NextResponse.json({ error: 'Roster not found' }, { status: 404 });
    }

    // Process the image
    const filename = `roster_${rosterId}.jpg`;
    const resizedBuffer = await resizeImage(file, 900, 600);
    const publicUrl = await saveImage(resizedBuffer, session.user.userId, roster.rosterId, filename);

    // Update the op record
    await RosterService.updateRoster(rosterId, { hasCustomPortrait: true });

    // Done
    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (err) {
    // Something went wrong
    return NextResponse.json({ error: 'Upload failed', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ rosterId: string }> }) {
  try {
    // Validate user - Must be logged in
    const session = await getAuthSession()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { rosterId } = await params;

    const roster = await RosterService.getRoster(rosterId);
    if (!roster || !roster.rosterId || roster.userId !== session.user.userId) {
      return NextResponse.json({ error: 'Roster not found' }, { status: 404 });
    }

    await RosterService.deleteRosterPortrait(rosterId);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.log("Portrait delete failed for roster:", err)
    return NextResponse.json({ error: 'Delete failed', details: String(err) }, { status: 500 });
  }
}
