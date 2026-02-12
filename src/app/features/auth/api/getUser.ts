import { prisma } from '@/app/lib/prisma';

type GetUserParams = {
  userId: number;
};

export async function getUser(params: GetUserParams) {
  const { userId } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  return user;
}
