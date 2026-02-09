# Prompt : Implémentation de TanStack Query (React Query)

## Contexte

L'application Synapso utilise actuellement un système de cache manuel (`apiCache`) et des hooks personnalisés avec `useState` et `useEffect` pour gérer les données. La Phase 1 (migration de la date vers l'URL) est terminée. Ce prompt décrit la migration vers TanStack Query pour bénéficier d'un cache automatique et intelligent.

## Objectifs

1. **Remplacer le cache manuel** par TanStack Query
2. **Simplifier les hooks** en utilisant `useQuery` et `useMutation`
3. **Conserver la compatibilité** avec le système URL-based date
4. **Maintenir les performances** actuelles
5. **Améliorer la réactivité** avec l'invalidation automatique du cache

## Architecture cible

### Structure des données

```
QueryClient (global)
├── Queries (lecture)
│   ├── exercices (avec filtres: category, equipments, date)
│   ├── history (avec paramètre: since, days)
│   ├── progress (avec paramètre: limit)
│   ├── categoryStats (avec paramètre: userId, resetFrequency, date)
│   ├── todayCompletedCount (avec paramètre: date)
│   ├── equipments
│   ├── equipmentMetadata
│   ├── journalNotes
│   ├── journalTasks
│   └── journalProgress
│
└── Mutations (écriture)
    ├── completeExercice
    ├── createExercice
    ├── updateExercice
    ├── deleteExercice
    ├── archiveExercice
    ├── pinExercice
    ├── createProgress
    ├── updateProgress
    └── deleteProgress
```

## Étapes d'implémentation

### Étape 1 : Installation et configuration

#### 1.1 Installer TanStack Query

```bash
npm install @tanstack/react-query
```

**Version à utiliser** : `^5.x` (dernière version stable)

#### 1.2 Créer le QueryClientProvider

**Fichier** : `src/app/providers/QueryProvider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

export function QueryProvider({ children }: PropsWithChildren) {
  // ⚡ PERFORMANCE: Créer le QueryClient une seule fois (singleton)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // ⚡ CACHE: Données considérées "fraîches" pendant 30 secondes
        staleTime: 30000,
        // ⚡ CACHE: Garder les données en cache pendant 5 minutes
        gcTime: 5 * 60 * 1000, // (anciennement cacheTime)
        // ⚡ REFETCH: Ne pas refetch automatiquement au focus (évite les requêtes inutiles)
        refetchOnWindowFocus: false,
        // ⚡ REFETCH: Ne pas refetch automatiquement au reconnect (évite les requêtes inutiles)
        refetchOnReconnect: false,
        // ⚡ RETRY: Retry automatique en cas d'erreur (2 tentatives)
        retry: 2,
        // ⚡ RETRY: Délai entre les tentatives (1 seconde)
        retryDelay: 1000,
      },
      mutations: {
        // ⚡ RETRY: Ne pas retry les mutations (erreurs immédiates)
        retry: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### 1.3 Intégrer le QueryProvider dans le layout

**Fichier** : `src/app/layout.tsx`

Ajouter `QueryProvider` **avant** `SelectedDateProvider` et `TimeProvider` :

```typescript
import { QueryProvider } from '@/app/providers/QueryProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <QueryProvider>
          <UserProvider>
            <SelectedDateProvider>
              <TimeProvider>
                {/* ... autres providers ... */}
                {children}
              </TimeProvider>
            </SelectedDateProvider>
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Étape 2 : Créer des fonctions de fetch réutilisables

**Fichier** : `src/app/lib/api-queries.ts`

Créer des fonctions pures pour les appels API (séparer la logique de fetch de la logique React) :

```typescript
import type { Exercice } from '@/app/types';
import type { HistoryEntry } from '@/app/types';
import type { Progress } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';

// ⚡ QUERY KEYS: Centraliser les clés de requête pour éviter les erreurs de typo
export const queryKeys = {
  exercices: {
    all: ['exercices'] as const,
    lists: () => [...queryKeys.exercices.all, 'list'] as const,
    list: (filters: {
      category?: ExerciceCategory;
      equipments?: string[];
      includeArchived?: boolean;
      targetDate?: string; // ISO string
    }) => [...queryKeys.exercices.lists(), filters] as const,
  },
  history: {
    all: ['history'] as const,
    lists: () => [...queryKeys.history.all, 'list'] as const,
    list: (params: { since?: string; days?: number }) => 
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
  journalTasks: {
    all: ['journalTasks'] as const,
  },
  journalProgress: {
    all: ['journalProgress'] as const,
    lists: () => [...queryKeys.journalProgress.all, 'list'] as const,
    list: (userId: number) => [...queryKeys.journalProgress.lists(), userId] as const,
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
  
  return res.json();
}

export async function fetchHistory(params: { since?: string; days?: number }): Promise<HistoryEntry[]> {
  const url = params.days !== null 
    ? `/api/history?since=${encodeURIComponent(subDays(new Date(), params.days || 40).toISOString())}`
    : '/api/history';
  
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
  const { getStartOfPeriod } = await import('@/app/utils/resetFrequency.utils');
  const periodDate = getStartOfPeriod(params.resetFrequency, new Date(params.referenceDateKey + 'T00:00:00'));
  const sinceParam = periodDate.toISOString();
  const url = `/api/history?since=${encodeURIComponent(sinceParam)}`;
  
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  return res.json();
}

export async function fetchTodayCompletedCount(params: {
  userId: number;
  dateKey: string | null;
}): Promise<number> {
  const urlParams = new URLSearchParams();
  if (params.dateKey) {
    const targetDate = new Date(params.dateKey + 'T00:00:00');
    urlParams.append('targetDate', targetDate.toISOString());
  }
  
  const url = urlParams.toString() 
    ? `/api/exercices?${urlParams.toString()}`
    : `/api/exercices`;
  
  const res = await fetch(url, { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  const exercices = await res.json();
  
  if (!Array.isArray(exercices)) {
    return 0;
  }
  
  // Filtrer les exercices complétés pour la date concernée
  if (params.dateKey) {
    return exercices.filter((ex: { completedToday?: boolean }) => ex.completedToday === true).length;
  } else {
    const { isCompletedToday } = await import('@/app/utils/resetFrequency.utils');
    return exercices.filter((ex: { completedAt?: string | Date | null }) => {
      if (!ex.completedAt) return false;
      const completedDate = ex.completedAt instanceof Date ? ex.completedAt : new Date(ex.completedAt);
      return isCompletedToday(completedDate);
    }).length;
  }
}

export async function fetchEquipments(): Promise<string[]> {
  const res = await fetch('/api/equipments', { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  const data = await res.json();
  return data.equipments || [];
}

export async function fetchEquipmentMetadata(): Promise<Record<string, { icon: string; category: string }>> {
  const res = await fetch('/api/equipments/metadata', { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  return res.json();
}

export async function fetchJournalNotes(): Promise<JournalNote[]> {
  const res = await fetch('/api/journal/notes', { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchJournalTasks(): Promise<JournalTask[]> {
  const res = await fetch('/api/journal/tasks', { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchJournalProgress(userId: number): Promise<JournalProgress[]> {
  const res = await fetch(`/api/journal/progress?userId=${userId}`, { credentials: 'include' });
  
  if (!res.ok) {
    throw new Error(`Erreur HTTP: ${res.status}`);
  }
  
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
```

### Étape 3 : Migrer les hooks de fetch vers useQuery

#### 3.1 Migrer `useExercices`

**Fichier** : `src/app/hooks/useExercices.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchExercices } from '@/app/lib/api-queries';
import type { Exercice } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';

type UseExercicesOptions = {
  category?: ExerciceCategory;
  equipments?: string[];
  includeArchived?: boolean;
};

type UseExercicesReturn = {
  exercices: Exercice[];
  loading: boolean;
  error: Error | null;
  updateExercice: (updatedExercice: Exercice) => void;
};

export function useExercices({ category, equipments, includeArchived }: UseExercicesOptions = {}): UseExercicesReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const { isTimeMachineMode, referenceDate } = useTimeContext();
  
  // ⚡ TANSTACK QUERY: Utiliser useQuery pour gérer le fetch et le cache
  const { data: exercices = [], isLoading, error } = useQuery({
    queryKey: queryKeys.exercices.list({
      category,
      equipments,
      includeArchived,
      targetDate: isTimeMachineMode && referenceDate ? referenceDate.toISOString() : undefined,
    }),
    queryFn: () => fetchExercices({
      category,
      equipments,
      includeArchived,
      targetDate: isTimeMachineMode && referenceDate ? referenceDate.toISOString() : undefined,
    }),
    enabled: !!effectiveUser && !userLoading, // Ne pas fetch si pas d'utilisateur
  });

  // ⚡ OPTIMISTIC UPDATE: Mettre à jour le cache localement pour une UI réactive
  const queryClient = useQueryClient();
  const updateExercice = useCallback((updatedExercice: Exercice) => {
    queryClient.setQueryData<Exercice[]>(
      queryKeys.exercices.list({
        category,
        equipments,
        includeArchived,
        targetDate: isTimeMachineMode && referenceDate ? referenceDate.toISOString() : undefined,
      }),
      (old) => {
        if (!old) return [updatedExercice];
        return old.map(ex => ex.id === updatedExercice.id ? updatedExercice : ex);
      }
    );
  }, [category, equipments, includeArchived, isTimeMachineMode, referenceDate, queryClient]);

  return {
    exercices,
    loading: isLoading || userLoading,
    error: error as Error | null,
    updateExercice,
  };
}
```

#### 3.2 Migrer `useHistory`

**Fichier** : `src/app/hooks/useHistory.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';
import type { HistoryEntry } from '@/app/types';
import { subDays } from 'date-fns';

type UseHistoryOptions = {
  days?: number;
};

type UseHistoryReturn = {
  history: HistoryEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { days = 40 } = options;
  const { effectiveUser, loading: userLoading } = useUser();

  const { data: history = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.history.list({ days }),
    queryFn: () => fetchHistory({ days }),
    enabled: !!effectiveUser && !userLoading,
  });

  return {
    history,
    loading: isLoading || userLoading,
    error: error as Error | null,
    refetch: () => { refetch(); },
  };
}
```

#### 3.3 Migrer `useProgress`

**Fichier** : `src/app/hooks/useProgress.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchProgress } from '@/app/lib/api-queries';
import type { Progress } from '@/app/types';
import { useEffect } from 'react';

type UseProgressOptions = {
  limit?: number;
};

type UseProgressReturn = {
  progressList: Progress[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

const PROGRESS_REFRESH_EVENT = 'progress-refresh';

export function triggerProgressRefresh(): void {
  window.dispatchEvent(new CustomEvent(PROGRESS_REFRESH_EVENT));
}

export function useProgress(options: UseProgressOptions = {}): UseProgressReturn {
  const { limit } = options;
  const { effectiveUser, loading: userLoading } = useUser();

  const { data: progressList = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.progress.list({ limit }),
    queryFn: () => fetchProgress({ limit }),
    enabled: !!effectiveUser && !userLoading,
  });

  // ⚡ EVENT-DRIVEN: Écouter les événements de rafraîchissement
  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };

    window.addEventListener(PROGRESS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(PROGRESS_REFRESH_EVENT, handleRefresh);
    };
  }, [refetch]);

  return {
    progressList,
    loading: isLoading || userLoading,
    error: error as Error | null,
    refetch: () => { refetch(); },
  };
}
```

#### 3.4 Migrer `useCategoryStats`

**Fichier** : `src/app/hooks/useCategoryStats.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchCategoryStats } from '@/app/lib/api-queries';
import type { HistoryEntry } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useEffect } from 'react';

type ResetFrequency = 'DAILY' | 'WEEKLY';

interface UseCategoryStatsOptions {
  userId: number | null;
  resetFrequency?: ResetFrequency;
}

interface UseCategoryStatsReturn {
  stats: Record<ExerciceCategory, number>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const initialStats: Record<ExerciceCategory, number> = {
  UPPER_BODY: 0,
  LOWER_BODY: 0,
  STRETCHING: 0,
  CORE: 0,
};

export function useCategoryStats({ 
  userId, 
  resetFrequency = 'DAILY' 
}: UseCategoryStatsOptions): UseCategoryStatsReturn {
  const { referenceDateKey } = useTimeContext();
  const { data: historyData = [], isLoading } = useQuery({
    queryKey: queryKeys.categoryStats.list({
      userId: userId!,
      resetFrequency,
      referenceDateKey,
    }),
    queryFn: () => fetchCategoryStats({
      userId: userId!,
      resetFrequency,
      referenceDateKey,
    }),
    enabled: !!userId,
  });

  // ⚡ CLIENT-SIDE FILTERING: Filtrer les données jusqu'à referenceDate
  const stats = useMemo(() => {
    const newStats: Record<ExerciceCategory, number> = { ...initialStats };
    
    if (!historyData.length) return newStats;
    
    const referenceDateEnd = new Date(referenceDateKey + 'T23:59:59');
    
    const filteredData = historyData.filter((entry: HistoryEntry) => {
      const entryDate = new Date(entry.completedAt);
      return entryDate <= referenceDateEnd;
    });
    
    filteredData.forEach((entry: HistoryEntry) => {
      const category = entry.exercice.category;
      if (category && category in newStats) {
        newStats[category as ExerciceCategory]++;
      }
    });
    
    return newStats;
  }, [historyData, referenceDateKey]);

  // ⚡ EVENT-DRIVEN: Écouter les événements de rafraîchissement
  const queryClient = useQueryClient();
  useEffect(() => {
    const handleRefresh = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categoryStats.list({
          userId: userId!,
          resetFrequency,
          referenceDateKey,
        }),
      });
    };

    window.addEventListener('category-stats-refresh', handleRefresh);
    return () => {
      window.removeEventListener('category-stats-refresh', handleRefresh);
    };
  }, [userId, resetFrequency, referenceDateKey, queryClient]);

  return {
    stats,
    loading: isLoading,
    refresh: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categoryStats.list({
          userId: userId!,
          resetFrequency,
          referenceDateKey,
        }),
      });
    },
  };
}
```

#### 3.5 Migrer `useTodayCompletedCount`

**Fichier** : `src/app/hooks/useTodayCompletedCount.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { queryKeys, fetchTodayCompletedCount } from '@/app/lib/api-queries';
import { useEffect } from 'react';

const REFRESH_EVENT = 'exercice-completed-refresh';

export function triggerCompletedCountRefresh() {
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
}

export function useTodayCompletedCount() {
  const { effectiveUser } = useUser();
  const { selectedDateKey } = useSelectedDate();

  const { data: completedToday = null } = useQuery({
    queryKey: queryKeys.todayCompletedCount.list({
      userId: effectiveUser?.id || 0,
      dateKey: selectedDateKey,
    }),
    queryFn: () => fetchTodayCompletedCount({
      userId: effectiveUser!.id,
      dateKey: selectedDateKey,
    }),
    enabled: !!effectiveUser,
  });

  // ⚡ EVENT-DRIVEN: Écouter les événements de rafraîchissement
  const queryClient = useQueryClient();
  useEffect(() => {
    const handleRefresh = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todayCompletedCount.list({
          userId: effectiveUser?.id || 0,
          dateKey: selectedDateKey,
        }),
      });
    };

    window.addEventListener(REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(REFRESH_EVENT, handleRefresh);
    };
  }, [effectiveUser?.id, selectedDateKey, queryClient]);

  return completedToday;
}
```

### Étape 4 : Migrer les mutations

#### 4.1 Migrer `useCompleteExercice`

**Fichier** : `src/app/hooks/useCompleteExercice.ts`

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Exercice } from '@/app/types';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys } from '@/app/lib/api-queries';
import { triggerCompletedCountRefresh } from '@/app/hooks/useTodayCompletedCount';

type UseCompleteExerciceOptions = {
  exercice: Exercice;
  userId: number;
  onCompleted?: (updatedExercice: Exercice) => void;
  refreshHistory?: () => void;
};

type UseCompleteExerciceReturn = {
  handleComplete: (e: React.MouseEvent) => Promise<void>;
  isCompleting: boolean;
  showSuccess: boolean;
};

export function useCompleteExercice({
  exercice,
  userId,
  onCompleted,
  refreshHistory,
}: UseCompleteExerciceOptions): UseCompleteExerciceReturn {
  const { selectedDate, selectedDateKey } = useSelectedDate();
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const fetchOptions: RequestInit = {
        method: 'PATCH',
        credentials: 'include',
      };
      
      if (selectedDate) {
        fetchOptions.headers = {
          'Content-Type': 'application/json',
        };
        fetchOptions.body = JSON.stringify({ completedAt: selectedDate.toISOString() });
      }
      
      const response = await fetch(`/api/exercices/${exercice.id}/complete?userId=${userId}`, fetchOptions);

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const wasCompletedToday = exercice.completedToday;
      
      const updatedExercice: Exercice = {
        ...exercice,
        completed: data.completed,
        completedToday: data.completedToday ?? false,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        weeklyCompletions: data.weeklyCompletions || exercice.weeklyCompletions,
      };

      if (!wasCompletedToday && updatedExercice.completedToday) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }

      if (onCompleted) {
        onCompleted(updatedExercice);
      }

      // ⚡ CACHE INVALIDATION: Invalider les queries concernées
      queryClient.invalidateQueries({ queryKey: queryKeys.exercices.all });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.todayCompletedCount.list({
          userId: effectiveUser?.id || 0,
          dateKey: selectedDateKey,
        }),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
      
      // Déclencher les événements de rafraîchissement
      triggerCompletedCountRefresh();
      window.dispatchEvent(new CustomEvent('category-stats-refresh'));
      
      if (refreshHistory) {
        refreshHistory();
      }
    },
  });

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    await mutation.mutateAsync();
  };

  return {
    handleComplete,
    isCompleting: mutation.isPending,
    showSuccess,
  };
}
```

#### 4.2 Migrer `ExerciceForm` pour utiliser des mutations

**Fichier** : `src/app/components/ExerciceForm.tsx`

Ajouter les mutations pour créer/éditer/supprimer :

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { queryKeys } from '@/app/lib/api-queries';
import { triggerCompletedCountRefresh } from '@/app/hooks/useTodayCompletedCount';
import { useHistoryContext } from '@/app/contexts/HistoryContext';

// ... (autres imports)

export function ExerciceForm({ exerciceId, onSuccess, onCancel, initialCategory }: Props) {
  const { effectiveUser } = useUser();
  const { selectedDate, isDateSelected, selectedDateKey } = useSelectedDate();
  const queryClient = useQueryClient();
  const { refreshHistory } = useHistoryContext();

  // ⚡ MUTATION: Créer ou éditer un exercice
  const createOrUpdateMutation = useMutation({
    mutationFn: async (exerciceData: any) => {
      const url = exerciceId ? `/api/exercices/${exerciceId}` : '/api/exercices';
      const method = exerciceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(exerciceData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      return response.json();
    },
    onSuccess: () => {
      // ⚡ CACHE INVALIDATION: Invalider les queries concernées
      queryClient.invalidateQueries({ queryKey: queryKeys.exercices.all });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.todayCompletedCount.list({
          userId: effectiveUser?.id || 0,
          dateKey: selectedDateKey,
        }),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
      
      triggerCompletedCountRefresh();
      window.dispatchEvent(new CustomEvent('category-stats-refresh'));
      refreshHistory();

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  // ⚡ MUTATION: Supprimer un exercice
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/exercices/${exerciceId}?userId=${effectiveUser?.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      // ⚡ CACHE INVALIDATION: Invalider les queries concernées
      queryClient.invalidateQueries({ queryKey: queryKeys.exercices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.todayCompletedCount.list({
          userId: effectiveUser?.id || 0,
          dateKey: selectedDateKey,
        }),
      });
      
      triggerCompletedCountRefresh();
      window.dispatchEvent(new CustomEvent('category-stats-refresh'));
      refreshHistory();

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUser) {
      setError('Utilisateur non défini');
      return;
    }

    if (!formData.name.trim()) {
      setError('Le nom de l\'exercice est obligatoire');
      return;
    }
    
    setError('');

    let createdAtDate: string | undefined;
    if (isDateSelected && selectedDate && !exerciceId) {
      const dateAtNoon = setSeconds(setMinutes(setHours(new Date(selectedDate), 12), 0), 0);
      createdAtDate = dateAtNoon.toISOString();
    }

    const exerciceData = {
      name: formData.name,
      description: {
        text: formData.descriptionText,
        comment: formData.descriptionComment || null,
      },
      workout: {
        repeat: formData.workoutRepeat || null,
        series: formData.workoutSeries || null,
        duration: formData.workoutDuration || null,
      },
      category: formData.category,
      bodyparts: formData.bodyparts,
      equipments: formData.equipments,
      media: formData.media,
      userId: effectiveUser.id,
      ...(createdAtDate && { createdAt: createdAtDate }),
    };

    createOrUpdateMutation.mutate(exerciceData);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    if (!effectiveUser) {
      setError('Utilisateur non défini');
      return;
    }

    setError('');
    deleteMutation.mutate();
  };

  // ... (reste du composant)
}
```

### Étape 5 : Supprimer le système de cache manuel

Une fois toutes les migrations terminées :

1. **Supprimer `apiCache`** : `src/app/utils/api-cache.utils.ts` (ou le garder pour d'autres usages si nécessaire)
2. **Nettoyer les imports** : Retirer tous les imports de `apiCache` dans les hooks migrés
3. **Supprimer les événements personnalisés** : Remplacer par `queryClient.invalidateQueries()`

### Étape 6 : Tests et validation

#### Checklist de validation

- [ ] Tous les hooks de fetch utilisent `useQuery`
- [ ] Toutes les mutations utilisent `useMutation`
- [ ] Le cache se met à jour automatiquement après les mutations
- [ ] Les données se rafraîchissent correctement en mode sablier
- [ ] Les performances sont maintenues (pas de régression)
- [ ] Les erreurs sont gérées correctement
- [ ] Le loading state fonctionne correctement
- [ ] Les données sont partagées entre les composants (même queryKey = même cache)

## Avantages de la migration

1. **Cache automatique** : Plus besoin de gérer manuellement le cache
2. **Moins de code** : Réduction du boilerplate dans les hooks
3. **Réactivité améliorée** : Invalidation automatique du cache
4. **Gestion d'erreur** : Gestion automatique des erreurs et retry
5. **Performance** : Cache intelligent avec staleTime et gcTime
6. **DevTools** : TanStack Query DevTools pour le debugging

## Précautions

1. **Migration progressive** : Migrer un hook à la fois pour éviter les régressions
2. **Tests** : Tester chaque hook migré individuellement
3. **Compatibilité** : S'assurer que le système URL-based date fonctionne toujours
4. **Performance** : Vérifier que les performances ne régressent pas
5. **Cache** : Configurer correctement `staleTime` et `gcTime` selon les besoins

## Notes importantes

- **Query Keys** : Utiliser les query keys centralisées pour éviter les erreurs
- **Enabled** : Utiliser `enabled` pour éviter les requêtes inutiles
- **Invalidation** : Invalider les queries concernées après les mutations
- **Optimistic Updates** : Utiliser `setQueryData` pour des mises à jour optimistes si nécessaire
- **Events** : Garder les événements personnalisés pour la compatibilité avec les anciens composants (transition)

## Prochaines étapes après la migration

1. **Supprimer `apiCache`** si plus utilisé
2. **Nettoyer les événements personnalisés** si remplacés par `invalidateQueries`
3. **Optimiser les query keys** pour éviter les requêtes dupliquées
4. **Ajouter TanStack Query DevTools** en développement pour le debugging
