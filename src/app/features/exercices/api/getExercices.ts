import { prisma } from '@/app/lib/prisma';
import { ExerciceCategory } from '@/app/types/exercice';
import { ExerciceCategory as PrismaExerciceCategory } from '@prisma/client';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';
import { getDateKey } from '@/app/utils/date.utils';

type GetExercicesParams = {
  userId: number;
  category?: ExerciceCategory | null;
  equipments?: string[];
  includeArchived?: boolean;
  targetDate?: string;
  resetFrequency: 'DAILY' | 'WEEKLY';
};

export async function getExercices(params: GetExercicesParams) {
  const {
    userId,
    category,
    equipments = [],
    includeArchived = false,
    targetDate,
    resetFrequency,
  } = params;

  const todayKey = getDateKey(new Date());
  const targetDateObj = targetDate
    ? new Date(targetDate + 'T12:00:00.000Z')
    : (todayKey ? new Date(todayKey + 'T12:00:00.000Z') : new Date());

  const startOfPeriod = getStartOfPeriod(resetFrequency, targetDateObj);
  const endOfPeriod = resetFrequency === 'DAILY'
    ? startOfDay(addDays(targetDateObj, 1))
    : startOfDay(addDays(startOfPeriod, 7));

  const whereClause: {
    userId: number;
    category?: PrismaExerciceCategory;
    archived?: boolean;
  } = {
    userId: userId,
  };

  if (category && ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(category)) {
    whereClause.category = category as PrismaExerciceCategory;
  }

  if (!includeArchived) {
    whereClause.archived = false;
  }

  const exercices = await prisma.exercice.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      descriptionText: true,
      descriptionComment: true,
      workoutRepeat: true,
      workoutSeries: true,
      workoutDuration: true,
      equipments: true,
      category: true,
      completedAt: true,
      pinned: true,
      media: true,
      archived: true,
      archivedAt: true,
      bodyparts: {
        select: {
          bodypart: {
            select: {
              name: true,
            },
          },
        },
      },
      history: {
        where: {
          completedAt: {
            gte: startOfPeriod,
            lt: endOfPeriod,
          },
        },
        select: {
          completedAt: true,
        },
        orderBy: {
          completedAt: 'asc',
        },
      },
    },
    orderBy: [
      { pinned: 'desc' },
      { id: 'desc' },
    ],
  });

  const targetDateKeyForComparison = getDateKey(targetDateObj);

  const exerciceIds = exercices.map((e) => e.id);
  const acceptedShares =
    exerciceIds.length > 0
      ? await prisma.sharedExercice.findMany({
          where: {
            exerciceId: { in: exerciceIds },
            receiverId: userId,
            status: 'ACCEPTED',
          },
          select: {
            exerciceId: true,
            sender: { select: { id: true, name: true } },
          },
        })
      : [];
  const sharedByMap: Record<number, { id: number; name: string }> = {};
  for (const s of acceptedShares) {
    if (s.exerciceId !== null) {
      sharedByMap[s.exerciceId] = { id: s.sender.id, name: s.sender.name };
    }
  }

  const formattedExercices = exercices
    .map((exercice) => {
      const weeklyCompletions = exercice.history.map((h) => h.completedAt);
      const completedInPeriod = weeklyCompletions.length > 0;
      
      const hasTargetDayHistory = exercice.history.some((h) => {
        const completedDateKey = getDateKey(h.completedAt);
        return completedDateKey === targetDateKeyForComparison;
      });

      let equipmentsParsed: string[] = [];
      try {
        equipmentsParsed = JSON.parse(exercice.equipments || '[]');
      } catch {
        equipmentsParsed = [];
      }

      const bodypartsNames = exercice.bodyparts.map((eb) => eb.bodypart.name);

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
        bodyparts: bodypartsNames,
        category: exercice.category as ExerciceCategory,
        completed: completedInPeriod,
        completedToday: hasTargetDayHistory,
        completedAt: exercice.completedAt,
        pinned: exercice.pinned ?? false,
        weeklyCompletions: weeklyCompletions,
        media: exercice.media ?? null,
        archived: exercice.archived ?? false,
        archivedAt: exercice.archivedAt,
        sharedBy: sharedByMap[exercice.id],
      };
    })
    .filter((exercice) => {
      if (equipments.length === 0) {
        return true;
      }
      return equipments.some(selectedEq => exercice.equipments.includes(selectedEq));
    });

  return formattedExercices;
}
