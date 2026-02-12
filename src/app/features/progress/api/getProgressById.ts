import { prisma } from '@/app/lib/prisma';

type GetProgressByIdParams = {
  progressId: number;
  userId: number;
};

export async function getProgressById(params: GetProgressByIdParams) {
  const { progressId, userId } = params;

  const progress = await prisma.progress.findFirst({
    where: {
      id: progressId,
      userId: userId,
    },
  });

  if (!progress) {
    throw new Error('Progress not found');
  }

  return progress;
}
