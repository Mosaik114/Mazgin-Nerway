'use server';

import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireAdminSession() {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    throw new Error('Nicht autorisiert');
  }

  return session;
}

function parseUserId(formData: FormData): string {
  const userId = formData.get('userId');

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Ungültige Nutzer-ID');
  }

  return userId;
}

export async function setUserRoleAction(formData: FormData) {
  const session = await requireAdminSession();
  const userId = parseUserId(formData);
  const roleValue = formData.get('role');

  if (roleValue !== Role.USER && roleValue !== Role.ADMIN) {
    throw new Error('Ungültige Rolle');
  }

  if (session.user.id === userId && roleValue !== Role.ADMIN) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: roleValue },
  });

  revalidatePath('/admin');
}

export async function toggleUserBlockAction(formData: FormData) {
  const session = await requireAdminSession();
  const userId = parseUserId(formData);
  const blockedValue = formData.get('blocked');

  if (blockedValue !== 'true' && blockedValue !== 'false') {
    throw new Error('Ungültiger Sperrstatus');
  }

  const shouldBlock = blockedValue === 'true';

  if (session.user.id === userId && shouldBlock) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: shouldBlock },
  });

  revalidatePath('/admin');
}
