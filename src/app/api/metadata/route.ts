import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { cacheApiResponse, generateCacheKey, CACHE_TAGS } from '@/app/lib/cache';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie (gère l'impersonation admin)
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // ⚡ PERFORMANCE: Cache côté serveur (5 minutes car les métadonnées changent peu)
    const cacheKey = generateCacheKey(['metadata', userId]);
    
    const result = await cacheApiResponse(
      cacheKey,
      async () => {
        // Récupérer tous les bodyparts depuis la table Bodypart
        const bodyparts = await prisma.bodypart.findMany({
          orderBy: { name: 'asc' },
          select: { name: true },
        });

        // Récupérer tous les équipements depuis les exercices de l'utilisateur
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
            // Ignorer les erreurs de parsing, continuer avec les autres exercices
          }
        });

        // Créer un tableau d'équipements avec leurs compteurs
        // Ne pas filtrer par count > 0 pour afficher tous les équipements
        const equipmentsWithCounts = Array.from(equipmentsSet)
          .map(eq => ({
            name: eq,
            count: equipmentsCounts[eq] || 0,
          }))
          .sort((a, b) => {
            // Trier d'abord par count décroissant, puis par nom alphabétique
            if (b.count !== a.count) {
              return b.count - a.count;
            }
            return a.name.localeCompare(b.name);
          });

        return {
          bodyparts: bodyparts.map((bp) => bp.name),
          equipments: Array.from(equipmentsSet).sort(),
          equipmentsWithCounts: equipmentsWithCounts,
        };
      },
      {
        revalidate: 300, // 5 minutes (métadonnées changent peu)
        tags: [CACHE_TAGS.METADATA, CACHE_TAGS.USER_METADATA(userId)],
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    logError('Error fetching metadata', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

