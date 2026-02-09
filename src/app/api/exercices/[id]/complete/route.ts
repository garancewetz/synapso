import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import {
  parseCompletedAtFromBody,
  toggleExerciceCompletion,
} from '@/app/utils/exercice-complete.utils';
import { CACHE_TAGS } from '@/app/lib/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const exercice = await prisma.exercice.findFirst({
      where: {
        id,
        userId: userId,
      },
      include: {
        user: {
          select: { resetFrequency: true },
        },
      },
    });

    if (!exercice) {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }

    const resetFrequency = exercice.user.resetFrequency || 'DAILY';
    const { completedAt, checkDateForCompletedToday } =
      await parseCompletedAtFromBody(request);

    // ⚡ PERFORMANCE CRITIQUE: Transaction avec timeout adapté
    // Tous les calculs complexes seront faits après la transaction
    const result = await prisma.$transaction(
      async (tx) => {
        return toggleExerciceCompletion(tx, {
          exerciceId: id,
          completedAt,
          resetFrequency: resetFrequency as 'DAILY' | 'WEEKLY',
          checkDateForCompletedToday,
        });
      },
      {
        maxWait: 5000, // Temps d'attente pour démarrer la transaction
        timeout: 10000, // Timeout de 10s pour les transactions longues (deleteMany + findFirst peuvent être lents)
      }
    );

    // ⚡ CACHE INVALIDATION: Invalider le cache côté serveur après complétion
    const targetDateKey = completedAt ? new Date(completedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    revalidateTag(CACHE_TAGS.EXERCICES);
    revalidateTag(CACHE_TAGS.EXERCICE(id));
    revalidateTag(CACHE_TAGS.USER_EXERCICES(userId));
    revalidateTag(CACHE_TAGS.HISTORY);
    revalidateTag(CACHE_TAGS.USER_HISTORY(userId));
    revalidateTag(CACHE_TAGS.STATS);
    revalidateTag(CACHE_TAGS.USER_STATS(userId, targetDateKey));

    // ⚡ PERFORMANCE: Retourner immédiatement avec les valeurs calculées
    // Les valeurs manquantes seront mises à jour par le refetch automatique
    return NextResponse.json({
      ...result.exercice,
      completed: result.completed,
      completedToday: result.completedToday,
      weeklyCompletions: result.weeklyCompletions,
    });
  } catch (error) {
    logError('Erreur lors de la mise à jour', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'exercice' },
      { status: 500 }
    );
  }
}

