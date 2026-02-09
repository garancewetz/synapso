import { unstable_cache } from 'next/cache';

/**
 * Utilitaire de cache pour les routes API
 * Utilise Next.js unstable_cache pour mettre en cache les résultats des requêtes
 * 
 * @param key - Clé unique pour le cache (doit inclure userId et autres paramètres pertinents)
 * @param fn - Fonction à exécuter et mettre en cache
 * @param options - Options de cache (revalidate en secondes, tags pour invalidation)
 */
export async function cacheApiResponse<T>(
  key: string,
  fn: () => Promise<T>,
  options: {
    revalidate?: number; // Temps en secondes avant revalidation (défaut: 30s)
    tags?: string[]; // Tags pour invalidation ciblée
  } = {}
): Promise<T> {
  const { revalidate = 30, tags = [] } = options;

  return unstable_cache(
    fn,
    [key],
    {
      revalidate,
      tags,
    }
  )();
}

/**
 * Génère une clé de cache à partir de paramètres
 */
export function generateCacheKey(parts: (string | number | null | undefined)[]): string {
  return parts
    .filter((part): part is string | number => part != null)
    .map(part => String(part))
    .join('-');
}

/**
 * Tags de cache pour invalidation ciblée
 */
export const CACHE_TAGS = {
  EXERCICES: 'exercices',
  EXERCICE: (id: number) => `exercice-${id}`,
  USER_EXERCICES: (userId: number) => `user-${userId}-exercices`,
  METADATA: 'metadata',
  USER_METADATA: (userId: number) => `user-${userId}-metadata`,
  HISTORY: 'history',
  USER_HISTORY: (userId: number) => `user-${userId}-history`,
  PROGRESS: 'progress',
  USER_PROGRESS: (userId: number) => `user-${userId}-progress`,
  STATS: 'stats',
  USER_STATS: (userId: number, dateKey: string) => `user-${userId}-stats-${dateKey}`,
  PROGRESS: 'progress',
  USER_PROGRESS: (userId: number) => `user-${userId}-progress`,
} as const;
