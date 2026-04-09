import { NextResponse } from 'next/server';
import { AuthGuardError, requireActiveSession, toAuthErrorResponse } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let access;
  try {
    access = await requireActiveSession();
  } catch (error) {
    if (error instanceof AuthGuardError && error.code === 'UNAUTHENTICATED') {
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    return toAuthErrorResponse(error) ?? NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }

  const interactions = await prisma.userPostInteraction.findMany({
    where: { userId: access.user.id },
    select: { postSlug: true, isRead: true, isFavorite: true, isOnReadingList: true },
  });

  return NextResponse.json(interactions, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
