import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(null);
  }

  const { slug } = await params;

  const interaction = await prisma.userPostInteraction.findUnique({
    where: {
      userId_postSlug: { userId: session.user.id, postSlug: slug },
    },
    select: { isRead: true, bookmarkPercent: true, note: true, isFavorite: true, isOnReadingList: true },
  });

  return NextResponse.json(
    interaction ?? { isRead: false, bookmarkPercent: null, note: '', isFavorite: false, isOnReadingList: false },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.isRead === 'boolean') {
    data.isRead = body.isRead;
    data.readAt = body.isRead ? new Date() : null;
  }
  if (typeof body.bookmarkPercent === 'number') {
    data.bookmarkPercent = Math.max(0, Math.min(100, Math.round(body.bookmarkPercent)));
  }
  if (body.bookmarkPercent === null) {
    data.bookmarkPercent = null;
  }
  if (typeof body.note === 'string') {
    data.note = body.note.slice(0, 5000);
  }
  if (typeof body.isFavorite === 'boolean') {
    data.isFavorite = body.isFavorite;
  }
  if (typeof body.isOnReadingList === 'boolean') {
    data.isOnReadingList = body.isOnReadingList;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Keine gültigen Felder' }, { status: 400 });
  }

  const interaction = await prisma.userPostInteraction.upsert({
    where: {
      userId_postSlug: { userId: session.user.id, postSlug: slug },
    },
    create: { userId: session.user.id, postSlug: slug, ...data },
    update: data,
    select: { isRead: true, bookmarkPercent: true, note: true, isFavorite: true, isOnReadingList: true },
  });

  return NextResponse.json(interaction);
}
