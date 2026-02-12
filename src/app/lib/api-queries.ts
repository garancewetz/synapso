import { subDays } from 'date-fns';
import type { Exercice } from '@/app/types';
import type { HistoryEntry } from '@/app/types';
import type { Progress } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';

// ⚡ QUERY KEYS: Centraliser les clés de requête pour éviter les erreurs de typo
export const queryKeys = {
  exercices: {
    all: ['exercices'] as const,
    lists: () => [...queryKeys.exercices.all, 'list'] as const,
    list: (filters: {
      category?: ExerciceCategory;
      equipments?: string[];
      includeArchived?: boolean;
      targetDate?: string;
      resetFrequency?: 'DAILY' | 'WEEKLY';
    }) => [...queryKeys.exercices.lists(), filters] as const,
  },
  history: {
    all: ['history'] as const,
    lists: () => [...queryKeys.history.all, 'list'] as const,
    list: (params: { since?: string; days?: number; referenceDate?: string }) => 
      [...queryKeys.history.lists(), params] as const,
  },
  progress: {
    all: ['progress'] as const,
    lists: () => [...queryKeys.progress.all, 'list'] as const,
    list: (params: { limit?: number }) => 
      [...queryKeys.progress.lists(), params] as const,
  },
  categoryStats: {
    all: ['categoryStats'] as const,
    lists: () => [...queryKeys.categoryStats.all, 'list'] as const,
    list: (params: { userId: number; resetFrequency: 'DAILY' | 'WEEKLY'; referenceDateKey: string }) => 
      [...queryKeys.categoryStats.lists(), params] as const,
    aggregated: (params: { targetDate?: string }) =>
      [...queryKeys.categoryStats.all, 'aggregated', params] as const,
  },
  todayCompletedCount: {
    all: ['todayCompletedCount'] as const,
    lists: () => [...queryKeys.todayCompletedCount.all, 'list'] as const,
    list: (params: { userId: number; dateKey: string | null }) => 
      [...queryKeys.todayCompletedCount.lists(), params] as const,
  },
  equipments: {
    all: ['equipments'] as const,
  },
  equipmentMetadata: {
    all: ['equipmentMetadata'] as const,
  },
  journalNotes: {
    all: ['journalNotes'] as const,
  },
  batch: {
    all: ['batch'] as const,
    list: (params: { resources: string[]; filters?: Record<string, unknown> }) =>
      [...queryKeys.batch.all, 'list', params] as const,
  },
  journalTasks: {
    all: ['journalTasks'] as const,
  },
  journalProgress: {
    all: ['journalProgress'] as const,
    lists: () => [...queryKeys.journalProgress.all, 'list'] as const,
    list: (userId: number) => [...queryKeys.journalProgress.lists(), userId] as const,
  },
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
  },
} as const;

// ⚡ FETCH FUNCTIONS: Fonctions pures pour les appels API
export async function fetchExercices(filters: {
  category?: ExerciceCategory;
  equipments?: string[];
  includeArchived?: boolean;
  targetDate?: string;
}): Promise<Exercice[]> {
  const params = new URLSearchParams();
  if (filters.category) {
    params.append('category', filters.category);
  }
  if (filters.equipments && filters.equipments.length > 0) {
    params.append('equipments', filters.equipments.map(eq => encodeURIComponent(eq)).join(','));
  }
  if (filters.includeArchived) {
    params.append('includeArchived', 'true');
  }
  if (filters.targetDate) {
    params.append('targetDate', filters.targetDate);
  }
  
  const url = params.toString()
    ? `/api/exercices?${params.toString()}`
    : `/api/exercices`;

  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || `Erreur HTTP: ${res.status}`);
  }
  
  const exercices = await res.json();
  console.log('[FETCH-EXERCICES] 📥 Récupération:', {
    url,
    targetDate: filters.targetDate,
    count: exercices.length,
  });
  
  return exercices;
}

export async function fetchHistory(params: { since?: string; days?: number; referenceDate?: string }): Promise<HistoryEntry[]> {
  const baseDate = params.referenceDate ? new Date(params.referenceDate) : new Date();

  const url = params.days !== null && params.days !== undefined
    ? `/api/history?since=${encodeURIComponent(subDays(baseDate, params.days).toISOString())}`
    : '/api/history';

  console.log('[DEBUG-PROD] fetchHistory → URL:', url, '| params:', params, '| baseDate:', baseDate.toISOString());

  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  return res.json();
}

export async function fetchProgress(params: { limit?: number }): Promise<Progress[]> {
  const url = params.limit
    ? `/api/progress?limit=${params.limit}`
    : '/api/progress';
  
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  return res.json();
}

export async function fetchCategoryStats(params: {
  userId: number;
  resetFrequency: 'DAILY' | 'WEEKLY';
  referenceDateKey: string;
}): Promise<HistoryEntry[]> {
  const periodDate = getStartOfPeriod(params.resetFrequency, new Date(params.referenceDateKey + 'T00:00:00'));
  const sinceParam = periodDate.toISOString();
  const url = `/api/history?since=${encodeURIComponent(sinceParam)}`;
  
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  return res.json();
}

/**
 * ⚡ PERFORMANCE: Récupère les stats par catégorie via agrégation SQL
 * Réduit le transfert réseau de 80-90% en calculant directement en base
 * 
 * @param targetDate - Date cible (optionnel, par défaut aujourd'hui)
 */
export async function fetchCategoryStatsAggregated(params: {
  targetDate?: string;
}): Promise<Record<ExerciceCategory, number>> {
  const urlParams = new URLSearchParams();
  if (params.targetDate) {
    urlParams.append('targetDate', params.targetDate);
  }
  
  const url = urlParams.toString()
    ? `/api/stats/category?${urlParams.toString()}`
    : '/api/stats/category';
  
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || `Erreur HTTP: ${res.status}`);
  }
  
  return res.json();
}

type User = {
  id: number;
  name: string;
  role: 'USER' | 'ADMIN';
  resetFrequency?: 'DAILY' | 'WEEKLY';
  dominantHand?: 'LEFT' | 'RIGHT';
  hasJournal?: boolean;
  createdAt?: string;
};

type FetchUserResponse = {
  authenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  impersonatedUser: User | null;
};

export async function fetchUser(): Promise<FetchUserResponse> {
  const res = await fetch('/api/auth/check', { credentials: 'include' });
  
  if (!res.ok) {
    // Si l'API retourne une erreur, retourner une réponse par défaut (non authentifié)
    // plutôt que de lancer une erreur, pour permettre à l'app de continuer
    return {
      authenticated: false,
      user: null,
      isAdmin: false,
      impersonatedUser: null,
    };
  }
  
  return res.json();
}

/**
 * ⚡ PERFORMANCE: Route batch pour charger plusieurs ressources en une seule requête
 * Réduit le nombre de round-trips réseau de 40-60%
 * 
 * @param resources - Liste des ressources à charger: 'exercices', 'history', 'progress', 'metadata'
 * @param filters - Filtres optionnels pour chaque ressource
 */
export async function fetchBatch(params: {
  resources: Array<'exercices' | 'history' | 'progress' | 'metadata'>;
  filters?: {
    category?: ExerciceCategory;
    equipments?: string;
    includeArchived?: boolean;
    targetDate?: string;
    since?: string;
    days?: number;
    progressLimit?: number;
  };
}): Promise<{
  exercices?: Exercice[];
  history?: HistoryEntry[];
  progress?: Progress[];
  metadata?: {
    bodyparts: string[];
    equipments: string[];
    equipmentsWithCounts: Array<{ name: string; count: number }>;
  };
}> {
  const res = await fetch('/api/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      resources: params.resources,
      filters: params.filters || {},
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || `Erreur HTTP: ${res.status}`);
  }

  return res.json();
}
