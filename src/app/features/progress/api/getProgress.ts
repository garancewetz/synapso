import { prisma } from '@/app/lib/prisma';

type GetProgressParams = {
  userId: number;
  limit?: number;
};

export async function getProgress(params: GetProgressParams) {
  const { userId, limit } = params;

  const progressList = await prisma.progress.findMany({
    where: {
      userId: userId,
    },
    orderBy: { createdAt: 'desc' },
    ...(limit && { take: limit }),
  });

  return progressList;
}
