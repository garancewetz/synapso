import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { cacheApiResponse, generateCacheKey, CACHE_TAGS } from '@/app/lib/cache';
import { getHistory } from '@/app/features/historique/api';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Paramètres de filtrage optionnels pour optimiser les performances
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get('since'); // ISO date string - filtre les entrées depuis cette date
    const limitParam = searchParams.get('limit'); // Nombre max d'entrées à retourner

    const sinceDate = sinceParam ? new Date(sinceParam) : undefined;
    const limit = limitParam && !isNaN(parseInt(limitParam)) ? parseInt(limitParam) : undefined;

    const cacheKey = generateCacheKey([
      'history',
      userId,
      sinceParam || 'all',
      limitParam || 'no-limit',
    ]);

    const formattedHistory = await cacheApiResponse(
      cacheKey,
      async () => {
        const history = await getHistory({
          userId,
          since: sinceDate && !isNaN(sinceDate.getTime()) ? sinceDate : undefined,
          limit,
        });

        return history.map((entry) => ({
          id: entry.id,
          completedAt: entry.completedAt,
          exercice: {
            id: entry.exercice.id,
            name: entry.exercice.name,
            category: entry.exercice.category,
            description: {
              text: entry.exercice.descriptionText,
              comment: entry.exercice.descriptionComment,
            },
            workout: {
              repeat: entry.exercice.workoutRepeat,
              series: entry.exercice.workoutSeries,
              duration: entry.exercice.workoutDuration,
            },
            equipments: (() => {
              try {
                const parsed = JSON.parse(entry.exercice.equipments || '[]');
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            })(),
            bodyparts: entry.exercice.bodyparts.map((eb) => ({
              id: eb.bodypart.id,
              name: eb.bodypart.name,
            })),
          },
        }));
      },
      {
        revalidate: 10,
        tags: [CACHE_TAGS.HISTORY, CACHE_TAGS.USER_HISTORY(userId)],
      }
    );

    return NextResponse.json(formattedHistory);
  } catch (error) {
    logError('Error fetching history', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
