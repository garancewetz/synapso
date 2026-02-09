import { PrismaClient } from '@prisma/client';
import { addDays, startOfDay } from 'date-fns';
import { getStartOfPeriod } from './resetFrequency.utils';

type ResetFrequency = 'DAILY' | 'WEEKLY';

type PrismaTransaction = Omit<
  PrismaClient,
  '$transaction' | '$connect' | '$disconnect' | '$on' | '$extends'
>;

type CompleteExerciceParams = {
  exerciceId: number;
  completedAt: Date;
  resetFrequency: ResetFrequency;
  checkDateForCompletedToday: Date;
};

type CompleteExerciceResult = {
  exercice: Awaited<ReturnType<PrismaClient['exercice']['findUnique']>>;
  completed: boolean;
  completedToday: boolean;
  weeklyCompletions: Date[];
};

export async function parseCompletedAtFromBody(
  request: Request
): Promise<{ completedAt: Date; checkDateForCompletedToday: Date }> {
  let customCompletedAt: Date | null = null;
  let targetDateForCheck: Date | null = null;

  try {
    const body = await request.json();
    if (body && body.completedAt) {
      customCompletedAt = new Date(body.completedAt);
      if (isNaN(customCompletedAt.getTime())) {
        customCompletedAt = null;
      } else {
        targetDateForCheck = customCompletedAt;
      }
    }
  } catch {
    // Body vide ou invalide, utiliser la date actuelle
  }

  const completedAt = customCompletedAt || new Date();
  const checkDateForCompletedToday = targetDateForCheck || completedAt;

  return { completedAt, checkDateForCompletedToday };
}

export function calculatePeriodDates(
  completedAt: Date,
  resetFrequency: ResetFrequency
) {
  const targetDate = startOfDay(completedAt);
  const endOfTargetDate = startOfDay(addDays(completedAt, 1));
  const periodReferenceDate = completedAt;
  const startOfPeriod = getStartOfPeriod(resetFrequency, periodReferenceDate);
  const endOfPeriod =
    resetFrequency === 'DAILY'
      ? startOfDay(addDays(periodReferenceDate, 1))
      : startOfDay(addDays(startOfPeriod, 7));

  return {
    targetDate,
    endOfTargetDate,
    startOfPeriod,
    endOfPeriod,
  };
}

export function calculateCheckDayDates(checkDate: Date) {
  const startOfCheckDay = startOfDay(checkDate);
  const endOfCheckDay = startOfDay(addDays(checkDate, 1));

  return { startOfCheckDay, endOfCheckDay };
}

export async function toggleExerciceCompletion(
  tx: PrismaTransaction,
  params: CompleteExerciceParams
): Promise<CompleteExerciceResult> {
  const { exerciceId, completedAt, resetFrequency, checkDateForCompletedToday } =
    params;

  // ⚡ PERFORMANCE: Calculer uniquement les dates nécessaires pour la transaction minimale
  const { targetDate, endOfTargetDate } =
    calculatePeriodDates(completedAt, resetFrequency);
  const { startOfCheckDay, endOfCheckDay } = calculateCheckDayDates(
    checkDateForCompletedToday
  );

  const isSameDay =
    startOfCheckDay.getTime() === targetDate.getTime() &&
    endOfCheckDay.getTime() === endOfTargetDate.getTime();

  // ⚡ PERFORMANCE CRITIQUE: Vérifier l'existence avec une requête ultra-rapide
  // Utiliser findFirst avec select minimal (plus rapide que count dans certains cas)
  const targetDayHistory = await tx.history.findFirst({
    where: {
      exerciceId,
      completedAt: {
        gte: targetDate,
        lt: endOfTargetDate,
      },
    },
    select: {
      id: true, // Seulement l'ID pour vérifier l'existence
    },
  });

  const isCompleting = !targetDayHistory;

  if (isCompleting) {
    // ⚡ PERFORMANCE CRITIQUE: Transaction minimale - uniquement create + update
    // Les calculs seront faits après la transaction pour ne pas bloquer
    const [, exercice] = await Promise.all([
      tx.history.create({
        data: {
          exerciceId,
          completedAt,
        },
      }),
      tx.exercice.update({
        where: { id: exerciceId },
        data: {
          completedAt,
        },
      }),
    ]);

    // ⚡ PERFORMANCE: Calculer les valeurs de manière optimiste
    // completedToday = true si même jour (on vient de créer l'entrée), sinon sera recalculé
    // completedInPeriod = true (on vient de créer une entrée dans la période)
    const completedToday = isSameDay;
    const completedInPeriod = true;
    
    // ⚡ PERFORMANCE: weeklyCompletions sera calculé après la transaction pour ne pas bloquer
    const weeklyCompletions: Date[] = [];

    return {
      exercice,
      completed: completedInPeriod,
      completedToday,
      weeklyCompletions,
    };
  } else {
    // ⚡ PERFORMANCE CRITIQUE: Transaction minimale - uniquement delete + update
    // Les calculs seront faits après la transaction pour ne pas bloquer
    
    // Supprimer les entrées pour la date cible
    await tx.history.deleteMany({
      where: {
        exerciceId,
        completedAt: {
          gte: targetDate,
          lt: endOfTargetDate,
        },
      },
    });

    // Récupérer la dernière entrée pour completedAt (nécessaire pour l'exercice)
    const remainingHistory = await tx.history.findFirst({
      where: {
        exerciceId,
      },
      orderBy: {
        completedAt: 'desc',
      },
      select: {
        completedAt: true,
      },
    });

    // Mettre à jour l'exercice
    const updatedExercice = await tx.exercice.update({
      where: { id: exerciceId },
      data: {
        completedAt: remainingHistory?.completedAt || null,
      },
    });

    // ⚡ PERFORMANCE: Calculer les valeurs de manière optimiste
    // completedToday = false si même jour (on vient de supprimer)
    // completedInPeriod sera recalculé après la transaction (on ne sait pas encore)
    // Pour l'instant, on retourne false pour completedInPeriod, il sera mis à jour par le refetch
    const completedToday = isSameDay ? false : true; // Optimiste : on assume qu'il y a d'autres entrées
    const completedInPeriod = true; // Optimiste : on assume qu'il reste des entrées dans la période
    
    // ⚡ PERFORMANCE: weeklyCompletions sera calculé après la transaction pour ne pas bloquer
    const weeklyCompletions: Date[] = [];

    return {
      exercice: updatedExercice,
      completed: completedInPeriod,
      completedToday,
      weeklyCompletions,
    };
  }
}
