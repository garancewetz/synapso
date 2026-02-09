# Analyse : Limitation du mode sablier (Time Machine)

## Contexte

Actuellement, l'utilisateur peut remonter dans le temps à n'importe quelle date passée via le sablier. Cela pose plusieurs problèmes :

1. **Données manquantes** : `useHistory` charge par défaut les **40 derniers jours** seulement. Si l'utilisateur remonte au-delà, les données ne seront pas disponibles.
2. **Performance** : Charger tout l'historique pour des dates très anciennes peut être coûteux.
3. **Cohérence** : Les statistiques et graphiques peuvent être incomplets si les données ne sont pas chargées.
4. **UX** : Remonter trop loin peut être confus pour l'utilisateur.

## Options envisagées

### Option 1 : Limiter à 30 jours maximum ⭐ RECOMMANDÉ

**Principe** : Empêcher la sélection d'une date antérieure à 30 jours.

**Avantages** :
- ✅ Garantit que les données sont toujours disponibles (40 jours chargés > 30 jours max)
- ✅ Simple à implémenter
- ✅ UX claire : message d'erreur si tentative de remonter trop loin
- ✅ Performance optimale

**Inconvénients** :
- ⚠️ Limite la flexibilité pour les utilisateurs qui veulent remonter plus loin

**Implémentation** :
- Dans `DayDetailModal.tsx` : Vérifier si la date est > 30 jours avant d'activer le sablier
- Dans `SelectedDateContext.tsx` : Valider la date avant de la définir
- Afficher un message clair : "Tu ne peux remonter que jusqu'à 30 jours en arrière"

**Code exemple** :
```typescript
// Dans DayDetailModal.tsx ou SelectedDateContext.tsx
import { subDays, isBefore } from 'date-fns';

const MAX_DAYS_BACK = 30;
const minAllowedDate = subDays(new Date(), MAX_DAYS_BACK);

if (isBefore(date, minAllowedDate)) {
  // Afficher un message d'erreur ou empêcher l'action
  return;
}
```

---

### Option 2 : Rediriger vers la page "all" en mode sablier

**Principe** : Quand le sablier est activé, rediriger automatiquement vers `/exercices/all`.

**Avantages** :
- ✅ Évite les problèmes de données manquantes sur la page d'accueil
- ✅ La page "all" charge tous les exercices (pas de limite de jours)

**Inconvénients** :
- ❌ Change le comportement de navigation (peut être déroutant)
- ❌ L'utilisateur ne peut plus voir les statistiques/historique en mode sablier
- ❌ Ne résout pas le problème des données manquantes (l'historique reste limité à 40 jours)

**Implémentation** :
- Dans `layout.tsx` ou un composant global : Détecter le mode sablier et rediriger
- Utiliser `useRouter` de Next.js pour la redirection

**Code exemple** :
```typescript
// Dans un composant global ou layout
const { selectedDate, isDateSelected } = useSelectedDate();
const router = useRouter();

useEffect(() => {
  if (isDateSelected && selectedDate && !isToday(selectedDate)) {
    router.push('/exercices/all');
  }
}, [isDateSelected, selectedDate, router]);
```

---

### Option 3 : Charger tout l'historique automatiquement en mode sablier

**Principe** : Quand le sablier est activé, charger tout l'historique (pas seulement 40 jours).

**Avantages** :
- ✅ Permet de remonter aussi loin que nécessaire
- ✅ Pas de limitation arbitraire

**Inconvénients** :
- ❌ Performance : Charger tout l'historique peut être lent pour les utilisateurs avec beaucoup de données
- ❌ Complexité : Nécessite de modifier `useHistory` pour détecter le mode sablier
- ❌ Peut causer des problèmes de mémoire sur mobile

**Implémentation** :
- Modifier `useHistory` pour détecter le mode sablier et charger `days={null}`
- Ou créer un hook séparé `useHistoryForTimeMachine`

---

### Option 4 : Combinaison Option 1 + Option 3 (limite + chargement complet si nécessaire)

**Principe** : Limiter à 30 jours par défaut, mais si l'utilisateur veut remonter plus loin, charger tout l'historique.

**Avantages** :
- ✅ Bon compromis entre performance et flexibilité
- ✅ UX progressive : limite par défaut, possibilité d'aller plus loin

**Inconvénients** :
- ⚠️ Plus complexe à implémenter
- ⚠️ Peut être confus pour l'utilisateur (pourquoi une limite puis plus de limite ?)

---

## Recommandation : Option 1 (Limiter à 30 jours)

**Pourquoi cette option ?**

1. **Cohérence avec les données chargées** : `useHistory` charge 40 jours, donc 30 jours max garantit que toutes les données sont disponibles.

2. **Performance** : Pas besoin de charger tout l'historique, ce qui est meilleur pour les performances.

3. **Simplicité** : Facile à implémenter et à comprendre pour l'utilisateur.

4. **UX claire** : Un message d'erreur clair explique pourquoi on ne peut pas remonter plus loin.

5. **Cas d'usage réaliste** : Dans la plupart des cas, remonter 30 jours en arrière est suffisant pour ajouter des exercices oubliés.

## Implémentation recommandée

### 1. Ajouter une constante de limite

```typescript
// Dans un fichier de constantes (ex: constants/historique.constants.ts)
export const MAX_TIME_MACHINE_DAYS = 30;
```

### 2. Valider dans DayDetailModal

```typescript
// Dans DayDetailModal.tsx
import { subDays, isBefore } from 'date-fns';
import { MAX_TIME_MACHINE_DAYS } from '@/app/constants/historique.constants';

const handleAddExercisesForDay = () => {
  if (!date) return;
  
  const minAllowedDate = subDays(new Date(), MAX_TIME_MACHINE_DAYS);
  if (isBefore(date, minAllowedDate)) {
    // Afficher un toast ou message d'erreur
    // "Tu ne peux remonter que jusqu'à 30 jours en arrière"
    return;
  }
  
  setSelectedDate(date);
  onClose();
};
```

### 3. Valider dans SelectedDateContext (sécurité)

```typescript
// Dans SelectedDateContext.tsx
import { subDays, isBefore } from 'date-fns';
import { MAX_TIME_MACHINE_DAYS } from '@/app/constants/historique.constants';

const setSelectedDate = useCallback((date: Date | null) => {
  if (date) {
    const minAllowedDate = subDays(new Date(), MAX_TIME_MACHINE_DAYS);
    if (isBefore(date, minAllowedDate)) {
      console.warn(`Date trop ancienne: ${date}. Limite: ${MAX_TIME_MACHINE_DAYS} jours`);
      return; // Ne pas définir la date si trop ancienne
    }
    
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    setSelectedDateState(normalized);
  } else {
    setSelectedDateState(null);
  }
}, []);
```

### 4. Désactiver les jours trop anciens dans le heatmap

Si possible, désactiver visuellement les jours > 30 jours dans le heatmap pour indiquer qu'ils ne sont pas sélectionnables.

## Alternative : Message informatif au lieu d'interdiction

Au lieu d'interdire, on pourrait :
- Permettre la sélection mais afficher un message : "Les données peuvent être incomplètes pour cette date"
- Charger automatiquement plus de jours si nécessaire (Option 3 partielle)

Mais cela peut être confus pour l'utilisateur.

## Conclusion

**Recommandation finale** : **Option 1 - Limiter à 30 jours** avec validation dans `DayDetailModal` et `SelectedDateContext`, et un message d'erreur clair pour l'utilisateur.

Cette solution est simple, performante, et garantit la cohérence des données affichées.
