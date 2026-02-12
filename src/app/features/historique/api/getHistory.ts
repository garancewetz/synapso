import { prisma } from '@/app/lib/prisma';
import type { ExerciceCategory } from '@/app/types/exercice';

interface HistoryEntry {
  id: number;
  completedAt: Date;
  exercice: {
    id: number;
    name: string;
    category: ExerciceCategory;
    descriptionText: string;
    descriptionComment: string | null;
    workoutRepeat: string | null;
    workoutSeries: string | null;
    workoutDuration: string | null;
    equipments: string;
    userId: number;
    bodyparts: Array<{
      exerciceId: number;
      bodypartId: number;
      bodypart: {
        id: number;
        name: string;
      };
    }>;
  };
}

type GetHistoryParams = {
  userId: number;
  since?: Date;
  limit?: number;
};

export async function getHistory(params: GetHistoryParams): Promise<HistoryEntry[]> {
  const { userId, since, limit } = params;

  const whereClause: {
    exercice: {
      userId: number;
    };
    completedAt?: {
      gte: Date;
    };
  } = {
    exercice: {
      userId: userId,
    },
  };

  if (since) {
    whereClause.completedAt = {
      gte: since,
    };
  }

  const history = await prisma.history.findMany({
    where: whereClause,
    include: {
      exercice: {
        include: {
          bodyparts: {
            include: {
              bodypart: true,
            },
          },
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
    ...(limit && { take: limit }),
  });

  return history as HistoryEntry[];
}
