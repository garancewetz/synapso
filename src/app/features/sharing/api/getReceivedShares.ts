import { prisma } from '@/app/lib/prisma';
import type { MediaData } from '@/app/types/exercice';

/**
 * Returns received shares for a user (PENDING only).
 */
export async function getReceivedShares(receiverId: number) {
  const shares = await prisma.sharedExercice.findMany({
    where: {
      receiverId,
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true } },
      exercice: {
        select: {
          id: true,
          name: true,
          descriptionText: true,
          category: true,
          workoutRepeat: true,
          workoutSeries: true,
          workoutDuration: true,
          equipments: true,
          media: true,
        },
      },
    },
  });

  return shares.map(share => ({
    id: share.id,
    createdAt: share.createdAt,
    sender: share.sender,
    exercice: share.exercice
      ? {
          id: share.exercice.id,
          name: share.exercice.name,
          description: share.exercice.descriptionText,
          category: share.exercice.category,
          workout: {
            repeat: share.exercice.workoutRepeat,
            series: share.exercice.workoutSeries,
            duration: share.exercice.workoutDuration,
          },
          equipments: (() => {
            try { return JSON.parse(share.exercice.equipments || '[]'); }
            catch { return []; }
          })(),
          media: (share.exercice.media ?? null) as MediaData | null,
        }
      : null,
  }));
}
