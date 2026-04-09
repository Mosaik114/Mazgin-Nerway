'use server';

import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signOut } from '@/auth';
import { FRESH_LOGIN_WINDOW_MS, isFreshLogin, requireActiveSession } from '@/lib/auth-guard';
import { buildSignInPath } from '@/lib/auth-redirect';
import { isAdminEmail } from '@/lib/auth-policy';
import { prisma } from '@/lib/prisma';

export async function updateDisplayNameAction(formData: FormData) {
  const access = await requireActiveSession();
  const raw = formData.get('displayName');

  if (typeof raw !== 'string') {
    throw new Error('Ungueltige Eingabe');
  }

  const displayName = raw.trim().slice(0, 50) || null;

  await prisma.user.update({
    where: { id: access.user.id },
    data: { displayName },
  });

  revalidatePath('/einstellungen');
  revalidatePath('/mein-bereich');
}

export async function updateThemePreferenceAction(formData: FormData) {
  const access = await requireActiveSession();
  const theme = formData.get('theme');

  const validThemes = ['dark', 'light'];
  const themePreference = typeof theme === 'string' && validThemes.includes(theme) ? theme : null;

  await prisma.user.update({
    where: { id: access.user.id },
    data: { themePreference },
  });

  revalidatePath('/einstellungen');
}

export async function deleteAccountAction(formData: FormData) {
  const access = await requireActiveSession();
  const confirmEmail = formData.get('confirmEmail');

  if (!isFreshLogin(access.user.lastLoginAt, new Date(), FRESH_LOGIN_WINDOW_MS)) {
    redirect(buildSignInPath('/einstellungen?reauth=1'));
  }

  if (typeof confirmEmail !== 'string' || !confirmEmail.trim()) {
    throw new Error('Bitte gib deine E-Mail-Adresse zur Bestaetigung ein');
  }

  if (confirmEmail.trim().toLowerCase() !== access.user.email?.toLowerCase()) {
    throw new Error('E-Mail-Adresse stimmt nicht ueberein');
  }

  if (access.user.role === Role.ADMIN || isAdminEmail(access.user.email)) {
    throw new Error('Admin-Konten koennen nicht selbst geloescht werden');
  }

  await prisma.user.delete({
    where: { id: access.user.id },
  });

  await signOut({ redirectTo: '/' });
  redirect('/');
}
