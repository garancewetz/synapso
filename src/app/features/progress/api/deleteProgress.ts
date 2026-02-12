import { prisma } from '@/app/lib/prisma';

type DeleteProgressParams = {
  progressId: number;
  userId: number;
};

export async function deleteProgress(params: DeleteProgressParams) {
  const { progressId, userId } = params;

  const existingProgress = await prisma.progress.findFirst({
    where: {
      id: progressId,
      userId: userId,
    },
  });

  if (!existingProgress) {
    throw new Error('Progress not found');
  }

  await prisma.progress.delete({
    where: { id: progressId },
  });
}
