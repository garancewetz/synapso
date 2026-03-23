import { prisma } from '@/app/lib/prisma';
import { ExerciceCategory } from '@/app/types/exercice';
import { ExerciceCategory as PrismaExerciceCategory } from '@prisma/client';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';

type CreateExerciceData = {
  name: string;
  descriptionText: string;
  descriptionComment?: string | null;
  workoutRepeat?: string | null;
  workoutSeries?: string | null;
  workoutDuration?: string | null;
  equipments: string[];
  category: ExerciceCategory;
  bodyparts: string[];
  userId: number;
  createdAt?: Date;
  media?: unknown;
};

export async function createExercice(data: CreateExerciceData) {
  const { userId, bodyparts, createdAt, media, ...exerciceData } = data;

  const resetFrequency = (await prisma.user.findUnique({
    where: { id: userId },
    select: { resetFrequency: true },
  }))?.resetFrequency || 'DAILY';

  const createdDate = createdAt || new Date();
  const now = startOfDay(createdDate);
  const startOfPeriod = getStartOfPeriod(resetFrequency, now);
  const endOfPeriod = resetFrequency === 'DAILY'
    ? startOfDay(addDays(now, 1))
    : startOfDay(addDays(startOfPeriod, 7));

  const exercice = await prisma.$transaction(async (tx) => {
    const created = await tx.exercice.create({
      data: {
        ...exerciceData,
        name: exerciceData.name.trim(),
        descriptionText: exerciceData.descriptionText || '',
        descriptionComment: exerciceData.descriptionComment || null,
        equipments: JSON.stringify(exerciceData.equipments),
        category: exerciceData.category as PrismaExerciceCategory,
        userId,
        createdAt: createdDate,
        ...(media !== undefined && media !== null && { media }),
      },
    });

    await Promise.all(bodyparts.map(async (bodypartName: string) => {
      const bodypart = await tx.bodypart.upsert({
        where: { name: bodypartName },
        update: {},
        create: { name: bodypartName },
      });
      
      await tx.exerciceBodypart.create({
        data: {
          exerciceId: created.id,
          bodypartId: bodypart.id,
        },
      });
    }));

    return created;
  });

  const history = await prisma.history.findMany({
    where: {
      exerciceId: exercice.id,
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
    equipmentsParsed = JSON.parse(exercice.equipments || '[]');
  } catch {
    equipmentsParsed = [];
  }

  const exerciceBodyparts = await prisma.exerciceBodypart.findMany({
    where: { exerciceId: exercice.id },
    include: {
      bodypart: true,
    },
  });

  const weeklyCompletions = history.map(h => h.completedAt);
  const completedInPeriod = weeklyCompletions.length > 0;
  const completedToday = false;

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
    bodyparts: exerciceBodyparts.map(eb => eb.bodypart.name),
    category: exercice.category as ExerciceCategory,
    completed: completedInPeriod,
    completedToday: completedToday,
    completedAt: exercice.completedAt,
    pinned: exercice.pinned,
    weeklyCompletions: weeklyCompletions,
    media: exercice.media ?? null,
    archived: exercice.archived ?? false,
    archivedAt: exercice.archivedAt,
  };
}
