import { prisma } from '@/app/lib/prisma';
import { ExerciceCategory } from '@/app/types/exercice';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay, format } from 'date-fns';

type GetExerciceParams = {
  exerciceId: number;
  userId: number;
  resetFrequency: 'DAILY' | 'WEEKLY';
  targetDate?: Date;
};

export async function getExercice(params: GetExerciceParams) {
  const { exerciceId, userId, resetFrequency, targetDate = new Date() } = params;

  const now = startOfDay(targetDate);
  const startOfPeriod = getStartOfPeriod(resetFrequency, now);
  const endOfPeriod = resetFrequency === 'DAILY'
    ? startOfDay(addDays(now, 1))
    : startOfDay(addDays(startOfPeriod, 7));

  const exercice = await prisma.exercice.findFirst({
    where: {
      id: exerciceId,
      userId: userId,
    },
    include: {
      bodyparts: {
        include: {
          bodypart: true,
        },
      },
      history: {
        where: {
          completedAt: {
            gte: startOfPeriod,
            lt: endOfPeriod,
          },
        },
        orderBy: {
          completedAt: 'asc',
        },
      },
    },
  });

  if (!exercice) {
    throw new Error('Exercice not found');
  }

  let equipmentsParsed: string[] = [];
  try {
    equipmentsParsed = JSON.parse(exercice.equipments || '[]');
  } catch {
    equipmentsParsed = [];
  }

  const weeklyCompletions = exercice.history.map(h => h.completedAt);
  const completedInPeriod = weeklyCompletions.length > 0;

  const targetDateKey = format(startOfDay(now), 'yyyy-MM-dd');
  const hasTargetDayHistory = exercice.history.some(
    (h) => {
      const completedDate = h.completedAt instanceof Date ? h.completedAt : new Date(h.completedAt);
      const completedDateKey = format(startOfDay(completedDate), 'yyyy-MM-dd');
      return completedDateKey === targetDateKey;
    }
  );
  const completedToday = hasTargetDayHistory;

  const mediaParsed = exercice.media ?? null;

  return {
    id: exercice.id,
    name: exercice.name,
    description: {
      text: exercice.descriptionText,
      comment: exercice.descriptionComment,
    },
    workout: {
      repeat: exercice.workoutRepeat,
      series: exercice.workoutSeries,
      duration: exercice.workoutDuration,
    },
    equipments: equipmentsParsed,
    bodyparts: exercice.bodyparts.map(eb => eb.bodypart.name),
    category: exercice.category as ExerciceCategory,
    completed: completedInPeriod,
    completedToday: completedToday,
    completedAt: exercice.completedAt,
    pinned: exercice.pinned,
    weeklyCompletions: weeklyCompletions,
    media: mediaParsed,
    archived: exercice.archived ?? false,
    archivedAt: exercice.archivedAt,
  };
}
