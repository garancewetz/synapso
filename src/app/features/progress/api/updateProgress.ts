import { prisma } from '@/app/lib/prisma';

type UpdateProgressData = {
  content?: string;
  emoji?: string | null;
  tags?: string[];
  medias?: string[];
};

type UpdateProgressParams = {
  progressId: number;
  userId: number;
  data: UpdateProgressData;
};

export async function updateProgress(params: UpdateProgressParams) {
  const { progressId, userId, data } = params;

  const existingProgress = await prisma.progress.findFirst({
    where: {
      id: progressId,
      userId: userId,
    },
  });

  if (!existingProgress) {
    throw new Error('Progress not found');
  }

  const progress = await prisma.progress.update({
    where: { id: progressId },
    data: {
      content: data.content,
      emoji: data.emoji !== undefined ? data.emoji : undefined,
      tags: data.tags,
      medias: data.medias,
    },
  });

  return progress;
}
