import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  return NextResponse.json(
    { user: session?.user ?? null },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
