import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { SITE_URL } from '@/lib/config';
import { createRequestId, logEvent } from '@/lib/monitoring';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'nerway.a.mazgin@gmail.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'Kontaktformular <onboarding@resend.dev>';

const RATE_LIMIT_WINDOW = Math.max(
  60_000,
  Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
);
const RATE_LIMIT_MAX = Math.max(1, Number(process.env.CONTACT_RATE_LIMIT_MAX ?? 3));

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let lastCleanupAt = 0;

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

function cleanupRateLimitMap(now: number): void {
  if (now - lastCleanupAt < RATE_LIMIT_WINDOW) return;

  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }

  lastCleanupAt = now;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  cleanupRateLimitMap(now);

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0];
  const rawIp = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? forwarded ?? 'unknown';
  return rawIp.trim().slice(0, 120) || 'unknown';
}

function isSameOriginRequest(req: Request): boolean {
  const origin = req.headers.get('origin');

  if (!origin) {
    return true;
  }

  const allowedOrigins = new Set([SITE_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']);
  return allowedOrigins.has(origin);
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    return jsonWithRequestId({ error: 'Ungültige Herkunft der Anfrage.' }, requestId, 403);
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    logEvent('warn', 'contact.invalid_content_type', { requestId, ip, contentType });
    return jsonWithRequestId({ error: 'Ungültiger Content-Type.' }, requestId, 415);
  }

  if (isRateLimited(ip)) {
    logEvent('warn', 'contact.rate_limited', { requestId, ip });
    return jsonWithRequestId(
      { error: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
      requestId,
      429,
    );
  }

  const body = parseBody(await req.json().catch(() => null));

  if (!body) {
    return jsonWithRequestId({ error: 'Ungültige Anfrage.' }, requestId, 400);
  }

  const website = normalizeSingleLine(String(body.website ?? ''));
  if (website) {
    logEvent('info', 'contact.honeypot_triggered', { requestId, ip });
    return jsonWithRequestId({ ok: true }, requestId);
  }

  const name = normalizeSingleLine(String(body.name ?? ''));
  const email = normalizeSingleLine(String(body.email ?? '')).toLowerCase();
  const message = normalizeMessage(String(body.message ?? ''));

  if (name.length < 2 || name.length > 80) {
    return jsonWithRequestId({ error: 'Bitte gib einen gültigen Namen ein.' }, requestId, 400);
  }

  if (!email || email.length > 254 || !isValidEmail(email)) {
    return jsonWithRequestId({ error: 'Ungültige E-Mail-Adresse.' }, requestId, 400);
  }

  if (message.length < 10) {
    return jsonWithRequestId({ error: 'Bitte schreibe eine etwas längere Nachricht.' }, requestId, 400);
  }

  if (message.length > 5000) {
    return jsonWithRequestId({ error: 'Nachricht zu lang.' }, requestId, 400);
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