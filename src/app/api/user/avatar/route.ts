import { NextResponse } from 'next/server';
import { requireActiveSession, toAuthErrorResponse } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

const MAX_SIZE = 512 * 1024; // 512 KB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: Request) {
  let access;
  try {
    access = await requireActiveSession();
  } catch (error) {
    return toAuthErrorResponse(error) ?? NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }

  let body: { image?: string };
  try {
    body = (await req.json()) as { image?: string };
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const { image } = body;

  if (!image || typeof image !== 'string') {
    return NextResponse.json({ error: 'Kein Bild gesendet' }, { status: 400 });
  }

  // Validate data URL format
  const match = image.match(/^data:(image\/(jpeg|png|webp));base64,/);
  if (!match) {
    return NextResponse.json({ error: 'Ungültiges Bildformat. Erlaubt: JPEG, PNG, WebP' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(match[1])) {
    return NextResponse.json({ error: 'Ungültiger Bildtyp' }, { status: 400 });
  }

  // Check size (base64 data after prefix)
  const base64Data = image.slice(image.indexOf(',') + 1);
  const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);

  if (sizeInBytes > MAX_SIZE) {
    return NextResponse.json({ error: 'Bild zu groß (max. 512 KB)' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: access.user.id },
    data: { image },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  let access;
  try {
    access = await requireActiveSession();
  } catch (error) {
    return toAuthErrorResponse(error) ?? NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }

  await prisma.user.update({
    where: { id: access.user.id },
    data: { image: null },
  });

  return NextResponse.json({ success: true });
}
