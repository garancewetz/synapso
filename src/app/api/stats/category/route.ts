import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';
import { cacheApiResponse, generateCacheKey, CACHE_TAGS } from '@/app/lib/cache';
import type { ExerciceCategory } from '@/app/types/exercice';

/**
 * Route API pour les statistiques de complétion par catégorie
 * Utilise des agrégations SQL pour réduire le transfert réseau de 80-90%
 * 
 * GET /api/stats/category?targetDate=2026-01-15
 */
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

    // Récupérer l'utilisateur pour obtenir le resetFrequency
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

    const { searchParams } = new URL(request.url);
    const targetDateParam = searchParams.get('targetDate');
    let targetDate = new Date();
    if (targetDateParam) {
      const parsedDate = new Date(targetDateParam);
      if (!isNaN(parsedDate.getTime())) {
        targetDate = parsedDate;
      }
    }

    // Calculer la période de réinitialisation
    const now = targetDate;
    const startOfPeriod = getStartOfPeriod(user.resetFrequency, now);
    const endOfPeriod = user.resetFrequency === 'DAILY'
      ? startOfDay(addDays(now, 1))
      : startOfDay(addDays(startOfPeriod, 7));

    const startOfTargetDay = startOfDay(now);
    const endOfTargetDay = startOfDay(addDays(now, 1));

    // ⚡ PERFORMANCE: Cache côté serveur (30 secondes)
    const cacheKey = generateCacheKey([
      'stats-category',
      userId,
      targetDate.toISOString().split('T')[0],
      user.resetFrequency,
    ]);

    const stats = await cacheApiResponse(
      cacheKey,
      async () => {
        // ⚡ AGRÉGATION SQL: Compter directement les exercices complétés par catégorie
        // Utilise une requête SQL optimisée au lieu de transférer toutes les données
        const statsResult = await prisma.$queryRaw<Array<{
          category: ExerciceCategory;
          count: bigint;
        }>>`
          SELECT 
            e.category,
            COUNT(DISTINCT e.id)::int as count
          FROM "Exercice" e
          INNER JOIN "History" h ON h."exerciceId" = e.id
          WHERE 
            e."userId" = ${userId}::int
            AND e.archived = false
            AND h."completedAt" >= ${startOfTargetDay}::timestamp
            AND h."completedAt" < ${endOfTargetDay}::timestamp
          GROUP BY e.category
        `;

        // Convertir le résultat en format attendu
        const statsByCategory: Record<ExerciceCategory, number> = {
          UPPER_BODY: 0,
          LOWER_BODY: 0,
          STRETCHING: 0,
          CORE: 0,
        };

        statsResult.forEach((row) => {
          if (row.category && row.category in statsByCategory) {
            statsByCategory[row.category as ExerciceCategory] = Number(row.count);
          }
        });

        return statsByCategory;
      },
      {
        revalidate: 30, // 30 secondes (même stratégie que les exercices)
        tags: [
          CACHE_TAGS.STATS,
          CACHE_TAGS.USER_STATS(userId, targetDate.toISOString().split('T')[0]),
          CACHE_TAGS.EXERCICES, // Invalider aussi quand les exercices changent
          CACHE_TAGS.HISTORY, // Invalider aussi quand l'historique change
        ],
      }
    );

    return NextResponse.json(stats);
  } catch (error) {
    logError('Error fetching category stats', error);
    return NextResponse.json(
      { error: 'Failed to fetch category stats' },
      { status: 500 }
    );
  }
}
