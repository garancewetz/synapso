# Refonte du mode sablier - Architecture robuste

## Problèmes identifiés

### 1. Fragilité de l'état
- **Problème** : Quand on change de jour sélectionné, les progressions ne se mettent pas toujours à jour de manière réactive
- **Cause** : Les hooks dépendent de `selectedDate` mais les dépendances peuvent ne pas déclencher de re-render si la référence de l'objet Date ne change pas
- **Impact** : L'utilisateur voit des données obsolètes ou incohérentes

### 2. Visibilité insuffisante du mode sablier
- **Problème** : La welcome card ne montre pas clairement à quel moment du temps on est
- **Cause actuelle** : La date est affichée dans le texte de salutation (`"Bonjour, [nom] ([date])"`) mais ce n'est pas assez visible
- **Impact** : L'utilisateur peut oublier qu'il est en mode sablier et être confus

### 3. Absence d'indicateur visuel dans le heatmap
- **Problème** : Le heatmap ne montre pas visuellement quel jour est sélectionné en mode sablier
- **Cause** : Seul "aujourd'hui" est mis en évidence (ring emerald), pas le jour sélectionné
- **Impact** : L'utilisateur ne sait pas visuellement quel jour il a sélectionné dans le calendrier

## Architecture proposée

### Principe : Source unique de vérité + Réactivité garantie + Wrapper temporel

**0. Créer un Wrapper Temporel (TimeContext) - NOUVEAU ⭐**
- **Concept** : Un contexte qui gère l'état temporel de toute l'application
- **Par défaut** : `referenceDate = aujourd'hui`
- **Mode sablier** : `referenceDate = date sélectionnée`
- **Avantages** :
  - ✅ Tous les composants consomment une seule source de vérité
  - ✅ Plus besoin de répéter la logique "si mode sablier alors date sélectionnée sinon aujourd'hui"
  - ✅ Cohérence garantie : tous les composants utilisent la même date de référence
  - ✅ Performance : calcul de la date de référence une seule fois
  - ✅ Simplicité : `const { referenceDate } = useTimeContext()` partout

**1. Centraliser l'état du mode sablier dans `SelectedDateContext`**
- Ajouter une clé stable (`selectedDateKey`) qui change systématiquement quand la date change
- Exposer cette clé pour que tous les hooks puissent s'y abonner
- Garantir que tous les composants se mettent à jour quand la date change

**2. Améliorer la visibilité dans la Welcome Card**
- Ajouter un badge/indicateur visuel proéminent en mode sablier
- Afficher clairement la date sélectionnée avec emoji sablier ⏳
- Peut-être un bandeau coloré dans la carte elle-même

**3. Indicateur visuel dans le heatmap**
- Ajouter un sablier ⏳ sur le jour sélectionné dans le heatmap
- Utiliser un style distinct (bordure amber, sablier en overlay)
- Remplacer ou compléter l'indicateur "Auj." par un indicateur de date sélectionnée

## Implémentation détaillée

### 0. Créer un TimeContext (Wrapper Temporel) - NOUVEAU ⭐

**Fichier** : `src/app/contexts/TimeContext.tsx` (nouveau fichier)

**Concept** : Wrapper qui gère la date de référence pour toute l'application.

**Par défaut** : `referenceDate = aujourd'hui` (normalisé à minuit)
**Mode sablier** : `referenceDate = date sélectionnée` (normalisé à minuit)

**Avantages** :
- ✅ Tous les composants utilisent `useTimeContext()` au lieu de répéter la logique
- ✅ Cohérence garantie : une seule source de vérité pour la date de référence
- ✅ Performance : calcul une seule fois, mémorisé
- ✅ Simplicité : Plus besoin de `isDateSelected && selectedDate ? selectedDate : today` partout

**Implémentation** :

```typescript
'use client';

import { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { useSelectedDate } from './SelectedDateContext';

type TimeContextType = {
  referenceDate: Date; // Date de référence (aujourd'hui ou date sélectionnée)
  referenceDateKey: string; // Clé stable (yyyy-MM-dd) pour réactivité
  isTimeMachineMode: boolean; // Mode sablier actif
  isToday: boolean; // Est-ce que referenceDate = aujourd'hui ?
};

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: PropsWithChildren) {
  // ⚡ PERFORMANCE: Utiliser selectedDateKey directement (pas selectedDate)
  // Évite les recalculs de toDateString() et garantit des dépendances stables
  const { selectedDateKey, isTimeMachineMode } = useSelectedDate();

  // Calculer la date de référence UNE SEULE FOIS avec dépendances stables
  const timeContextValue = useMemo<TimeContextType>(() => {
    // Par défaut : aujourd'hui
    let referenceDate = new Date();
    referenceDate.setHours(0, 0, 0, 0);
    let referenceDateKey = referenceDate.toISOString().split('T')[0];
    
    // Mode sablier : utiliser la date sélectionnée
    if (isTimeMachineMode && selectedDateKey) {
      // ⚡ PERFORMANCE: Construire la date depuis la clé (plus rapide que startOfDay)
      referenceDate = new Date(selectedDateKey + 'T00:00:00');
      referenceDateKey = selectedDateKey;
    }
    
    // ⚡ PERFORMANCE: isToday calculé sans appel à date-fns (plus rapide)
    const isTodayValue = !isTimeMachineMode;
    
    return {
      referenceDate,
      referenceDateKey,
      isTimeMachineMode,
      isToday: isTodayValue,
    };
  }, [isTimeMachineMode, selectedDateKey]); // Dépendances minimales et stables (strings)

  return (
    <TimeContext.Provider value={timeContextValue}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTimeContext() {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTimeContext must be used within a TimeProvider');
  }
  return context;
}
```

**Intégration dans le layout** :

```typescript
// Dans layout.tsx
<SelectedDateProvider>
  <TimeProvider>
    {/* Tous les composants peuvent maintenant utiliser useTimeContext() */}
    {children}
  </TimeProvider>
</SelectedDateProvider>
```

**Usage dans les composants** :

```typescript
// AVANT (logique répétée partout)
const { selectedDate, isDateSelected } = useSelectedDate();
const referenceDate = useMemo(() => {
  if (isDateSelected && selectedDate && !isToday(selectedDate)) {
    return selectedDate;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}, [isDateSelected, selectedDate]);

// APRÈS (simple et cohérent)
const { referenceDate, referenceDateKey, isTimeMachineMode } = useTimeContext();
```

**Migration** :
- Remplacer tous les `referenceDate` calculés localement par `useTimeContext()`
- Simplifier tous les hooks qui calculent la date de référence
- Garantir la cohérence : tous utilisent la même date

### 1. Améliorer `SelectedDateContext` - Clé stable réactive

**Fichier** : `src/app/contexts/SelectedDateContext.tsx`

**Modifications** :
- Exposer `selectedDateKey` (string format `yyyy-MM-dd`) dans le contexte
- Cette clé change systématiquement quand la date change, même si l'objet Date a la même référence
- Tous les hooks peuvent utiliser cette clé dans leurs dépendances pour garantir la réactivité

```typescript
type SelectedDateContextType = {
  selectedDate: Date | null;
  selectedDateKey: string | null; // NOUVEAU : Clé stable pour réactivité
  setSelectedDate: (date: Date | null) => void;
  clearSelectedDate: () => void;
  isDateSelected: boolean;
  isTimeMachineMode: boolean; // NOUVEAU : Mode sablier actif (date passée)
};
```

**Avantages** :
- Réactivité garantie : tous les hooks se mettent à jour quand `selectedDateKey` change
- Performance : comparaison de string au lieu d'objet Date
- Simplicité : une seule source de vérité

### 2. Badge sablier dans WelcomeHeader

**Fichier** : `src/app/components/WelcomeHeader.tsx` ou `WelcomeHeaderGreeting.tsx`

**Modifications** :
- Ajouter un badge proéminent en mode sablier
- Style : fond amber, bordure, emoji sablier ⏳, date formatée
- Position : En haut de la carte, bien visible

**Exemple de design** :
```
┌─────────────────────────────────────┐
│ [⏳ Mode sablier - 11 déc. 2024]   │  ← Badge amber proéminent
│                                     │
│ Bonjour, [nom]                      │
│ Objectif du 11 déc. 2024           │
│ [===    ] 3/5                       │
│                                     │
│ [Calendrier semaine]                │
└─────────────────────────────────────┘
```

**Code proposé** :
```typescript
// Dans WelcomeHeader.tsx
const { isTimeMachineMode, selectedDate } = useSelectedDate();

{isTimeMachineMode && selectedDate && (
  <div className="mb-3 px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-lg flex items-center gap-2">
    <span className="text-xl">{NAVIGATION_EMOJIS.HOURGLASS}</span>
    <span className="text-sm font-bold text-amber-900">
      Mode sablier - {formatShortDate(selectedDate)}
    </span>
  </div>
)}
```

### 3. Indicateur sablier dans ActivityHeatmapCell

**Fichier** : `src/app/components/historique/ActivityHeatmapCell.tsx`

**Modifications** :
- Détecter si le jour est sélectionné en mode sablier
- Afficher un sablier ⏳ en overlay ou en remplacement de l'icône
- Style distinct : bordure amber, fond amber léger, sablier visible

**Code proposé** :
```typescript
// Dans ActivityHeatmapCell.tsx
const { selectedDate, isTimeMachineMode } = useSelectedDate();
const isSelectedDay = isTimeMachineMode && selectedDate && day.date 
  ? format(startOfDay(selectedDate), 'yyyy-MM-dd') === day.dateKey
  : false;

// Dans le rendu
{isSelectedDay && (
  <span className="absolute inset-0 flex items-center justify-center bg-amber-400/20 rounded-xl border-2 border-amber-500">
    <span className="text-2xl">{NAVIGATION_EMOJIS.HOURGLASS}</span>
  </span>
)}
```

### 4. Améliorer la réactivité de `useTodayCompletedCount`

**Fichier** : `src/app/hooks/useTodayCompletedCount.ts`

**Modifications** :
- Utiliser `selectedDateKey` au lieu de `selectedDate` dans les dépendances
- Garantir que le hook se met à jour systématiquement quand la date change

**Code proposé** :
```typescript
const { selectedDate, selectedDateKey, isDateSelected } = useSelectedDate();

const fetchCompletedCount = useCallback(() => {
  // ... logique existante
}, [effectiveUser?.id, isDateSelected, selectedDateKey]); // Utiliser selectedDateKey
```

### 5. Améliorer la réactivité de `WelcomeHeaderWrapper`

**Fichier** : `src/app/components/WelcomeHeaderWrapper.tsx`

**Modifications** :
- Utiliser `selectedDateKey` pour déclencher les recalculs
- S'assurer que `weekData` se met à jour quand on change de jour en mode sablier
- Filtrer l'historique par date sélectionnée si nécessaire

**Code proposé** :
```typescript
const { selectedDate, selectedDateKey, isTimeMachineMode } = useSelectedDate();

// Filtrer l'historique si en mode sablier
const filteredHistory = useMemo(() => {
  if (!isTimeMachineMode || !selectedDate) {
    return history;
  }
  const selectedDateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
  return history.filter(entry => {
    const entryDateKey = format(startOfDay(new Date(entry.completedAt)), 'yyyy-MM-dd');
    return entryDateKey <= selectedDateKey;
  });
}, [history, isTimeMachineMode, selectedDateKey]);

const weekData = useMemo(() => {
  const frequency = resetFrequency || 'DAILY';
  const referenceDate = isTimeMachineMode && selectedDate ? selectedDate : today;
  return frequency === 'WEEKLY' 
    ? getCurrentWeekData(filteredHistory, referenceDate)
    : getLast7DaysData(filteredHistory, referenceDate);
}, [historyKey, resetFrequency, isTimeMachineMode, selectedDateKey]);
```

## Ordre d'implémentation recommandé

### Phase 0 : Wrapper Temporel (Architecture) - PRIORITÉ ⭐
1. ✅ Créer `TimeContext` avec `TimeProvider` et `useTimeContext()` (version optimisée avec `selectedDateKey`)
2. ✅ Intégrer `TimeProvider` dans le layout (après `SelectedDateProvider`)
3. ✅ Migrer progressivement les composants pour utiliser `useTimeContext()`
4. ✅ Tester que tous les composants utilisent la même date de référence

### Phase 0.5 : Optimisations critiques (Performance) - PRIORITÉ ⚡
5. ✅ Indexer l'historique par dateKey (pré-calculer les dateKeys)
6. ✅ Optimiser le filtrage avec index (3-5x plus rapide)
7. ✅ Précharger les jours adjacents en arrière-plan
8. ✅ Ajouter debouncing séparé (UI vs calculs) dans `SelectedDateContext`
9. ✅ Utiliser `startTransition` pour les calculs non-urgents

### Phase 1 : Fondations (Réactivité)
10. ✅ Améliorer `SelectedDateContext` avec `selectedDateKey` et `isTimeMachineMode`
11. ✅ Mettre à jour tous les hooks pour utiliser `selectedDateKey`
12. ✅ Optimiser `React.memo` avec comparaison de strings
13. ✅ Tester que les progressions se mettent à jour quand on change de jour

### Phase 2 : Visibilité (UX)
14. ✅ Ajouter le badge sablier dans `WelcomeHeader`
15. ✅ Ajouter l'indicateur sablier dans `ActivityHeatmapCell`
16. ✅ Tester que l'utilisateur comprend clairement qu'il est en mode sablier

### Phase 3 : Cohérence (Données)
17. ✅ Filtrer l'historique dans `WelcomeHeaderWrapper` en mode sablier
18. ✅ S'assurer que tous les graphiques et statistiques sont cohérents
19. ✅ Tests finaux de cohérence temporelle

## Optimisations de performance (CRITIQUE)

### Principe : Changement de jour = instantané et fluide

Le mode sablier doit être **ultra-rapide** : quand l'utilisateur change de jour, tout doit se mettre à jour **instantanément** sans lag ni freeze.

### 1. Éviter les requêtes API inutiles

**Problème** : Chaque changement de jour déclenche une nouvelle requête API pour récupérer les exercices.

**Solution** : Cache intelligent avec invalidation sélective

```typescript
// Dans useTodayCompletedCount.ts
const fetchCompletedCount = useCallback(() => {
  // Vérifier le cache AVANT de faire la requête
  const cacheKey = `completed-count-${effectiveUser?.id}-${selectedDateKey || 'today'}`;
  const cached = apiCache.get<number>(cacheKey);
  
  if (cached !== undefined) {
    setCompletedToday(cached);
    return; // Pas de requête si en cache
  }
  
  // Requête uniquement si pas en cache
  // ...
}, [effectiveUser?.id, selectedDateKey]);
```

**Avantages** :
- Pas de requête si les données sont déjà en cache
- Changement de jour instantané si déjà chargé
- Réduction drastique des requêtes réseau

### 2. Mémorisation agressive des calculs

**Principe** : Tout calcul coûteux doit être mémorisé avec `useMemo`

**Calculs à mémoriser** :
- Filtrage de l'historique par date
- Filtrage des progrès par date
- Calcul des données de semaine (`weekData`)
- Calcul des statistiques
- Formatage des dates

**Exemple optimisé avec indexation** :
```typescript
// ⚡ PERFORMANCE: Pré-calculer les dateKeys UNE SEULE FOIS
const historyDateKeys = useMemo(() => {
  const map = new Map<number, string>(); // Cache des dateKeys par ID
  history.forEach(entry => {
    if (!map.has(entry.id)) {
      const date = new Date(entry.completedAt);
      date.setHours(0, 0, 0, 0);
      map.set(entry.id, date.toISOString().split('T')[0]);
    }
  });
  return map;
}, [history]);

// Filtrer avec comparaison de strings (ultra-rapide, pas de format() dans le filtre)
const filteredHistory = useMemo(() => {
  if (!isTimeMachineMode || !selectedDateKey) {
    return history;
  }
  return history.filter(entry => {
    const entryDateKey = historyDateKeys.get(entry.id);
    return entryDateKey && entryDateKey <= selectedDateKey;
  });
}, [history, isTimeMachineMode, selectedDateKey, historyDateKeys]);
```

**Gains** :
- ✅ DateKeys pré-calculées une seule fois (pas de `format()` ni `startOfDay()` dans le filtre)
- ✅ Comparaison de strings = ultra-rapide
- ✅ Cache par ID pour éviter les recalculs
- ✅ 3-5x plus rapide que la version avec `format()` dans le filtre

### 3. Clés stables pour éviter les re-renders

**Principe** : Utiliser des clés stables (strings) au lieu d'objets dans les dépendances

**Avant** (lent) :
```typescript
}, [history, selectedDate]); // selectedDate est un objet, peut créer des re-renders inutiles
```

**Après** (rapide) :
```typescript
}, [historyKey, selectedDateKey]); // Strings, comparaison instantanée
```

### 4. Debouncing séparé : UI vs calculs

**Problème** : Si l'utilisateur clique rapidement sur plusieurs jours, on déclenche trop de calculs. Le debounce peut aussi affecter l'UI.

**Solution optimisée** : Séparer l'UI (immédiate) des calculs (debounced)

```typescript
// Dans SelectedDateContext.tsx
const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
const [debouncedSelectedDateKey, setDebouncedSelectedDateKey] = useState<string | null>(null);

// UI immédiate (pas de debounce)
const selectedDate = useMemo(() => {
  if (!selectedDateKey) return null;
  return new Date(selectedDateKey + 'T00:00:00');
}, [selectedDateKey]);

// Calculs avec debounce (100ms) pour éviter les calculs multiples
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSelectedDateKey(selectedDateKey);
  }, 100); // 100ms de debounce pour les changements rapides
  return () => clearTimeout(timer);
}, [selectedDateKey]);

// Exposer les deux
const contextValue = useMemo(() => ({
  selectedDate, // Immédiat pour UI (badge, indicateur)
  selectedDateKey, // Immédiat pour UI
  debouncedSelectedDateKey, // Pour calculs coûteux (filtrage, stats)
  // ...
}), [selectedDate, selectedDateKey, debouncedSelectedDateKey]);
```

**Avantages** :
- ✅ UI réactive (pas de lag visible)
- ✅ Calculs optimisés (debounce pour éviter les calculs multiples)
- ✅ Meilleure expérience utilisateur
- ✅ Badge et indicateur apparaissent instantanément

### 5. Lazy loading des composants lourds

**Principe** : Les graphiques et visualisations lourdes ne doivent se charger que si nécessaire

**Composants à lazy-load** :
- `ProgressStatsChart` (déjà fait ✅)
- `DonutChart` (déjà fait ✅)
- Graphiques de la page historique

**Vérifier** : S'assurer que les composants lourds sont bien lazy-loadés

### 6. Optimisation du filtrage

**Problème** : Filtrer un grand historique peut être lent.

**Solution** : Utiliser des Sets et des Map pour des recherches O(1)

```typescript
// Créer un Set des dateKeys valides UNE FOIS
const validDateKeys = useMemo(() => {
  if (!isTimeMachineMode || !selectedDateKey) {
    return null; // Pas de filtre
  }
  const set = new Set<string>();
  // Générer toutes les dateKeys valides jusqu'à selectedDateKey
  // ...
  return set;
}, [isTimeMachineMode, selectedDateKey]);

// Filtrer avec Set.has() = O(1) au lieu de filter() = O(n)
const filteredHistory = useMemo(() => {
  if (!validDateKeys) return history;
  return history.filter(entry => {
    const entryDateKey = format(startOfDay(new Date(entry.completedAt)), 'yyyy-MM-dd');
    return validDateKeys.has(entryDateKey);
  });
}, [history, validDateKeys]);
```

### 7. Réduction des dépendances dans useMemo

**Principe** : Moins de dépendances = moins de recalculs

**Mauvais** :
```typescript
const filteredHistory = useMemo(() => {
  // ...
}, [history, isTimeMachineMode, selectedDate, selectedDateKey]); // Trop de dépendances
```

**Bon** :
```typescript
// Créer une clé composite stable
const filterKey = useMemo(() => {
  return isTimeMachineMode && selectedDateKey ? `filter-${selectedDateKey}` : 'no-filter';
}, [isTimeMachineMode, selectedDateKey]);

const filteredHistory = useMemo(() => {
  // ...
}, [history, filterKey]); // Seulement 2 dépendances
```

### 8. Préchargement intelligent

**Principe** : Précharger les données des jours adjacents en arrière-plan

**Implémentation optimisée** :
```typescript
// Dans TimeContext ou un hook dédié
useEffect(() => {
  if (!isTimeMachineMode || !selectedDateKey || !effectiveUser?.id) return;
  
  // Précharger les jours adjacents en arrière-plan
  const prevDay = new Date(selectedDateKey + 'T00:00:00');
  prevDay.setDate(prevDay.getDate() - 1);
  const nextDay = new Date(selectedDateKey + 'T00:00:00');
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Précharger silencieusement (sans mettre à jour l'état)
  const prefetchDay = async (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const cacheKey = `completed-count-${effectiveUser.id}-${dateKey}`;
    
    // Si pas en cache, précharger
    if (!apiCache.has(cacheKey)) {
      const params = new URLSearchParams();
      params.append('targetDate', date.toISOString());
      const url = `/api/exercices?${params.toString()}`;
      
      // Fetch en arrière-plan (sans bloquer)
      fetch(url, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          const count = data.filter((ex: { completedToday?: boolean }) => 
            ex.completedToday === true
          ).length;
          apiCache.set(cacheKey, count, 60000); // Cache 1 minute
        })
        .catch(() => {}); // Ignorer les erreurs silencieusement
    }
  };
  
  // Précharger les jours adjacents
  prefetchDay(prevDay);
  prefetchDay(nextDay);
}, [selectedDateKey, isTimeMachineMode, effectiveUser?.id]);
```

**Avantages** :
- Navigation entre jours adjacents = instantanée (déjà en cache)
- Préchargement non-bloquant (ne freeze pas l'UI)
- Cache granulaire par jour
- Expérience ultra-fluide

### 9. Optimisation du rendu React

**Principe** : Éviter les re-renders inutiles avec `React.memo` et `useMemo`

**Composants à mémoriser** :
- `ActivityHeatmapCell` : Mémoriser pour éviter les re-renders de toutes les cellules
- `WelcomeHeader` : Mémoriser pour éviter les re-renders globaux
- `DailyGoalProgress` : Mémoriser pour éviter les recalculs

**Exemple optimisé** :
```typescript
export const ActivityHeatmapCell = memo(function ActivityHeatmapCell({ 
  day, 
  progressDates, 
  selectedDateKey, // NOUVEAU : passer directement la clé
  onDayClick 
}: Props) {
  // ...
}, (prevProps, nextProps) => {
  // ⚡ PERFORMANCE: Comparaison ultra-rapide (strings au lieu d'objets)
  return (
    prevProps.day?.dateKey === nextProps.day?.dateKey &&
    prevProps.selectedDateKey === nextProps.selectedDateKey &&
    prevProps.progressDates === nextProps.progressDates &&
    prevProps.onDayClick === nextProps.onDayClick
  );
});
```

**Gains** :
- ✅ Comparaison de strings au lieu d'objets
- ✅ Moins de re-renders inutiles
- ✅ Performance améliorée pour les listes longues

### 10. Batch des mises à jour d'état avec startTransition

**Principe** : Grouper les mises à jour d'état pour éviter les re-renders multiples et prioriser l'UI

**React 18+** : Utiliser `startTransition` pour les mises à jour non-urgentes

**Implémentation** :
```typescript
import { startTransition } from 'react';

const handleDateChange = (newDate: Date) => {
  // Mise à jour urgente (UI immédiate) - badge, indicateur
  setSelectedDate(newDate);
  
  // Mises à jour non-urgentes (calculs, graphiques) - ne bloquent pas l'UI
  startTransition(() => {
    // Ces mises à jour sont différées et ne bloquent pas l'UI
    // - Filtrage de l'historique
    // - Calcul des statistiques
    // - Mise à jour des graphiques
    // L'UI reste réactive pendant ces calculs
  });
};
```

**Avantages** :
- ✅ UI reste réactive pendant les calculs
- ✅ Pas de freeze visible
- ✅ Meilleure expérience utilisateur
- ✅ Calculs lourds ne bloquent pas l'interaction

## Métriques de performance cibles

### Objectifs
- **Temps de réponse** : < 50ms entre le clic et l'affichage du badge/indicateur
- **Temps de calcul** : < 100ms pour filtrer l'historique et mettre à jour les données
- **Fluidité** : 60fps constant, pas de freeze ni de lag
- **Requêtes réseau** : 0 requête si données en cache, sinon 1 seule requête par changement de jour

### Mesures à effectuer
1. Profiler avec React DevTools Profiler
2. Mesurer le temps de rendu avec `performance.now()`
3. Vérifier le nombre de re-renders avec React DevTools
4. Tester sur mobile (appareil bas de gamme) pour garantir la performance

## Checklist performance

Avant de considérer l'implémentation terminée :

- [ ] Tous les calculs coûteux sont mémorisés avec `useMemo`
- [ ] Tous les filtres utilisent des clés stables (strings) dans les dépendances
- [ ] Le cache API est utilisé pour éviter les requêtes inutiles
- [ ] Les composants lourds sont lazy-loadés
- [ ] Les composants de liste sont mémorisés avec `React.memo`
- [ ] Pas de re-renders inutiles (vérifier avec React DevTools)
- [ ] Changement de jour = < 50ms pour l'affichage UI
- [ ] Changement de jour = < 100ms pour les calculs
- [ ] Filtrage de l'historique = < 10ms (avec indexation)
- [ ] Navigation entre jours adjacents = instantanée (cache préchargé)
- [ ] Testé sur mobile (appareil bas de gamme)
- [ ] 60fps constant, pas de freeze
- [ ] startTransition utilisé pour calculs non-urgents
- [ ] Debouncing séparé (UI immédiate, calculs debounced)

## Points d'attention

### Performance ⚡ CRITIQUE
- **Cache API** : Utiliser le cache pour éviter les requêtes inutiles
- **Mémorisation agressive** : Tout calcul coûteux doit être dans `useMemo`
- **Clés stables** : Utiliser `selectedDateKey` (string) au lieu de `selectedDate` (Date)
- **Debouncing** : Debounce léger pour les changements rapides (calculs uniquement, pas UI)
- **Lazy loading** : Composants lourds chargés à la demande
- **Préchargement** : Précharger les jours adjacents en arrière-plan
- **React.memo** : Mémoriser les composants de liste pour éviter les re-renders
- **startTransition** : Grouper les mises à jour non-urgentes
- **Objectif** : Changement de jour = instantané (< 50ms UI, < 100ms calculs)

### Accessibilité
- Le badge sablier doit être lisible (contraste suffisant)
- L'indicateur dans le heatmap doit être visible même pour les daltoniens
- Utiliser `aria-label` pour les lecteurs d'écran

### UX
- Le badge doit être proéminent mais pas intrusif
- L'indicateur dans le heatmap doit être clair mais ne pas masquer les données
- Transitions douces quand on change de jour

## Tests à effectuer

1. **Réactivité** :
   - Sélectionner un jour → Vérifier que `completedToday` se met à jour
   - Changer de jour → Vérifier que toutes les données se mettent à jour
   - Revenir à aujourd'hui → Vérifier que tout revient à la normale

2. **Visibilité** :
   - Activer le mode sablier → Vérifier que le badge apparaît dans WelcomeHeader
   - Cliquer sur un jour dans le heatmap → Vérifier que le sablier apparaît sur ce jour
   - Naviguer entre les jours → Vérifier que le sablier se déplace

3. **Cohérence** :
   - En mode sablier, vérifier que tous les graphiques sont cohérents
   - Vérifier que l'historique est bien filtré
   - Vérifier que les progrès sont bien filtrés

## Exemple de code complet pour SelectedDateContext

```typescript
'use client';

import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { subDays, isBefore, format, startOfDay } from 'date-fns';
import { MAX_TIME_MACHINE_DAYS } from '@/app/constants/historique.constants';
import { isToday } from 'date-fns';

type SelectedDateContextType = {
  selectedDate: Date | null;
  selectedDateKey: string | null; // Clé stable pour réactivité
  setSelectedDate: (date: Date | null) => void;
  clearSelectedDate: () => void;
  isDateSelected: boolean;
  isTimeMachineMode: boolean; // Mode sablier actif (date passée)
};

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(undefined);

export function SelectedDateProvider({ children }: PropsWithChildren) {
  const [selectedDate, setSelectedDateState] = useState<Date | null>(null);

  // Clé stable basée sur la date (format yyyy-MM-dd)
  const selectedDateKey = useMemo(() => {
    if (!selectedDate) return null;
    return format(startOfDay(selectedDate), 'yyyy-MM-dd');
  }, [selectedDate ? selectedDate.toDateString() : null]);

  // Mode sablier actif si date sélectionnée et passée (pas aujourd'hui)
  const isTimeMachineMode = useMemo(() => {
    return selectedDate !== null && !isToday(selectedDate);
  }, [selectedDateKey]);

  // Normalisation de la date avec ref pour performance
  const normalizedSelectedDateRef = useRef<Date | null>(null);
  const normalizedSelectedDate = useMemo(() => {
    if (!selectedDateKey) {
      normalizedSelectedDateRef.current = null;
      return null;
    }
    if (normalizedSelectedDateRef.current && 
        format(startOfDay(normalizedSelectedDateRef.current), 'yyyy-MM-dd') === selectedDateKey) {
      return normalizedSelectedDateRef.current;
    }
    const date = new Date(selectedDateKey + 'T00:00:00');
    normalizedSelectedDateRef.current = date;
    return date;
  }, [selectedDateKey]);

  const setSelectedDate = useCallback((date: Date | null) => {
    if (date) {
      // Validation : limite de 28 jours
      const minAllowedDate = subDays(new Date(), MAX_TIME_MACHINE_DAYS);
      if (isBefore(date, minAllowedDate)) {
        console.warn(`Date trop ancienne pour le mode sablier: ${date.toISOString()}. Limite: ${MAX_TIME_MACHINE_DAYS} jours`);
        return;
      }
      
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      setSelectedDateState(normalized);
    } else {
      setSelectedDateState(null);
    }
  }, []);

  const clearSelectedDate = useCallback(() => {
    setSelectedDateState(null);
  }, []);

  const contextValue = useMemo<SelectedDateContextType>(() => ({
    selectedDate: normalizedSelectedDate,
    selectedDateKey,
    setSelectedDate,
    clearSelectedDate,
    isDateSelected: normalizedSelectedDate !== null,
    isTimeMachineMode,
  }), [normalizedSelectedDate, selectedDateKey, setSelectedDate, clearSelectedDate, isTimeMachineMode]);

  return (
    <SelectedDateContext.Provider value={contextValue}>
      {children}
    </SelectedDateContext.Provider>
  );
}

export function useSelectedDate() {
  const context = useContext(SelectedDateContext);
  if (context === undefined) {
    throw new Error('useSelectedDate must be used within a SelectedDateProvider');
  }
  return context;
}
```

## Résumé

**Problèmes** :
1. ❌ Logique temporelle dispersée : chaque composant recalcule "si mode sablier alors date sélectionnée sinon aujourd'hui"
2. ❌ Progressions ne se mettent pas à jour quand on change de jour
3. ❌ Welcome card ne montre pas clairement le mode sablier
4. ❌ Heatmap ne montre pas visuellement le jour sélectionné
5. ❌ Performance : Changement de jour peut être lent ou provoquer des freezes

**Solutions** :
1. ✅ **TimeContext (Wrapper Temporel)** : Source unique de vérité pour la date de référence
2. ✅ `selectedDateKey` stable pour garantir la réactivité
3. ✅ Badge sablier proéminent dans WelcomeHeader
4. ✅ Indicateur sablier ⏳ sur le jour sélectionné dans le heatmap
5. ✅ Optimisations performance : cache API, mémorisation agressive, debouncing, préchargement

**Bénéfices** :
- **Architecture centralisée** : TimeContext = source unique de vérité, plus de logique dispersée
- **Simplicité** : `useTimeContext()` au lieu de répéter la logique partout
- **Cohérence garantie** : Tous les composants utilisent la même date de référence
- Architecture plus robuste et réactive
- UX plus claire et intuitive
- **Performance optimale** : Changement de jour instantané (< 50ms UI, < 100ms calculs)
- Moins de bugs liés à l'état obsolète
- Meilleure compréhension du mode sablier par l'utilisateur
- Expérience fluide même sur mobile bas de gamme

**Objectifs performance** :
- ⚡ Changement de jour = **instantané** (< 50ms pour l'affichage UI)
- ⚡ Calculs = **rapides** (< 100ms pour filtrer et mettre à jour)
- ⚡ Filtrage = **ultra-rapide** (< 10ms avec indexation, 3-5x plus rapide)
- ⚡ Navigation entre jours adjacents = **instantanée** (cache préchargé)
- ⚡ 60fps constant, **pas de freeze ni de lag**
- ⚡ 0 requête réseau si données en cache
- ⚡ Re-renders minimisés (-50% à -70% avec optimisations)

**Gains de performance estimés** :
- Filtrage : **3-5x plus rapide** (avec indexation)
- Navigation : **instantanée** (cache préchargé)
- Re-renders : **-50% à -70%** (avec React.memo optimisé)
- UI : **pas de freeze** (avec startTransition)