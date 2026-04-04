import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null;

  return NextResponse.json(
    {
      status: 'ok',
      service: 'mazgin-nerway-blog',
      timestamp: now.toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      version: process.env.npm_package_version ?? 'unknown',
      commitSha,
      environment: process.env.NODE_ENV ?? 'unknown',
      siteUrl: SITE_URL,
      checks: {
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}

