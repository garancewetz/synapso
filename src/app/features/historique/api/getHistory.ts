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

export type FormattedHistoryEntry = {
  id: number;
  completedAt: Date;
  exercice: {
    id: number;
    name: string;
    category: ExerciceCategory;
    description: { text: string; comment: string | null };
    workout: {
      repeat: string | null;
      series: string | null;
      duration: string | null;
    };
    equipments: string[];
    bodyparts: Array<{ id: number; name: string }>;
  };
};

function parseEquipments(equipments: string): string[] {
  try {
    const parsed = JSON.parse(equipments || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function formatHistoryForApi(history: HistoryEntry[]): FormattedHistoryEntry[] {
  return history.map((entry) => ({
    id: entry.id,
    completedAt: entry.completedAt,
    exercice: {
      id: entry.exercice.id,
      name: entry.exercice.name,
      category: entry.exercice.category,
      description: {
        text: entry.exercice.descriptionText,
        comment: entry.exercice.descriptionComment,
      },
      workout: {
        repeat: entry.exercice.workoutRepeat,
        series: entry.exercice.workoutSeries,
        duration: entry.exercice.workoutDuration,
      },
      equipments: parseEquipments(entry.exercice.equipments),
      bodyparts: entry.exercice.bodyparts.map((eb) => ({
        id: eb.bodypart.id,
        name: eb.bodypart.name,
      })),
    },
  }));
}
