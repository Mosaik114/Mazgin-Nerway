import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

const HEALTHCHECK_TOKEN = (process.env.HEALTHCHECK_TOKEN ?? '').trim();

function canReadHealthDetails(req: Request): boolean {
  if (!HEALTHCHECK_TOKEN) {
    return false;
  }

  const headerToken = (req.headers.get('x-health-token') ?? '').trim();
  return headerToken === HEALTHCHECK_TOKEN;
}

export async function GET(req: Request) {
  const now = new Date();
  const publicPayload = {
    status: 'ok',
    service: 'mizgin-nerway',
    timestamp: now.toISOString(),
  };

  if (!canReadHealthDetails(req)) {
    return NextResponse.json(publicPayload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  const detailedPayload = {
    ...publicPayload,
    uptimeSeconds: Math.round(process.uptime()),
    version: process.env.npm_package_version ?? 'unknown',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null,
    environment: process.env.NODE_ENV ?? 'unknown',
    siteUrl: SITE_URL,
    checks: {
      resendConfigured: Boolean(process.env.RESEND_API_KEY),
    },
  };

  return NextResponse.json(
    detailedPayload,
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
