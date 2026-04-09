'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Nicht eingeloggt');
  }
  return session;
}

export async function removeFromReadingListAction(formData: FormData) {
  const session = await requireSession();
  const postSlug = formData.get('postSlug');

  if (typeof postSlug !== 'string' || !postSlug.trim()) {
    throw new Error('Ungültiger Beitrag');
  }

  await prisma.userPostInteraction.updateMany({
    where: { userId: session.user.id, postSlug },
    data: { isOnReadingList: false },
  });

  revalidatePath('/mein-bereich');
}

export async function removeFavoriteAction(formData: FormData) {
  const session = await requireSession();
  const postSlug = formData.get('postSlug');

  if (typeof postSlug !== 'string' || !postSlug.trim()) {
    throw new Error('Ungültiger Beitrag');
  }

  await prisma.userPostInteraction.updateMany({
    where: { userId: session.user.id, postSlug },
    data: { isFavorite: false },
  });

  revalidatePath('/mein-bereich');
}

export async function clearBookmarkAction(formData: FormData) {
  const session = await requireSession();
  const postSlug = formData.get('postSlug');

  if (typeof postSlug !== 'string' || !postSlug.trim()) {
    throw new Error('Ungültiger Beitrag');
  }

  await prisma.userPostInteraction.updateMany({
    where: { userId: session.user.id, postSlug },
    data: { bookmarkPercent: null },
  });

  revalidatePath('/mein-bereich');
}
