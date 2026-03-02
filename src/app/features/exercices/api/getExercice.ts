import { prisma } from '@/app/lib/prisma';
import { ExerciceCategory } from '@/app/types/exercice';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';
import { getDateKey, getDateKeyUTC } from '@/app/utils/date.utils';

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
    throw new Error('Exercice non trouvé');
  }

  const acceptedShare = await prisma.sharedExercice.findFirst({
    where: {
      exerciceId: exercice.id,
      receiverId: userId,
      status: 'ACCEPTED',
    },
    select: { sender: { select: { id: true, name: true } } },
  });

  let equipmentsParsed: string[] = [];
  try {
    equipmentsParsed = JSON.parse(exercice.equipments || '[]');
  } catch {
    equipmentsParsed = [];
  }

  const weeklyCompletions = exercice.history.map(h => h.completedAt);
  const completedInPeriod = weeklyCompletions.length > 0;

  const targetDateKeyUTC = getDateKeyUTC(now) ?? getDateKey(now);
  const hasTargetDayHistory = targetDateKeyUTC && exercice.history.some(
    (h) => {
      const completedDateKeyUTC = getDateKeyUTC(h.completedAt);
      return completedDateKeyUTC === targetDateKeyUTC;
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
    sharedBy: acceptedShare
    ? { id: acceptedShare.sender.id, name: acceptedShare.sender.name }
    : undefined,
  };
}
