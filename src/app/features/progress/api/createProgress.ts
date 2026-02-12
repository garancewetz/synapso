import { prisma } from '@/app/lib/prisma';

type CreateProgressData = {
  content: string;
  emoji?: string | null;
  tags: string[];
  medias: string[];
  userId: number;
};

export async function createProgress(data: CreateProgressData) {
  const progress = await prisma.progress.create({
    data: {
      content: data.content,
      emoji: data.emoji || null,
      tags: data.tags,
      medias: data.medias,
      userId: data.userId,
    },
  });

  return progress;
}
