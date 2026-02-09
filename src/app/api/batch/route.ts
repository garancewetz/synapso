import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { prisma } from '@/app/lib/prisma';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';
import type { ExerciceCategory } from '@/app/types/exercice';
import { ExerciceCategory as PrismaExerciceCategory } from '@prisma/client';
import { cacheApiResponse, generateCacheKey, CACHE_TAGS } from '@/app/lib/cache';

/**
 * Route API batch pour charger plusieurs ressources en une seule requête
 * Réduit le nombre de round-trips réseau et améliore les performances
 * 
 * Usage: POST /api/batch
 * Body: { resources: ['exercices', 'history', 'progress', 'metadata'], filters: {...} }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { resources = [], filters = {} } = body;

    if (!Array.isArray(resources) || resources.length === 0) {
      return NextResponse.json(
        { error: 'resources doit être un tableau non vide' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur une seule fois pour toutes les ressources
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with id ${userId} not found` },
        { status: 404 }
      );
    }

    // Calculer la date cible une seule fois
    const targetDateParam = filters.targetDate;
    let targetDate = new Date();
    if (targetDateParam) {
      const parsedDate = new Date(targetDateParam);
      if (!isNaN(parsedDate.getTime())) {
        targetDate = parsedDate;
      }
    }

    const now = targetDate;
    const startOfPeriod = getStartOfPeriod(user.resetFrequency, now);
    const endOfPeriod = user.resetFrequency === 'DAILY'
      ? startOfDay(addDays(now, 1))
      : startOfDay(addDays(startOfPeriod, 7));

    // ⚡ PERFORMANCE: Cache côté serveur pour les requêtes batch
    const cacheKey = generateCacheKey([
      'batch',
      userId,
      resources.sort().join(','),
      JSON.stringify(filters),
    ]);

    const results = await cacheApiResponse(
      cacheKey,
      async () => {
        // Charger toutes les ressources en parallèle
        const batchResults: Record<string, unknown> = {};

    const promises: Promise<void>[] = [];

    // Exercices
    if (resources.includes('exercices')) {
      promises.push(
        (async () => {
          const category = filters.category as ExerciceCategory | null;
          const equipmentsParam = filters.equipments as string | null;
          const selectedEquipments = equipmentsParam
            ? equipmentsParam.split(',').map(eq => decodeURIComponent(eq).trim()).filter(Boolean)
            : [];

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

          if (!filters.includeArchived) {
            whereClause.archived = false;
          }

          const exercices = await prisma.exercice.findMany({
            where: whereClause,
            include: {
              bodyparts: {
                include: {
                  bodypart: true,
                },
              },
              history: {
                where: {
                  completedAt: {
                    gte: startOfPeriod,
                    lt: endOfPeriod,
                  },
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

          const formattedExercices = exercices
            .map((exercice) => {
              const weeklyCompletions = exercice.history.map((h) => h.completedAt);
              const completedInPeriod = weeklyCompletions.length > 0;
              const startOfTargetDay = startOfDay(now);
              const endOfTargetDay = startOfDay(addDays(now, 1));
              const hasTargetDayHistory = exercice.history.some(
                (h) => {
                  const completedDate = h.completedAt instanceof Date ? h.completedAt : new Date(h.completedAt);
                  return completedDate >= startOfTargetDay && completedDate < endOfTargetDay;
                }
              );
              const completedToday = hasTargetDayHistory;

              let equipmentsParsed: string[] = [];
              try {
                equipmentsParsed = JSON.parse(exercice.equipments || '[]');
              } catch {
                equipmentsParsed = [];
              }

              const bodypartsNames = exercice.bodyparts.map((eb) => eb.bodypart.name);
              const mediaParsed = exercice.media ?? null;

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
                completedToday: completedToday,
                completedAt: exercice.completedAt,
                pinned: exercice.pinned ?? false,
                weeklyCompletions: weeklyCompletions,
                media: mediaParsed,
                archived: false,
                archivedAt: null,
              };
            })
            .filter((exercice) => {
              if (selectedEquipments.length === 0) {
                return true;
              }
              return selectedEquipments.some(selectedEq => exercice.equipments.includes(selectedEq));
            });

          batchResults.exercices = formattedExercices;
        })()
      );
    }

    // History
    if (resources.includes('history')) {
      promises.push(
        (async () => {
          const sinceParam = filters.since as string | null;
          const days = filters.days as number | null;

          const whereClause: {
            exercice: { userId: number };
            completedAt?: { gte: Date };
          } = {
            exercice: {
              userId: userId,
            },
          };

          if (sinceParam) {
            const sinceDate = new Date(sinceParam);
            if (!isNaN(sinceDate.getTime())) {
              whereClause.completedAt = { gte: sinceDate };
            }
          } else if (days) {
            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - days);
            whereClause.completedAt = { gte: sinceDate };
          }

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
            ...(days && !isNaN(days) && { take: undefined }), // Pas de limite si days est spécifié
          });

          const formattedHistory = history.map((entry) => ({
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

          batchResults.history = formattedHistory;
        })()
      );
    }

    // Progress
    if (resources.includes('progress')) {
      promises.push(
        (async () => {
          const limit = filters.progressLimit as number | null;

          const progress = await prisma.progress.findMany({
            where: {
              userId: userId,
            },
            orderBy: {
              createdAt: 'desc',
            },
            ...(limit && !isNaN(limit) && { take: limit }),
          });

          const formattedProgress = progress.map((p) => ({
            id: p.id,
            content: p.content,
            emoji: p.emoji,
            tags: p.tags,
            medias: p.medias,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }));

          batchResults.progress = formattedProgress;
        })()
      );
    }

    // Metadata
    if (resources.includes('metadata')) {
      promises.push(
        (async () => {
          const bodyparts = await prisma.bodypart.findMany({
            orderBy: { name: 'asc' },
            select: { name: true },
          });

          const exercices = await prisma.exercice.findMany({
            where: {
              userId: userId,
            },
            select: {
              equipments: true,
            },
          });

          const equipmentsSet = new Set<string>();
          const equipmentsCounts: Record<string, number> = {};
          
          exercices.forEach((exercice) => {
            try {
              const equipments = JSON.parse(exercice.equipments || '[]') as string[];
              if (Array.isArray(equipments)) {
                equipments.forEach((eq: string) => {
                  if (typeof eq === 'string' && eq.trim()) {
                    const trimmed = eq.trim();
                    equipmentsSet.add(trimmed);
                    equipmentsCounts[trimmed] = (equipmentsCounts[trimmed] || 0) + 1;
                  }
                });
              }
            } catch {
              // Ignorer les erreurs de parsing
            }
          });

          const equipmentsWithCounts = Array.from(equipmentsSet)
            .map(eq => ({
              name: eq,
              count: equipmentsCounts[eq] || 0,
            }))
            .sort((a, b) => {
              if (b.count !== a.count) {
                return b.count - a.count;
              }
              return a.name.localeCompare(b.name);
            });

          batchResults.metadata = {
            bodyparts: bodyparts.map((bp) => bp.name),
            equipments: Array.from(equipmentsSet).sort(),
            equipmentsWithCounts: equipmentsWithCounts,
          };
        })()
      );
    }

        // Attendre que toutes les ressources soient chargées
        await Promise.all(promises);

        return batchResults;
      },
      {
        revalidate: 30, // 30 secondes (même stratégie que les routes individuelles)
        tags: [
          ...resources.map(r => {
            switch (r) {
              case 'exercices':
                return CACHE_TAGS.EXERCICES;
              case 'history':
                return CACHE_TAGS.HISTORY;
              case 'progress':
                return CACHE_TAGS.PROGRESS;
              case 'metadata':
                return CACHE_TAGS.METADATA;
              default:
                return '';
            }
          }).filter(Boolean),
          CACHE_TAGS.USER_EXERCICES(userId),
          CACHE_TAGS.USER_HISTORY(userId),
          CACHE_TAGS.USER_PROGRESS(userId),
          CACHE_TAGS.USER_METADATA(userId),
        ],
      }
    );

    return NextResponse.json(results);
  } catch (error) {
    logError('Error in batch request', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch data' },
      { status: 500 }
    );
  }
}
