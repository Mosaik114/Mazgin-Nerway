import { NextResponse } from 'next/server';
import { AuthGuardError, requireActiveSession, toAuthErrorResponse } from '@/lib/auth-guard';
import { getPostBySlug } from '@/lib/posts';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ slug: string }>;
}

function resolveCanonicalPostSlug(rawSlug: string): string | null {
  const post = getPostBySlug(rawSlug);
  return post?.slug ?? null;
}

export async function GET(_req: Request, { params }: Params) {
  let access;
  try {
    access = await requireActiveSession();
  } catch (error) {
    if (error instanceof AuthGuardError && error.code === 'UNAUTHENTICATED') {
      return NextResponse.json(null);
    }

    return toAuthErrorResponse(error) ?? NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }

  const { slug } = await params;
  const canonicalSlug = resolveCanonicalPostSlug(slug);

  if (!canonicalSlug) {
    return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
  }

  const interaction = await prisma.userPostInteraction.findUnique({
    where: {
      userId_postSlug: { userId: access.user.id, postSlug: canonicalSlug },
    },
    select: { isRead: true, note: true, isFavorite: true, isOnReadingList: true },
  });

  return NextResponse.json(
    interaction ?? { isRead: false, note: '', isFavorite: false, isOnReadingList: false },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}

export async function PATCH(req: Request, { params }: Params) {
  let access;
  try {
    access = await requireActiveSession();
  } catch (error) {
    return toAuthErrorResponse(error) ?? NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }

  const { slug } = await params;
  const canonicalSlug = resolveCanonicalPostSlug(slug);

  if (!canonicalSlug) {
    return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
  }

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
      userId_postSlug: { userId: access.user.id, postSlug: canonicalSlug },
    },
    create: { userId: access.user.id, postSlug: canonicalSlug, ...data },
    update: data,
    select: { isRead: true, note: true, isFavorite: true, isOnReadingList: true },
  });

  return NextResponse.json(interaction);
}
