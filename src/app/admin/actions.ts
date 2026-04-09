'use server';

import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireActiveAdminSession } from '@/lib/auth-guard';
import { isAdminEmail } from '@/lib/auth-policy';
import { prisma } from '@/lib/prisma';

function parseUserId(formData: FormData): string {
  const userId = formData.get('userId');

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Ungültige Nutzer-ID');
  }

  return userId;
}

export async function setUserRoleAction(formData: FormData) {
  const access = await requireActiveAdminSession();
  const userId = parseUserId(formData);
  const roleValue = formData.get('role');

  if (roleValue !== Role.USER && roleValue !== Role.ADMIN) {
    throw new Error('Ungültige Rolle');
  }

  if (access.user.id === userId && roleValue !== Role.ADMIN) {
    return;
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!targetUser) {
    throw new Error('Nutzer nicht gefunden');
  }

  const policyRole = isAdminEmail(targetUser.email) ? Role.ADMIN : Role.USER;
  if (roleValue !== policyRole) {
    throw new Error('Admin-Rollen werden strikt ueber ADMIN_EMAILS gesteuert');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: policyRole },
  });

  revalidatePath('/admin');
}

export async function toggleUserBlockAction(formData: FormData) {
  const access = await requireActiveAdminSession();
  const userId = parseUserId(formData);
  const blockedValue = formData.get('blocked');

  if (blockedValue !== 'true' && blockedValue !== 'false') {
    throw new Error('Ungültiger Sperrstatus');
  }

  const shouldBlock = blockedValue === 'true';

  if (access.user.id === userId && shouldBlock) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { isBlocked: shouldBlock },
    });

    if (shouldBlock) {
      await tx.session.deleteMany({
        where: { userId },
      });
    }
  });

  revalidatePath('/admin');
}
