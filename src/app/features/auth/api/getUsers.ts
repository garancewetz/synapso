import { prisma } from '@/app/lib/prisma';

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      role: true,
      resetFrequency: true,
      dominantHand: true,
      hasJournal: true,
      createdAt: true,
    },
  });

  return users;
}
