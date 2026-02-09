# Améliorations possibles pour TanStack Query

## 1. Optimisation des Query Keys - Éviter la duplication

### Problème actuel
Dans `useExercices`, le `targetDate` est calculé deux fois (dans `queryKey` et `queryFn`).

### Solution
Créer une fonction helper pour calculer les filtres une seule fois :

```typescript
// Dans useExercices.ts
const filters = useMemo(() => ({
  category,
  equipments,
  includeArchived,
  targetDate: isTimeMachineMode && referenceDate ? referenceDate.toISOString() : undefined,
}), [category, equipments, includeArchived, isTimeMachineMode, referenceDate]);

const { data: exercices = [], isLoading, error, refetch } = useQuery({
  queryKey: queryKeys.exercices.list(filters),
  queryFn: () => fetchExercices(filters),
  enabled: !!effectiveUser && !userLoading,
});
```

## 2. Améliorer la gestion d'erreur dans les mutations

### Problème actuel
Dans `useCompleteExercice` et `ExerciceForm`, pas de gestion d'erreur explicite dans `onError`.

### Solution
Ajouter `onError` pour afficher des messages d'erreur appropriés :

```typescript
const mutation = useMutation({
  mutationFn: async () => { /* ... */ },
  onSuccess: (data) => { /* ... */ },
  onError: (error) => {
    console.error('Erreur lors de la mise à jour:', error);
    // Optionnel : afficher un toast d'erreur
  },
});
```

## 3. Optimistic Updates améliorés

### Problème actuel
Dans `useCompleteExercice`, on invalide toutes les queries après la mutation, ce qui peut causer des requêtes inutiles.

### Solution
Utiliser des optimistic updates pour mettre à jour le cache immédiatement :

```typescript
const mutation = useMutation({
  mutationFn: async () => { /* ... */ },
  onMutate: async () => {
    // Annuler les requêtes en cours pour éviter les conflits
    await queryClient.cancelQueries({ queryKey: queryKeys.exercices.all });
    
    // Snapshot de la valeur précédente
    const previousExercices = queryClient.getQueryData<Exercice[]>(
      queryKeys.exercices.list(filters)
    );
    
    // Optimistic update
    queryClient.setQueryData<Exercice[]>(
      queryKeys.exercices.list(filters),
      (old) => {
        if (!old) return old;
        return old.map(ex => 
          ex.id === exercice.id 
            ? { ...ex, completed: !ex.completed, completedToday: !ex.completed }
            : ex
        );
      }
    );
    
    return { previousExercices };
  },
  onError: (err, variables, context) => {
    // Rollback en cas d'erreur
    if (context?.previousExercices) {
      queryClient.setQueryData(
        queryKeys.exercices.list(filters),
        context.previousExercices
      );
    }
  },
  onSuccess: (data) => { /* ... */ },
});
```

## 4. Utiliser `select` pour transformer les données

### Problème actuel
Dans `useCategoryStats`, on filtre les données dans un `useMemo` après le fetch.

### Solution
Utiliser `select` dans `useQuery` pour transformer directement :

```typescript
const { data: stats = initialStats, isLoading } = useQuery({
  queryKey: queryKeys.categoryStats.list({
    userId: userId!,
    resetFrequency,
    referenceDateKey,
  }),
  queryFn: () => fetchCategoryStats({ /* ... */ }),
  enabled: !!userId,
  select: (historyData) => {
    const newStats: Record<ExerciceCategory, number> = { ...initialStats };
    
    if (!historyData.length) return newStats;
    
    const referenceDateEnd = new Date(referenceDate);
    referenceDateEnd.setHours(23, 59, 59, 999);
    
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
  },
});
```

## 5. Améliorer le typage dans ExerciceForm

### Problème actuel
Utilisation de `any` pour `exerciceData` dans la mutation.

### Solution
Créer un type explicite :

```typescript
type ExerciceFormData = {
  name: string;
  description: {
    text: string;
    comment: string | null;
  };
  workout: {
    repeat: string | null;
    series: string | null;
    duration: string | null;
  };
  category: ExerciceCategory;
  bodyparts: string[];
  equipments: string[];
  media: MediaData | null;
  userId: number;
  createdAt?: string;
};

const createOrUpdateMutation = useMutation({
  mutationFn: async (exerciceData: ExerciceFormData) => { /* ... */ },
});
```

## 6. Optimiser les invalidations de cache

### Problème actuel
Dans `useCompleteExercice`, on invalide toutes les queries `exercices.all`, ce qui peut invalider des queries qui n'ont pas besoin d'être rafraîchies.

### Solution
Invalider seulement les queries concernées :

```typescript
// Au lieu de :
queryClient.invalidateQueries({ queryKey: queryKeys.exercices.all });

// Utiliser :
queryClient.invalidateQueries({ 
  queryKey: queryKeys.exercices.all,
  predicate: (query) => {
    // Invalider seulement les queries qui correspondent aux filtres actuels
    const queryKey = query.queryKey;
    // Logique de filtrage personnalisée
    return true; // ou logique plus précise
  },
});
```

## 7. Utiliser `refetchQueries` au lieu d'événements personnalisés

### Problème actuel
On utilise encore des événements personnalisés (`category-stats-refresh`, `exercice-completed-refresh`) alors que TanStack Query peut gérer ça nativement.

### Solution
Remplacer les événements par `refetchQueries` ou `invalidateQueries` :

```typescript
// Au lieu de :
window.dispatchEvent(new CustomEvent('category-stats-refresh'));

// Utiliser directement :
queryClient.invalidateQueries({ queryKey: queryKeys.categoryStats.all });
```

## 8. Ajouter des options de requête spécifiques

### Problème actuel
Toutes les queries utilisent les options par défaut du QueryClient.

### Solution
Ajouter des options spécifiques selon le type de données :

```typescript
// Pour les données qui changent rarement (equipments, metadata)
const { data } = useQuery({
  queryKey: queryKeys.equipments.all,
  queryFn: fetchEquipments,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
});

// Pour les données qui changent souvent (exercices, history)
const { data } = useQuery({
  queryKey: queryKeys.exercices.list(filters),
  queryFn: () => fetchExercices(filters),
  staleTime: 10000, // 10 secondes
  gcTime: 2 * 60 * 1000, // 2 minutes
});
```

## 9. Nettoyer les références à apiCache

### Problème actuel
`apiCache` est encore utilisé dans certains endroits (UserContext, TimeContext, etc.).

### Solution
Vérifier et supprimer les références inutiles, ou les remplacer par TanStack Query si nécessaire.

## 10. Ajouter TanStack Query DevTools en développement

### Solution
Ajouter les DevTools pour faciliter le debugging :

```typescript
// Dans QueryProvider.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({ /* ... */ }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

## 11. Utiliser `keepPreviousData` pour les transitions fluides

### Problème actuel
Quand on change de date en mode sablier, les données disparaissent puis réapparaissent.

### Solution
Utiliser `keepPreviousData` pour garder les anciennes données pendant le chargement :

```typescript
const { data: exercices = [], isLoading } = useQuery({
  queryKey: queryKeys.exercices.list(filters),
  queryFn: () => fetchExercices(filters),
  enabled: !!effectiveUser && !userLoading,
  placeholderData: (previousData) => previousData, // Garde les données précédentes
});
```

## 12. Optimiser les dépendances des hooks

### Problème actuel
Certaines dépendances dans `useCallback`/`useMemo` pourraient être optimisées.

### Solution
Vérifier et optimiser les dépendances pour éviter les re-créations inutiles.

## Priorités

1. **Haute priorité** :
   - Optimiser les query keys (éviter duplication)
   - Améliorer la gestion d'erreur dans les mutations
   - Utiliser `select` pour transformer les données

2. **Moyenne priorité** :
   - Optimistic updates améliorés
   - Optimiser les invalidations de cache
   - Ajouter TanStack Query DevTools

3. **Basse priorité** :
   - Nettoyer les références à apiCache
   - Utiliser `keepPreviousData` pour les transitions
   - Améliorer le typage dans ExerciceForm
