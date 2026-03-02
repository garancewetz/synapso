import { prisma } from '@/app/lib/prisma';
import { ExerciceCategory } from '@/app/types/exercice';
import { Prisma } from '@prisma/client';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';

type ArchiveExerciceParams = {
  exerciceId: number;
  userId: number;
  archived: boolean;
  resetFrequency: 'DAILY' | 'WEEKLY';
};

export async function archiveExercice(params: ArchiveExerciceParams) {
  const { exerciceId, userId, archived, resetFrequency } = params;

  const existingExercice = await prisma.exercice.findFirst({
    where: {
      id: exerciceId,
      userId: userId,
    },
  });

  if (!existingExercice) {
    throw new Error('Exercice non trouvé');
  }

  const now = new Date();
  const startOfPeriod = getStartOfPeriod(resetFrequency, now);
  const endOfPeriod = addDays(startOfPeriod, resetFrequency === 'DAILY' ? 1 : 7);
  const startOfToday = startOfDay(now);
  const endOfToday = startOfDay(addDays(now, 1));

  const updated = await prisma.exercice.update({
    where: { id: exerciceId },
    data: {
      archived,
      archivedAt: archived ? new Date() : null,
    } as Prisma.ExerciceUpdateInput,
  });

  const exerciceBodyparts = await prisma.exerciceBodypart.findMany({
    where: { exerciceId: exerciceId },
    include: {
      bodypart: true,
    },
  });

  const history = await prisma.history.findMany({
    where: {
      exerciceId: exerciceId,
      completedAt: {
        gte: startOfPeriod,
        lt: endOfPeriod,
      },
    },
    orderBy: {
      completedAt: 'asc',
    },
  });

  let equipmentsParsed: string[] = [];
  try {
    equipmentsParsed = JSON.parse(updated.equipments || '[]');
  } catch {
    equipmentsParsed = [];
  }

  const bodypartsNames = exerciceBodyparts.map((eb) => eb.bodypart.name);
  const weeklyCompletions = history.map((h) => h.completedAt);
  const completedInPeriod = weeklyCompletions.length > 0;
  const hasTodayHistory = history.some(
    (h) => h.completedAt >= startOfToday && h.completedAt < endOfToday
  );
  const completedToday = hasTodayHistory;

  return {
    id: updated.id,
    name: updated.name,
    description: {
      text: updated.descriptionText,
      comment: updated.descriptionComment,
    },
    workout: {
      repeat: updated.workoutRepeat,
      series: updated.workoutSeries,
      duration: updated.workoutDuration,
    },
    equipments: equipmentsParsed,
    bodyparts: bodypartsNames,
    category: updated.category as ExerciceCategory,
    completed: completedInPeriod,
    completedToday: completedToday,
    completedAt: updated.completedAt,
    pinned: updated.pinned ?? false,
    weeklyCompletions: weeklyCompletions,
    media: updated.media ?? null,
    archived: (updated as { archived?: boolean }).archived ?? false,
    archivedAt: (updated as { archivedAt?: Date | null }).archivedAt ?? null,
  };
}
