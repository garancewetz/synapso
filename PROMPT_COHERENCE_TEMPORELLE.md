# Prompt : Cohérence temporelle dans l'application Synapso

## Problème identifié

Quand l'utilisateur remonte dans le temps via le sablier (Time Machine) jusqu'au **jeudi 11 décembre**, l'application doit afficher un état cohérent avec cette date historique, mais actuellement il y a des incohérences :

1. **Les progrès (victoires) sont tous affichés** : Même en étant au 11 décembre, tous les progrès créés après cette date sont visibles dans la timeline
2. **Le heatmap devrait être fidèle à la semaine du 11 décembre** : Le heatmap utilise bien `referenceDate` mais il faut vérifier que la logique est cohérente partout

## Comportement attendu

Quand une date est sélectionnée via le sablier (et que cette date n'est pas aujourd'hui) :

### 1. Filtrage des progrès (victoires)
- **Règle** : Ne montrer que les progrès créés **le jour sélectionné ou avant**
- **Fichier concerné** : `src/app/(pages)/historique/page.tsx`
- **Ligne actuelle** : 191-193, `filteredProgress` retourne simplement `progressList` sans filtre
- **Action** : Filtrer `progressList` pour ne garder que les progrès dont `createdAt <= selectedDate` (en comparant les dates normalisées, sans heures)

### 2. Filtrage de l'historique des exercices
- **Règle** : Ne montrer que les exercices complétés **le jour sélectionné ou avant**
- **Fichiers concernés** : 
  - `src/app/hooks/useHistory.ts` : L'historique est chargé depuis l'API (charge les 40 derniers jours par défaut)
  - `src/app/(pages)/historique/page.tsx` : Le filtrage doit se faire côté client après le chargement
- **Action** : Filtrer `history` pour ne garder que les entrées dont `completedAt <= selectedDate` (en comparant les dates normalisées)
- **Note** : Le hook `useHistory` charge déjà les données depuis l'API, donc le filtrage par date sélectionnée doit se faire côté client dans le composant

### 3. Cohérence du heatmap et des graphiques
- **Règle** : Le heatmap et les graphiques doivent afficher la période autour de la date sélectionnée
- **Fichiers concernés** : 
  - `src/app/hooks/useHeatmapNavigation.ts` (déjà utilise `referenceDate` ✅, ligne 174 dans `historique/page.tsx`)
  - `src/app/hooks/usePeriodNavigation.ts` (déjà utilise `referenceDate` ✅, ligne 186 dans `historique/page.tsx`)
  - `src/app/utils/historique.utils.ts` (fonction `getHeatmapData` utilise `endDate` ✅)
- **Action** : Passer `filteredHistory` (au lieu de `history`) aux hooks `useHeatmapNavigation` et `usePeriodNavigation` pour que les graphiques n'affichent que les données jusqu'à la date sélectionnée
- **Vérification** : S'assurer que `getHeatmapData` filtre bien l'historique pour ne montrer que les exercices dans la période affichée (déjà fait via le paramètre `endDate`)

### 4. Cohérence des statistiques
- **Règle** : Les statistiques (donut chart, graphiques) doivent refléter uniquement les données jusqu'à la date sélectionnée
- **Fichiers concernés** :
  - `src/app/utils/historique.utils.ts` (fonctions `calculateBodypartStatsByPeriod`, `calculateStats`)
  - `src/app/(pages)/historique/page.tsx` (calcul de `donutDataBodyparts`, ligne 147-150)
- **Action** : Utiliser `filteredHistory` (au lieu de `history`) pour calculer les statistiques, ainsi elles refléteront automatiquement uniquement les données jusqu'à la date sélectionnée
- **Note** : Les fonctions de calcul de stats dans `historique.utils.ts` utilisent déjà `history` en paramètre, donc en passant `filteredHistory` elles fonctionneront correctement sans modification

## Points d'attention techniques

### Normalisation des dates
- **IMPORTANT** : Toujours utiliser `startOfDay()` de `date-fns` pour normaliser les dates avant comparaison
- Utiliser le même pattern que dans `useDayDetailData.ts` (lignes 35-40 et 52-57) :
  ```typescript
  const entryDate = new Date(entry.completedAt);
  const entryDateKey = format(startOfDay(entryDate), 'yyyy-MM-dd');
  const selectedDateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
  return entryDateKey <= selectedDateKey; // Pour "le jour sélectionné ou avant"
  ```

### Référence de date
- Utiliser `referenceDate` calculé dans `historique/page.tsx` (lignes 156-164) qui prend déjà en compte `selectedDate`
- Ce `referenceDate` est déjà utilisé pour le heatmap, il faut l'utiliser partout pour la cohérence

### Performance
- Utiliser `useMemo` pour mémoriser les listes filtrées
- Éviter de recalculer à chaque render

## Fichiers à modifier

1. **`src/app/(pages)/historique/page.tsx`** (modifications principales)
   - Créer `filteredHistory` avec `useMemo` pour filtrer `history` par date sélectionnée (lignes ~76-77)
   - Modifier `filteredProgress` (lignes 191-193) pour filtrer par date sélectionnée
   - Remplacer `history` par `filteredHistory` dans :
     - `useHeatmapNavigation(filteredHistory, ...)` (ligne 174)
     - `usePeriodNavigation(filteredHistory, ...)` (ligne 186)
     - `calculateBodypartStatsByPeriod(filteredHistory, ...)` (ligne 148)
     - `ProgressTimeline` (ligne 424, si nécessaire)
   - Utiliser `filteredProgress` au lieu de `progressList` partout où c'est pertinent

2. **`src/app/utils/historique.utils.ts`** (aucune modification nécessaire)
   - Les fonctions acceptent déjà `history` en paramètre et fonctionneront correctement avec `filteredHistory`
   - `getHeatmapData` filtre déjà correctement via le paramètre `endDate`

3. **`src/app/hooks/useHistory.ts`** (aucune modification nécessaire)
   - L'historique est chargé depuis l'API, le filtrage se fait côté client dans le composant

## Tests à effectuer

1. Sélectionner le 11 décembre dans le sablier
2. Vérifier que :
   - ✅ Aucun progrès créé après le 11 décembre n'est visible
   - ✅ Aucun exercice complété après le 11 décembre n'est visible dans l'historique
   - ✅ Le heatmap affiche la période autour du 11 décembre avec les bonnes données
   - ✅ Les statistiques (donut chart) reflètent uniquement les données jusqu'au 11 décembre
   - ✅ Le graphique montagne (ActivityLineChart) affiche uniquement les données jusqu'au 11 décembre

## Exemple de code pour le filtrage

```typescript
// Dans historique/page.tsx
import { format, startOfDay } from 'date-fns';

// ... après la ligne 76 (après useHistory())

// Filtrer l'historique par date sélectionnée
const filteredHistory = useMemo(() => {
  if (!isDateSelected || !selectedDate) {
    return history;
  }
  const selectedDateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
  return history.filter(entry => {
    const entryDate = new Date(entry.completedAt);
    const entryDateKey = format(startOfDay(entryDate), 'yyyy-MM-dd');
    return entryDateKey <= selectedDateKey;
  });
}, [history, isDateSelected, selectedDate]);

// ... après la ligne 79 (après useProgress())

// Filtrer les progrès par date sélectionnée
const filteredProgress = useMemo(() => {
  if (!isDateSelected || !selectedDate) {
    return progressList;
  }
  const selectedDateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
  return progressList.filter(progress => {
    const progressDate = new Date(progress.createdAt);
    const progressDateKey = format(startOfDay(progressDate), 'yyyy-MM-dd');
    return progressDateKey <= selectedDateKey;
  });
}, [progressList, isDateSelected, selectedDate]);

// ... puis remplacer les usages :
// - Ligne 148 : calculateBodypartStatsByPeriod(filteredHistory, bodypartPeriod)
// - Ligne 174 : useHeatmapNavigation(filteredHistory, MONTH_HEATMAP_DAYS)
// - Ligne 186 : usePeriodNavigation(filteredHistory, 15)
// - Ligne 424 : ProgressTimeline progressList={filteredProgress} history={filteredHistory}
```

**Important** : Utiliser `filteredHistory` au lieu de `history` dans tous les hooks et calculs pour garantir la cohérence temporelle.

## Résumé

**Problème** : Quand l'utilisateur remonte dans le temps (ex: 11 décembre), tous les progrès et exercices futurs sont encore visibles, ce qui casse l'immersion temporelle.

**Solution** : Filtrer côté client `history` et `progressList` pour ne garder que les données jusqu'à la date sélectionnée, puis utiliser ces listes filtrées partout dans le composant.

**Impact** : 
- ✅ Les progrès affichés seront cohérents avec la date sélectionnée
- ✅ L'historique des exercices sera cohérent avec la date sélectionnée
- ✅ Les graphiques (heatmap, montagne) afficheront uniquement les données jusqu'à la date sélectionnée
- ✅ Les statistiques refléteront uniquement les données jusqu'à la date sélectionnée

**Complexité** : Faible - Ajout de deux `useMemo` pour filtrer les données, puis remplacement des références dans le composant.
