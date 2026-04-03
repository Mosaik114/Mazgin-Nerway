import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'kontakt@mazginnerway.de';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();

  // Server-seitige Validierung
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Nachricht zu lang.' }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: 'Kontaktformular <onboarding@resend.dev>',
    to: TO_EMAIL,
    replyTo: email,
    subject: `Neue Nachricht von ${name}`,
    text: `Name: ${name}\nE-Mail: ${email}\n\n${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <hr />
      <p style="white-space: pre-wrap">${message}</p>
    `,
  });

  if (error) {
    console.error('[contact] Resend error:', error);
    return NextResponse.json({ error: 'Nachricht konnte nicht gesendet werden.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
