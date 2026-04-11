import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { isValidEmail, SITE_URL } from '@/lib/config';
import { createRequestId, logEvent } from '@/lib/monitoring';

const isProduction = process.env.NODE_ENV === 'production';
const TO_EMAIL = (process.env.CONTACT_TO_EMAIL ?? '').trim()
  || (isProduction ? '' : 'nerway.a.mazgin@gmail.com');
const FROM_EMAIL = (process.env.CONTACT_FROM_EMAIL ?? '').trim()
  || (isProduction ? '' : 'Kontaktformular <onboarding@resend.dev>');
const RATE_LIMIT_WINDOW = Math.max(
  60_000,
  Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
);
const RATE_LIMIT_MAX = Math.max(1, Number(process.env.CONTACT_RATE_LIMIT_MAX ?? 3));
const RATE_LIMIT_SALT = (
  process.env.CONTACT_RATE_LIMIT_SALT
  ?? process.env.AUTH_SECRET
  ?? process.env.NEXTAUTH_SECRET
  ?? 'contact-rate-limit'
).trim();
const RATE_LIMIT_RETENTION_MS = Math.max(RATE_LIMIT_WINDOW * 12, 24 * 60 * 60 * 1000);
const RATE_LIMIT_CLEANUP_INTERVAL_MS = Math.max(RATE_LIMIT_WINDOW, 30 * 60 * 1000);
const BASE_ALLOWED_ORIGINS = new Set([SITE_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']);

const memoryRateLimitMap = new Map<string, { count: number; resetAt: number }>();
let lastMemoryCleanupAt = 0;
let lastDbCleanupAt = 0;
let warnedDbRateLimitFallback = false;

function withRequestIdHeaders(headers: HeadersInit | undefined, requestId: string): Headers {
  const nextHeaders = new Headers(headers);
  nextHeaders.set('x-request-id', requestId);
  return nextHeaders;
}

function jsonWithRequestId(
  body: Record<string, unknown>,
  requestId: string,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: withRequestIdHeaders(undefined, requestId),
  });
}

function cleanHeaderValue(value: string | null): string {
  return (value ?? '').trim();
}

function getClientIp(req: Request): string {
  const cfIp = cleanHeaderValue(req.headers.get('cf-connecting-ip'));
  if (cfIp) return cfIp.slice(0, 120);

  const realIp = cleanHeaderValue(req.headers.get('x-real-ip'));
  if (realIp) return realIp.slice(0, 120);

  const forwardedFor = cleanHeaderValue(req.headers.get('x-forwarded-for'));
  const firstForwarded = forwardedFor
    .split(',')
    .map((entry) => entry.trim())
    .find(Boolean);

  return (firstForwarded ?? 'unknown').slice(0, 120);
}

function isSameOriginRequest(req: Request): boolean {
  const origin = cleanHeaderValue(req.headers.get('origin'));

  if (!origin) {
    return !isProduction;
  }

  let requestOrigin = '';
  try {
    requestOrigin = new URL(req.url).origin;
  } catch {
    requestOrigin = '';
  }

  if (requestOrigin && origin === requestOrigin) {
    return true;
  }

  return BASE_ALLOWED_ORIGINS.has(origin);
}

function hashRateLimitValue(value: string): string {
  return crypto
    .createHash('sha256')
    .update(`${RATE_LIMIT_SALT}:${value}`)
    .digest('hex');
}

function buildRateLimitKeys(input: { ip: string; userAgent: string; email: string }): string[] {
  const ip = input.ip.toLowerCase();
  const userAgent = input.userAgent.toLowerCase();
  const email = input.email.toLowerCase();

  const keys = [
    `contact:ip:${hashRateLimitValue(ip)}`,
    `contact:ipua:${hashRateLimitValue(`${ip}|${userAgent || 'unknown'}`)}`,
  ];

  if (email && isValidEmail(email)) {
    keys.push(`contact:email:${hashRateLimitValue(email)}`);
  }

  return keys;
}

function cleanupMemoryRateLimitMap(now: number): void {
  if (now - lastMemoryCleanupAt < RATE_LIMIT_WINDOW) return;

  for (const [key, entry] of memoryRateLimitMap.entries()) {
    if (now > entry.resetAt) {
      memoryRateLimitMap.delete(key);
    }
  }

  lastMemoryCleanupAt = now;
}

function consumeMemoryRateLimit(keys: string[]): boolean {
  const now = Date.now();
  cleanupMemoryRateLimitMap(now);

  let limited = false;

  for (const key of keys) {
    const entry = memoryRateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
      memoryRateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      continue;
    }

    entry.count += 1;
    if (entry.count > RATE_LIMIT_MAX) {
      limited = true;
    }
  }

  return limited;
}

function isMissingRateLimitTableError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021';
}

async function maybeCleanupDbRateLimitBuckets(now: number): Promise<void> {
  if (now - lastDbCleanupAt < RATE_LIMIT_CLEANUP_INTERVAL_MS) {
    return;
  }

  lastDbCleanupAt = now;

  await prisma.contactRateLimitBucket.deleteMany({
    where: {
      updatedAt: {
        lt: new Date(now - RATE_LIMIT_RETENTION_MS),
      },
    },
  });
}

async function consumeDbRateLimit(keys: string[]): Promise<boolean> {
  const now = Date.now();
  const windowStartsAfter = now - RATE_LIMIT_WINDOW;
  const nowDate = new Date(now);
  let limited = false;

  await maybeCleanupDbRateLimitBuckets(now);

  await prisma.$transaction(async (tx) => {
    for (const key of keys) {
      const bucket = await tx.contactRateLimitBucket.findUnique({
        where: { key },
        select: { count: true, windowStartAt: true },
      });

      if (!bucket || bucket.windowStartAt.getTime() <= windowStartsAfter) {
        await tx.contactRateLimitBucket.upsert({
          where: { key },
          create: { key, count: 1, windowStartAt: nowDate },
          update: { count: 1, windowStartAt: nowDate },
        });
        continue;
      }

      const nextCount = bucket.count + 1;
      await tx.contactRateLimitBucket.update({
        where: { key },
        data: {
          count: {
            increment: 1,
          },
        },
      });

      if (nextCount > RATE_LIMIT_MAX) {
        limited = true;
      }
    }
  });

  return limited;
}

// Rate limiting: tries DB-backed buckets first (persistent across deploys).
// Falls back to in-memory map if the DB table is missing or unreachable.
async function isRateLimited(keys: string[], requestId: string): Promise<boolean> {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));

  if (uniqueKeys.length === 0) {
    return false;
  }

  try {
    return await consumeDbRateLimit(uniqueKeys);
  } catch (error) {
    if (!warnedDbRateLimitFallback || !isMissingRateLimitTableError(error)) {
      warnedDbRateLimitFallback = true;
      logEvent('warn', 'contact.rate_limit_fallback_memory', {
        requestId,
        error,
      });
    }

    return consumeMemoryRateLimit(uniqueKeys);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeSingleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeMessage(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

function parseBody(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  return payload as Record<string, unknown>;
}

export async function POST(req: Request) {
  const requestId = createRequestId(req.headers.get('x-request-id'));
  const ip = getClientIp(req);

  if (!isSameOriginRequest(req)) {
    logEvent('warn', 'contact.origin_blocked', { requestId, ip, origin: req.headers.get('origin') });
    return jsonWithRequestId({ error: 'Ungueltige Herkunft der Anfrage.' }, requestId, 403);
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    logEvent('warn', 'contact.invalid_content_type', { requestId, ip, contentType });
    return jsonWithRequestId({ error: 'Ungueltiger Content-Type.' }, requestId, 415);
  }

  const body = parseBody(await req.json().catch(() => null));

  if (!body) {
    return jsonWithRequestId({ error: 'Ungueltige Anfrage.' }, requestId, 400);
  }

  const website = normalizeSingleLine(String(body.website ?? ''));
  if (website) {
    logEvent('info', 'contact.honeypot_triggered', { requestId, ip });
    return jsonWithRequestId({ ok: true }, requestId);
  }

  const name = normalizeSingleLine(String(body.name ?? ''));
  const email = normalizeSingleLine(String(body.email ?? '')).toLowerCase();
  const message = normalizeMessage(String(body.message ?? ''));
  const userAgent = cleanHeaderValue(req.headers.get('user-agent')).slice(0, 512);

  const rateLimitKeys = buildRateLimitKeys({ ip, userAgent, email });
  if (await isRateLimited(rateLimitKeys, requestId)) {
    logEvent('warn', 'contact.rate_limited', {
      requestId,
      ip,
      keyCount: rateLimitKeys.length,
    });
    return jsonWithRequestId(
      { error: 'Zu viele Anfragen. Bitte versuche es spaeter erneut.' },
      requestId,
      429,
    );
  }

  if (name.length < 2 || name.length > 80) {
    return jsonWithRequestId({ error: 'Bitte gib einen gueltigen Namen ein.' }, requestId, 400);
  }

  if (!email || email.length > 254 || !isValidEmail(email)) {
    return jsonWithRequestId({ error: 'Ungueltige E-Mail-Adresse.' }, requestId, 400);
  }

  if (message.length < 10) {
    return jsonWithRequestId({ error: 'Bitte schreibe eine etwas laengere Nachricht.' }, requestId, 400);
  }

  if (message.length > 5000) {
    return jsonWithRequestId({ error: 'Nachricht zu lang.' }, requestId, 400);
  }

  if (!TO_EMAIL || !FROM_EMAIL) {
    logEvent('error', 'contact.missing_mail_routing_config', {
      requestId,
      hasToEmail: Boolean(TO_EMAIL),
      hasFromEmail: Boolean(FROM_EMAIL),
    });
    return jsonWithRequestId(
      { error: 'Kontakt-E-Mail ist nicht vollstaendig konfiguriert.' },
      requestId,
      503,
    );
  }

  if (!process.env.RESEND_API_KEY) {
    logEvent('error', 'contact.missing_resend_key', { requestId });
    return jsonWithRequestId({ error: 'E-Mail-Dienst ist nicht konfiguriert.' }, requestId, 503);
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Neue Nachricht von ${name}`,
      text: `Name: ${name}\nE-Mail: ${email}\nIP: ${ip}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-Mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>IP:</strong> ${escapeHtml(ip)}</p>
        <hr />
        <p style="white-space: pre-wrap">${escapeHtml(message)}</p>
      `,
    });

    if (error) {
      logEvent('error', 'contact.resend_error', { requestId, error });
      return jsonWithRequestId({ error: 'Nachricht konnte nicht gesendet werden.' }, requestId, 500);
    }

    logEvent('info', 'contact.sent', {
      requestId,
      ip,
      nameLength: name.length,
      messageLength: message.length,
    });

    return jsonWithRequestId({ ok: true }, requestId);
  } catch (error) {
    logEvent('error', 'contact.unhandled_error', { requestId, error });
    return jsonWithRequestId({ error: 'Nachricht konnte nicht gesendet werden.' }, requestId, 500);
  }
}
