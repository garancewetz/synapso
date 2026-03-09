import { prisma } from '@/app/lib/prisma';

type GetProgressParams = {
  userId: number;
  limit?: number;
  skip?: number;
};

export async function getProgress(params: GetProgressParams) {
  const { userId, limit, skip } = params;

  const progressList = await prisma.progress.findMany({
    where: {
      userId: userId,
    },
    orderBy: { createdAt: 'desc' },
    ...(limit && { take: limit }),
    ...(skip !== undefined && skip > 0 && { skip }),
  });

  return progressList;
}
