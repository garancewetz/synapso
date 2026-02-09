import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { cacheApiResponse, generateCacheKey, CACHE_TAGS } from '@/app/lib/cache';
import type { ExerciceCategory } from '@/app/types/exercice';

interface HistoryEntry {
  id: number;
  completedAt: Date;
  exercice: {
    id: number;
    name: string;
    category: ExerciceCategory;
    descriptionText: string;
    descriptionComment: string | null;
    workoutRepeat: string | null;
    workoutSeries: string | null;
    workoutDuration: string | null;
    equipments: string;
    userId: number;
    bodyparts: Array<{
      exerciceId: number;
      bodypartId: number;
      bodypart: {
        id: number;
        name: string;
      };
    }>;
  };
}

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

    // Construire le filtre
    const whereClause: {
      exercice: { userId: number };
      completedAt?: { gte: Date };
    } = {
      exercice: {
        userId: userId,
      },
    };

    // Ajouter le filtre de date si fourni
    if (sinceParam) {
      const sinceDate = new Date(sinceParam);
      if (!isNaN(sinceDate.getTime())) {
        whereClause.completedAt = { gte: sinceDate };
      }
    }

    // ⚡ PERFORMANCE: Utiliser le cache pour éviter les requêtes répétées
    const cacheKey = generateCacheKey([
      'history',
      userId,
      sinceParam || 'all',
      limitParam || 'no-limit',
    ]);

    const formattedHistory = await cacheApiResponse(
      cacheKey,
      async () => {
        const history = await prisma.history.findMany({
          where: whereClause,
          include: {
            exercice: {
              include: {
                bodyparts: {
                  include: {
                    bodypart: true,
                  },
                },
              },
            },
          },
          orderBy: { completedAt: 'desc' },
          ...(limitParam && !isNaN(parseInt(limitParam)) && { take: parseInt(limitParam) }),
        }) as HistoryEntry[];

        // Reformater les données
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
        revalidate: 10, // Cache de 10 secondes (données qui changent souvent)
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
