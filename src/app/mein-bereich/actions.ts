'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveSession } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function removeFromReadingListAction(formData: FormData) {
  const access = await requireActiveSession();
  const essaySlug = formData.get('essaySlug');

  if (typeof essaySlug !== 'string' || !essaySlug.trim()) {
    throw new Error('Ungültiger Essay');
  }

  await prisma.userEssayInteraction.updateMany({
    where: { userId: access.user.id, essaySlug },
    data: { isOnReadingList: false },
  });

  revalidatePath('/mein-bereich');
}

export async function removeFavoriteAction(formData: FormData) {
  const access = await requireActiveSession();
  const essaySlug = formData.get('essaySlug');

  if (typeof essaySlug !== 'string' || !essaySlug.trim()) {
    throw new Error('Ungültiger Essay');
  }

  await prisma.userEssayInteraction.updateMany({
    where: { userId: access.user.id, essaySlug },
    data: { isFavorite: false },
  });

  revalidatePath('/mein-bereich');
}
