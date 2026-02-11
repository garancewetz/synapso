import { PrismaClient } from '@prisma/client';
import { addDays, startOfDay } from 'date-fns';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';

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
      // ⚡ FIX TIMEZONE: Détecter si c'est un dateKey (yyyy-MM-dd) et utiliser le noon UTC trick
      // pour éviter les décalages de timezone (cohérent avec GET /api/exercices)
      const isDateKey = /^\d{4}-\d{2}-\d{2}$/.test(body.completedAt);
      customCompletedAt = isDateKey
        ? new Date(body.completedAt + 'T12:00:00.000Z')
        : new Date(body.completedAt);
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

  const { targetDate, endOfTargetDate, startOfPeriod, endOfPeriod } =
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

    const completedToday = isSameDay;
    const completedInPeriod = true;

    // Récupérer les completions de la période pour le client (gauges, dots hebdo)
    const weeklyHistory = await tx.history.findMany({
      where: { exerciceId, completedAt: { gte: startOfPeriod, lt: endOfPeriod } },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    });
    const weeklyCompletions = weeklyHistory.map(h => h.completedAt);

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

    // ⚡ PERFORMANCE: Récupérer la dernière entrée pour completedAt (nécessaire pour l'exercice)
    // findFirst retourne déjà un seul résultat, optimisé avec orderBy
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

    const completedToday = isSameDay ? false : true;

    // Récupérer les completions restantes de la période pour le client
    const weeklyHistory = await tx.history.findMany({
      where: { exerciceId, completedAt: { gte: startOfPeriod, lt: endOfPeriod } },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    });
    const weeklyCompletions = weeklyHistory.map(h => h.completedAt);
    const completedInPeriod = weeklyCompletions.length > 0;

    return {
      exercice: updatedExercice,
      completed: completedInPeriod,
      completedToday,
      weeklyCompletions,
    };
  }
}
