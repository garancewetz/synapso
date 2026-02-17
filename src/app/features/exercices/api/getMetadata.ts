import { prisma } from '@/app/lib/prisma';
import { cacheApiResponse, generateCacheKey, CACHE_TAGS } from '@/app/lib/cache';

type GetMetadataParams = {
  userId: number;
};

export async function getMetadata(params: GetMetadataParams) {
  const { userId } = params;

  const cacheKey = generateCacheKey(['metadata', userId]);
  
  const result = await cacheApiResponse(
    cacheKey,
    async () => {
      const bodyparts = await prisma.bodypart.findMany({
        orderBy: { name: 'asc' },
        select: { name: true },
      });

      const exercices = await prisma.exercice.findMany({
        where: {
          userId: userId,
          archived: false,
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

  return result;
}
