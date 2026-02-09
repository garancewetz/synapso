# Prompt : Correction du heatmap de la homepage en mode sablier

## Problème actuel

Le heatmap de la homepage (affiché dans `WelcomeHeaderWrapper` via `WeekCalendar`) ne gère pas correctement l'affichage en mode sablier :

- Actuellement, les fonctions `getLast7DaysData` et `getCurrentWeekData` utilisent directement `referenceDate` (qui peut être la date sélectionnée en mode sablier) pour calculer la plage de dates
- Cela peut faire disparaître "aujourd'hui" du heatmap même si le jour sélectionné est dans la semaine en cours
- Quand on revient au mode "aujourd'hui", le heatmap ne se remet pas correctement à jour

## Comportement attendu

### 1. Si le jour sélectionné est dans la semaine en cours (7 derniers jours)
- **Garder "aujourd'hui" comme dernière cellule** du heatmap
- Le heatmap affiche les 7 derniers jours jusqu'à "aujourd'hui"
- Le jour sélectionné reste visible dans le heatmap avec son indicateur sablier

### 2. Si le jour sélectionné est plus ancien (au-delà de 7 jours)
- **Reconstituer le heatmap** avec le jour sélectionné comme dernière cellule
- Le heatmap affiche les 7 jours précédant le jour sélectionné (inclus)
- "Aujourd'hui" n'est plus visible car hors de la plage

### 3. Quand on revient au mode "aujourd'hui"
- **Le heatmap doit se remettre à jour** avec "aujourd'hui" comme dernière cellule
- Le heatmap affiche les 7 derniers jours jusqu'à "aujourd'hui"

## Fichiers à modifier

### 1. `src/app/components/WelcomeHeaderWrapper.tsx`

**Problème** : Le `weekData` est calculé avec `referenceDate` qui peut être la date sélectionnée en mode sablier, sans vérifier si cette date est dans la semaine en cours.

**Solution** : Modifier le calcul de `weekData` pour :
- Vérifier si `selectedDate` (en mode sablier) est dans les 7 derniers jours
- Si oui : utiliser `new Date()` (aujourd'hui) comme date de fin pour `getLast7DaysData` ou `getCurrentWeekData`
- Si non : utiliser `selectedDate` comme date de fin
- Si pas en mode sablier : toujours utiliser `new Date()` (aujourd'hui)

**Code à modifier** :
```typescript
// Données selon le rythme de l'utilisateur
// Utiliser referenceDate (aujourd'hui ou date sélectionnée) pour la plage
const weekData = useMemo(() => {
  const frequency = resetFrequency || 'DAILY';
  
  // ⚡ MODE SABLIER: Déterminer la date de fin du heatmap
  let endDate: Date;
  if (isTimeMachineMode && selectedDate) {
    // Vérifier si la date sélectionnée est dans les 7 derniers jours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateNormalized = new Date(selectedDate);
    selectedDateNormalized.setHours(0, 0, 0, 0);
    const daysDiff = differenceInDays(today, selectedDateNormalized);
    
    if (daysDiff <= 7) {
      // Date sélectionnée dans la semaine en cours : garder "aujourd'hui" comme dernière date
      endDate = today;
    } else {
      // Date sélectionnée plus ancienne : utiliser la date sélectionnée comme dernière date
      endDate = selectedDateNormalized;
    }
  } else {
    // Mode normal : toujours utiliser "aujourd'hui"
    endDate = new Date();
  }
  
  return frequency === 'WEEKLY' 
    ? getCurrentWeekData(filteredHistory, endDate)
    : getLast7DaysData(filteredHistory, endDate);
}, [historyKey, resetFrequency, referenceDateKey, isTimeMachineMode, selectedDate]);
```

**Imports à ajouter** :
```typescript
import { differenceInDays } from 'date-fns';
```

### 2. `src/app/utils/historique.utils.ts`

**Vérification** : Les fonctions `getLast7DaysData` et `getCurrentWeekData` doivent correctement gérer le paramètre `referenceDate` (qui sera soit "aujourd'hui", soit la date sélectionnée selon la logique ci-dessus).

**Note** : Ces fonctions semblent déjà correctes, mais vérifier que :
- `getLast7DaysData` calcule bien `startDate = subDays(endDate, 6)` pour avoir 7 jours au total
- `getCurrentWeekData` calcule bien la semaine avec `startOfWeek` et `endOfWeek` basés sur `referenceDate`
- `isToday` est toujours comparé avec `realToday` (la vraie date d'aujourd'hui) et non avec `referenceDate`

## Tests à effectuer

1. **Mode sablier - Jour dans la semaine en cours** :
   - Sélectionner hier ou avant-hier
   - Vérifier que le heatmap affiche les 7 derniers jours jusqu'à "aujourd'hui"
   - Vérifier que "aujourd'hui" est visible et affiché correctement
   - Vérifier que le jour sélectionné a l'indicateur sablier

2. **Mode sablier - Jour plus ancien** :
   - Sélectionner un jour il y a 10 jours ou plus
   - Vérifier que le heatmap affiche les 7 jours précédant le jour sélectionné (inclus)
   - Vérifier que le jour sélectionné est la dernière cellule
   - Vérifier que "aujourd'hui" n'est plus visible

3. **Retour au mode normal** :
   - Après avoir sélectionné un jour ancien, revenir au mode "aujourd'hui"
   - Vérifier que le heatmap se remet à jour avec "aujourd'hui" comme dernière cellule
   - Vérifier que les 7 derniers jours sont affichés

4. **Mode hebdomadaire** :
   - Tester les mêmes scénarios avec `resetFrequency = 'WEEKLY'`
   - Vérifier que la semaine en cours est correctement affichée

## Points d'attention

- **Performance** : Utiliser `useMemo` avec les bonnes dépendances pour éviter les recalculs inutiles
- **Cohérence** : S'assurer que `filteredHistory` est utilisé (déjà fait) pour ne montrer que les exercices jusqu'à la date sélectionnée
- **Normalisation des dates** : Toujours utiliser `setHours(0, 0, 0, 0)` pour comparer uniquement les dates (sans heures)
- **isToday** : Dans les fonctions utilitaires, toujours comparer avec `realToday` (la vraie date d'aujourd'hui) et non avec `referenceDate`

## Résultat attendu

Le heatmap de la homepage doit s'adapter intelligemment au mode sablier :
- Si le jour sélectionné est proche (dans la semaine), "aujourd'hui" reste visible
- Si le jour sélectionné est ancien, le heatmap se recentre sur cette date
- Le retour au mode normal restaure immédiatement l'affichage avec "aujourd'hui"
