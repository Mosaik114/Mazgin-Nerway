'use server';

import { revalidatePath } from 'next/cache';
import { requireActiveSession } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function removeFromReadingListAction(formData: FormData) {
  const access = await requireActiveSession();
  const postSlug = formData.get('postSlug');

  if (typeof postSlug !== 'string' || !postSlug.trim()) {
    throw new Error('Ungueltiger Beitrag');
  }

  await prisma.userPostInteraction.updateMany({
    where: { userId: access.user.id, postSlug },
    data: { isOnReadingList: false },
  });

  revalidatePath('/mein-bereich');
}

export async function removeFavoriteAction(formData: FormData) {
  const access = await requireActiveSession();
  const postSlug = formData.get('postSlug');

  if (typeof postSlug !== 'string' || !postSlug.trim()) {
    throw new Error('Ungueltiger Beitrag');
  }

  await prisma.userPostInteraction.updateMany({
    where: { userId: access.user.id, postSlug },
    data: { isFavorite: false },
  });

  revalidatePath('/mein-bereich');
}
