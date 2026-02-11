import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { ExerciceCategory } from '@/app/types/exercice';
import { ExerciceCategory as PrismaExerciceCategory } from '@prisma/client';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay, format } from 'date-fns';
import { CACHE_TAGS } from '@/app/lib/cache';

type ExerciceWithArchived = {
  archived?: boolean;
  archivedAt?: Date | null;
  [key: string]: unknown;
};

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as ExerciceCategory | null;
    const equipmentsParam = searchParams.get('equipments');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const targetDateParam = searchParams.get('targetDate');

    const selectedEquipments = equipmentsParam
      ? equipmentsParam.split(',').map(eq => decodeURIComponent(eq).trim()).filter(Boolean)
      : [];

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with id ${userId} not found` },
        { status: 404 }
      );
    }

    const targetDate = targetDateParam
      ? new Date(targetDateParam + 'T12:00:00.000Z')
      : new Date(format(new Date(), 'yyyy-MM-dd') + 'T12:00:00.000Z');

    const startOfPeriod = getStartOfPeriod(user.resetFrequency, targetDate);
    const endOfPeriod = user.resetFrequency === 'DAILY'
      ? startOfDay(addDays(targetDate, 1))
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

    const targetDateKeyForComparison = format(targetDate, 'yyyy-MM-dd');

    const formattedExercices = exercices
      .map((exercice) => {
        const weeklyCompletions = exercice.history.map((h) => h.completedAt);
        const completedInPeriod = weeklyCompletions.length > 0;
        
        const hasTargetDayHistory = exercice.history.some((h) => {
          const completedDateKey = format(startOfDay(h.completedAt), 'yyyy-MM-dd');
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
          archived: (exercice as ExerciceWithArchived).archived ?? false,
          archivedAt: (exercice as ExerciceWithArchived).archivedAt,
        };
      })
      .filter((exercice) => {
        if (selectedEquipments.length === 0) {
          return true;
        }
        return selectedEquipments.some(selectedEq => exercice.equipments.includes(selectedEq));
      });
    
    return NextResponse.json(formattedExercices);
  } catch (error) {
    logError('Error fetching exercices', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercices' },
      { status: 500 }
    );
  }
}
