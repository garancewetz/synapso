import { prisma } from '@/app/lib/prisma';
import { startOfDay, addDays } from 'date-fns';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';

type CompleteExerciceParams = {
  exerciceId: number;
  userId: number;
  completedAt?: Date;
};

async function getWeeklyCompletionsForExercice(
  exerciceId: number,
  referenceDate: Date
): Promise<Date[]> {
  const startOfWeekDate = getStartOfPeriod('WEEKLY', referenceDate);
  const endOfWeekDate = startOfDay(addDays(startOfWeekDate, 7));

  const history = await prisma.history.findMany({
    where: {
      exerciceId,
      completedAt: { gte: startOfWeekDate, lt: endOfWeekDate },
    },
    select: { completedAt: true },
    orderBy: { completedAt: 'asc' },
  });

  return history.map((h) => h.completedAt);
}

export async function completeExercice(params: CompleteExerciceParams) {
  const { exerciceId, userId, completedAt = new Date() } = params;

  const exercice = await prisma.exercice.findFirst({
    where: { id: exerciceId, userId },
    select: { id: true },
  });

  if (!exercice) {
    throw new Error('Exercice non trouvé');
  }

  const targetDate = startOfDay(completedAt);
  const endOfTargetDate = startOfDay(addDays(completedAt, 1));

  const deleted = await prisma.history.deleteMany({
    where: {
      exerciceId,
      completedAt: { gte: targetDate, lt: endOfTargetDate },
    },
  });

  if (deleted.count > 0) {
    const lastHistory = await prisma.history.findFirst({
      where: { exerciceId },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    await prisma.exercice.update({
      where: { id: exerciceId },
      data: {
        completed: !!lastHistory,
        completedAt: lastHistory?.completedAt || null,
      },
    });

    const weeklyCompletions = await getWeeklyCompletionsForExercice(
      exerciceId,
      completedAt
    );

    return {
      completed: !!lastHistory,
      completedToday: false,
      completedAt: lastHistory?.completedAt || null,
      weeklyCompletions,
    };
  } else {
    await Promise.all([
      prisma.history.create({
        data: { exerciceId, completedAt },
      }),
      prisma.exercice.update({
        where: { id: exerciceId },
        data: {
          completed: true,
          completedAt,
        },
      }),
    ]);

    const weeklyCompletions = await getWeeklyCompletionsForExercice(
      exerciceId,
      completedAt
    );

    return {
      completed: true,
      completedToday: true,
      completedAt,
      weeklyCompletions,
    };
  }
}
