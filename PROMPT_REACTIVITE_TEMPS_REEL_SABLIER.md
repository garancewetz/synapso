# Prompt : Réactivité en temps réel pour le mode sablier

## Problème actuel

Quand l'utilisateur ajoute ou complète un exercice en mode sablier, ou qu'il navigue de jour en jour, tous les éléments de l'interface doivent se mettre à jour en temps réel :

1. **Le heatmap** (homepage et page historique) doit refléter immédiatement les changements
2. **Les jauges des cards welcome** (progress bar de l'objectif du jour) doivent se mettre à jour
3. **Les jauges des cards category** (barres de progression par catégorie) doivent se mettre à jour
4. **La navigation de jour en jour** doit recalculer automatiquement toutes les données

Actuellement, certains éléments peuvent ne pas se mettre à jour immédiatement ou correctement.

## Comportement attendu

### 1. Ajout/Complétion d'exercice en mode sablier
- **Action** : L'utilisateur complète ou ajoute un exercice pour un jour passé (ex: hier)
- **Résultat attendu** :
  - L'historique se rafraîchit immédiatement (`HistoryContext`)
  - Le heatmap de la homepage se met à jour (la cellule du jour concerné change de couleur)
  - Le heatmap de la page historique se met à jour
  - La jauge de l'objectif du jour (welcome card) se met à jour pour le jour sélectionné
  - Les jauges des cards category se mettent à jour pour refléter les exercices du jour sélectionné
  - Tout cela doit être **instantané** (pas de délai perceptible)

### 2. Navigation de jour en jour en mode sablier
- **Action** : L'utilisateur change de jour (ex: de "hier" à "avant-hier")
- **Résultat attendu** :
  - Toutes les données se recalculent automatiquement pour le nouveau jour
  - Le heatmap se met à jour (nouvelle cellule sélectionnée, nouvelle plage de dates si nécessaire)
  - Les jauges se mettent à jour pour refléter les exercices du nouveau jour
  - Les cards category se mettent à jour
  - Tout doit être **fluide et rapide**

## Architecture de réactivité actuelle

### Système d'événements
- `exercice-completed-refresh` : Déclenché après complétion/ajout d'exercice
- `category-stats-refresh` : Déclenché pour rafraîchir les stats de catégorie
- `user-changed` : Déclenché lors du changement d'utilisateur

### Hooks et Contexts
- `HistoryContext` : Gère l'historique global avec `refreshHistory()`
- `useTodayCompletedCount` : Écoute `exercice-completed-refresh` et invalide le cache
- `useCategoryStats` : Écoute `category-stats-refresh` et invalide le cache
- `WelcomeHeaderWrapper` : Utilise `useHistoryContext()` pour le heatmap

## Problèmes potentiels identifiés

### 1. Dépendances des `useMemo` dans `WelcomeHeaderWrapper`
**Fichier** : `src/app/components/WelcomeHeaderWrapper.tsx`

**Problème** : Le `weekData` dépend de `historyKey` qui est basé sur `filteredHistory`, mais si `history` change (après `refreshHistory()`), est-ce que `filteredHistory` se met à jour correctement ?

**Vérification** :
- `filteredHistory` dépend de `history`, `isTimeMachineMode`, `selectedDateKey`, `historyDateKeys`
- `historyDateKeys` dépend de `history`
- Donc si `history` change, `historyDateKeys` change, donc `filteredHistory` change, donc `historyKey` change, donc `weekData` se recalcule ✅

**Action** : Vérifier que les dépendances sont correctes et que `history` se met bien à jour après `refreshHistory()`.

### 2. Cache invalidation pour `useCategoryStats`
**Fichier** : `src/app/hooks/useCategoryStats.ts`

**Problème** : Le cache est invalidé lors de `category-stats-refresh`, mais est-ce que la clé de cache inclut bien `referenceDateKey` pour garantir un cache unique par date en mode sablier ?

**Vérification** :
- La clé de cache inclut `referenceDateKey` ✅
- Le cache est invalidé lors de `category-stats-refresh` ✅
- Mais est-ce que `fetchStats` se déclenche bien après l'invalidation ?

**Action** : Vérifier que `fetchStats` est bien appelé après l'invalidation du cache dans le handler `category-stats-refresh`.

### 3. Rafraîchissement de l'historique après ajout d'exercice
**Fichier** : `src/app/components/ExerciceForm.tsx`

**Problème** : Après création d'un exercice, `refreshHistory()` est-il appelé ?

**Vérification** :
- `triggerCompletedCountRefresh()` est appelé ✅
- `category-stats-refresh` est déclenché ✅
- Mais `refreshHistory()` n'est pas appelé directement ❌

**Action** : S'assurer que `refreshHistory()` est appelé après création d'exercice, ou que `HistoryContext` écoute un événement de rafraîchissement.

### 4. Réactivité lors du changement de jour
**Problème** : Quand l'utilisateur change de jour en mode sablier (via `setSelectedDate`), est-ce que tous les hooks se recalculent automatiquement ?

**Vérification** :
- `useTodayCompletedCount` dépend de `selectedDateKey` ✅
- `useCategoryStats` dépend de `referenceDateKey` (qui dépend de `selectedDateKey`) ✅
- `WelcomeHeaderWrapper` dépend de `selectedDateKey` pour `filteredHistory` ✅
- Mais est-ce que le cache est invalidé quand on change de jour ?

**Action** : S'assurer que le cache est invalidé quand `selectedDateKey` change, pour forcer un nouveau fetch.

## Solutions à implémenter

### 1. Ajouter `refreshHistory()` après création d'exercice

**Fichier** : `src/app/components/ExerciceForm.tsx`

**Action** : Après création d'un exercice, appeler `refreshHistory()` depuis `HistoryContext`.

```typescript
import { useHistoryContext } from '@/app/contexts/HistoryContext';

export function ExerciceForm({ exerciceId, onSuccess, onCancel, initialCategory }: Props) {
  const { refreshHistory } = useHistoryContext();
  
  // ... dans handleSubmit après création réussie ...
  
  // Déclencher le rafraîchissement de l'historique
  refreshHistory();
  
  // ... reste du code ...
}
```

### 2. Invalider le cache lors du changement de jour

**Fichier** : `src/app/hooks/useTodayCompletedCount.ts`

**Action** : Invalider le cache de l'ancienne date quand `selectedDateKey` change.

```typescript
useEffect(() => {
  // Invalider le cache de l'ancienne date quand on change de jour
  if (effectiveUser) {
    const cacheKey = `completed-count-${effectiveUser.id}-${selectedDateKey || 'today'}`;
    apiCache.delete(cacheKey);
  }
  
  fetchCompletedCount();
  
  // ... reste du code ...
}, [fetchCompletedCount, effectiveUser?.id, selectedDateKey]);
```

**Note** : C'est déjà fait dans le `useEffect`, mais vérifier que c'est bien exécuté.

### 3. S'assurer que `HistoryContext` se rafraîchit après création d'exercice

**Fichier** : `src/app/contexts/HistoryContext.tsx`

**Option A** : Ajouter un listener pour un événement `history-refresh` qui déclenche `fetchHistory()`.

**Option B** : S'assurer que tous les composants qui créent des exercices appellent `refreshHistory()`.

**Recommandation** : Option B (plus explicite et contrôlable).

### 4. Vérifier les dépendances de `useCategoryStats`

**Fichier** : `src/app/hooks/useCategoryStats.ts`

**Action** : S'assurer que le handler `category-stats-refresh` a accès aux bonnes valeurs (notamment `referenceDateKey`).

**Vérification** : Le handler dépend de `fetchStats`, qui dépend de `referenceDateKey`. Donc si `referenceDateKey` change, le handler se recrée avec les bonnes valeurs ✅

### 5. Optimiser le rafraîchissement du heatmap

**Fichier** : `src/app/components/WelcomeHeaderWrapper.tsx`

**Action** : S'assurer que `weekData` se recalcule immédiatement quand `history` change.

**Vérification** : `weekData` dépend de `historyKey`, qui dépend de `filteredHistory`, qui dépend de `history`. Donc si `history` change, `weekData` se recalcule ✅

**Amélioration possible** : Ajouter `history` directement dans les dépendances de `weekData` pour être explicite (même si c'est redondant avec `historyKey`).

## Tests à effectuer

### Test 1 : Complétion d'exercice en mode sablier
1. Aller en mode sablier sur "hier"
2. Compléter un exercice
3. **Vérifier** :
   - Le heatmap de la homepage se met à jour immédiatement (cellule "hier" change de couleur)
   - La jauge de l'objectif du jour se met à jour
   - Les jauges des cards category se mettent à jour
   - Le heatmap de la page historique se met à jour

### Test 2 : Création d'exercice en mode sablier
1. Aller en mode sablier sur "hier"
2. Créer un nouvel exercice
3. Compléter cet exercice
4. **Vérifier** : Même chose que Test 1

### Test 3 : Navigation de jour en jour
1. Aller en mode sablier sur "hier"
2. Noter les valeurs des jauges
3. Changer pour "avant-hier"
4. **Vérifier** :
   - Les jauges se mettent à jour immédiatement avec les valeurs de "avant-hier"
   - Le heatmap se met à jour (nouvelle cellule sélectionnée)
   - Pas de données de "hier" visibles

### Test 4 : Navigation rapide
1. Aller en mode sablier
2. Changer rapidement de jour en jour (hier → avant-hier → il y a 3 jours)
3. **Vérifier** :
   - Pas de lag ou de freeze
   - Les données se mettent à jour à chaque changement
   - Pas d'affichage de données incorrectes (race conditions)

## Points d'attention

### Performance
- **Cache intelligent** : Invalider uniquement le cache nécessaire (par date, par utilisateur)
- **Debouncing** : Ne pas debouncer les actions utilisateur, mais optimiser les recalculs
- **Mémorisation** : Utiliser `useMemo` et `React.memo` pour éviter les re-renders inutiles

### Cohérence
- **Source unique de vérité** : `HistoryContext` pour l'historique, `TimeContext` pour la date de référence
- **Filtrage cohérent** : Tous les composants utilisent `filteredHistory` (pas `history` directement) en mode sablier
- **Normalisation des dates** : Toujours utiliser `startOfDay` pour comparer les dates

### Réactivité
- **Événements** : Utiliser les événements pour la communication entre composants non liés
- **Dépendances React** : S'assurer que toutes les dépendances sont correctes dans les `useEffect` et `useMemo`
- **Cache invalidation** : Invalider le cache au bon moment (changement de jour, ajout d'exercice, etc.)

## Résultat attendu

Après implémentation, l'utilisateur doit pouvoir :
1. **Ajouter/compléter un exercice en mode sablier** → Tout se met à jour instantanément
2. **Naviguer de jour en jour** → Toutes les données se recalculent automatiquement et rapidement
3. **Voir les changements en temps réel** → Pas de délai, pas de données obsolètes, pas de confusion

L'expérience doit être **fluide, réactive et cohérente** dans toutes les situations.
