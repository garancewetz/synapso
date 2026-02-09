# Audit Mode Sablier - Requêtes GET en boucle

## Problème identifié

Les requêtes GET se déclenchent en boucle sur la page d'accueil depuis l'ajout de la feature sablier.

## Causes identifiées

### 1. **SelectedDateContext** - ✅ CORRIGÉ
**Problème** : `normalizedSelectedDate` était recréé à chaque render, même si c'était la même date, causant des changements de référence.

**Solution** : Utilisation d'un `useRef` pour stocker la date normalisée et réutiliser la même référence si la clé ne change pas.

### 2. **useCategoryStats** - ⚠️ À VÉRIFIER
**Problème potentiel** : `referenceDateKey` utilise `selectedDate.toDateString()` dans les dépendances, mais utilise `selectedDate` directement dans le code.

**Impact** : Si `selectedDate` change de référence (même si `toDateString()` est identique), le code peut créer de nouveaux objets Date.

### 3. **useExercices** - ⚠️ À VÉRIFIER
**Problème potentiel** : Même problème que `useCategoryStats`.

### 4. **useTodayCompletedCount** - ⚠️ À VÉRIFIER
**Problème potentiel** : Même problème que `useCategoryStats`.

## Hooks affectés

1. `useCategoryStats` - Utilisé sur la page d'accueil
2. `useExercices` - Utilisé sur la page d'accueil
3. `useTodayCompletedCount` - Utilisé dans `WelcomeHeaderWrapper`
4. `usePeriodNavigation` - Utilisé sur la page historique
5. `WelcomeHeaderWrapper` - Utilise `useTodayCompletedCount`

## Corrections appliquées

1. ✅ `SelectedDateContext` : Utilisation d'un ref pour stabiliser la référence de `normalizedSelectedDate`
2. ✅ `HistoryContext` : Utilisation de `effectiveUser?.id` au lieu de `effectiveUser`
3. ✅ `useCategoryStats` : Optimisation de `setStats` pour ne mettre à jour que si les valeurs changent
4. ✅ `WelcomeHeaderWrapper` : Utilisation de `historyKey` dans les dépendances

## Prochaines étapes

1. Tester si les corrections résolvent le problème
2. Si le problème persiste, vérifier si `selectedDate` est utilisé directement dans les hooks au lieu de la clé stable
3. Ajouter des logs pour identifier quel hook déclenche les requêtes en boucle
