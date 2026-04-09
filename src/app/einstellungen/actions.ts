'use server';

import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Nicht eingeloggt');
  }
  return session;
}

export async function updateDisplayNameAction(formData: FormData) {
  const session = await requireSession();
  const raw = formData.get('displayName');

  if (typeof raw !== 'string') {
    throw new Error('Ungültige Eingabe');
  }

  const displayName = raw.trim().slice(0, 50) || null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName },
  });

  revalidatePath('/einstellungen');
  revalidatePath('/mein-bereich');
}

export async function updateThemePreferenceAction(formData: FormData) {
  const session = await requireSession();
  const theme = formData.get('theme');

  const validThemes = ['dark', 'light'];
  const themePreference = typeof theme === 'string' && validThemes.includes(theme) ? theme : null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { themePreference },
  });

  revalidatePath('/einstellungen');
}

export async function deleteAccountAction(formData: FormData) {
  const session = await requireSession();
  const confirmEmail = formData.get('confirmEmail');

  if (typeof confirmEmail !== 'string' || !confirmEmail.trim()) {
    throw new Error('Bitte gib deine E-Mail-Adresse zur Bestätigung ein');
  }

  if (confirmEmail.trim().toLowerCase() !== session.user.email?.toLowerCase()) {
    throw new Error('E-Mail-Adresse stimmt nicht überein');
  }

  // Admins dürfen sich nicht selbst löschen
  if (session.user.role === Role.ADMIN) {
    throw new Error('Admin-Konten können nicht selbst gelöscht werden');
  }

  // Cascade Delete: Sessions, Accounts, UserPostInteractions werden automatisch gelöscht
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  await signOut({ redirectTo: '/' });
  redirect('/');
}
