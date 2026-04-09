import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }

  const interactions = await prisma.userPostInteraction.findMany({
    where: { userId: session.user.id },
    select: { postSlug: true, isRead: true, isFavorite: true, isOnReadingList: true },
  });

  return NextResponse.json(interactions, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
