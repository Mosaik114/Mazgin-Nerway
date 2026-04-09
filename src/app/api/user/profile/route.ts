import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, themePreference: true },
  });

  return NextResponse.json(user ?? { displayName: null, themePreference: null }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.displayName === 'string') {
    data.displayName = body.displayName.trim().slice(0, 50) || null;
  }
  if (body.displayName === null) {
    data.displayName = null;
  }
  if (typeof body.themePreference === 'string' && ['dark', 'light'].includes(body.themePreference)) {
    data.themePreference = body.themePreference;
  }
  if (body.themePreference === null) {
    data.themePreference = null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Keine gültigen Felder' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { displayName: true, themePreference: true },
  });

  return NextResponse.json(user);
}
