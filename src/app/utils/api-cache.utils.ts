/**
 * ⚡ PERFORMANCE: Système de cache simple pour les requêtes API
 * 
 * Ce cache permet d'éviter les requêtes redondantes en stockant les résultats
 * avec une durée de validité (staleTime). Le cache est automatiquement invalidé
 * après la durée spécifiée.
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  staleTime: number;
};

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Récupère une entrée du cache si elle existe et n'est pas expirée
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isStale = now - entry.timestamp > entry.staleTime;

    if (isStale) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocke une entrée dans le cache
   * @param key - Clé unique pour identifier l'entrée
   * @param data - Données à mettre en cache
   * @param staleTime - Durée en millisecondes avant que le cache ne soit considéré comme expiré (défaut: 30 secondes)
   */
  set<T>(key: string, data: T, staleTime: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    });
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Supprime toutes les entrées du cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalide toutes les entrées expirées
   */
  invalidateStale(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.staleTime) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vérifie si une clé existe dans le cache et n'est pas expirée
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const now = Date.now();
    const isStale = now - entry.timestamp > entry.staleTime;

    if (isStale) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Instance singleton du cache
export const apiCache = new ApiCache();

/**
 * Génère une clé de cache à partir d'une URL et de paramètres optionnels
 */
export function generateCacheKey(url: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  return `${url}?${sortedParams}`;
}

/**
 * Nettoyer le cache toutes les minutes pour éviter l'accumulation de données expirées
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.invalidateStale();
  }, 60000); // Nettoyer toutes les minutes
}

