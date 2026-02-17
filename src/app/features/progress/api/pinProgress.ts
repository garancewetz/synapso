import { prisma } from '@/app/lib/prisma';

type PinProgressParams = {
  progressId: number;
  userId: number;
};

export async function pinProgress(params: PinProgressParams) {
  const { progressId, userId } = params;

  const progress = await prisma.progress.findFirst({
    where: {
      id: progressId,
      userId: userId,
    },
  });

  if (!progress) {
    throw new Error('Progrès non trouvé');
  }

  const updatedProgress = await prisma.progress.update({
    where: { id: progressId },
    data: {
      pinned: !progress.pinned,
    },
  });

  return { pinned: updatedProgress.pinned };
}
