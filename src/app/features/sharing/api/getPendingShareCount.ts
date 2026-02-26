import { prisma } from '@/app/lib/prisma';

export async function getPendingShareCount(receiverId: number): Promise<number> {
  return prisma.sharedExercice.count({
    where: {
      receiverId,
      status: 'PENDING',
    },
  });
}
