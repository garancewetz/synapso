# Prompt : Analyse et évaluation de l'architecture avec TanStack Query

## Contexte actuel

L'application Synapso utilise actuellement :
- **Système de cache manuel** : `apiCache` (classe singleton) pour gérer le cache des requêtes API
- **Context pour la date sélectionnée** : `SelectedDateContext` pour gérer le mode sablier
- **Hooks personnalisés** : `useExercices`, `useHistory`, `useProgress`, `useCategoryStats`, etc. avec `useState` et `useEffect`
- **Événements personnalisés** : `exercice-completed-refresh`, `category-stats-refresh` pour la communication entre composants

## Proposition d'architecture

### 1. Utiliser TanStack Query (React Query) pour les données
**Avantages proposés** :
- Cache automatique et intelligent
- Gestion automatique du loading/error states
- Refetch automatique lors du focus/navigation
- Pas besoin de gérer manuellement le cache
- Si l'utilisateur passe de "Hier" à "Aujourd'hui" puis revient sur "Hier", la donnée s'affiche instantanément

**Inconvénients potentiels** :
- Ajout d'une dépendance externe (~50KB)
- Courbe d'apprentissage pour l'équipe
- Migration de tous les hooks existants
- Risque de régression pendant la migration

### 2. Utiliser l'URL pour la date sélectionnée
**Format proposé** : `/dashboard/2026-02-04` ou `/historique?date=2026-02-04`

**Avantages proposés** :
- Partage de lien possible
- Bouton "Retour" du navigateur fonctionne intuitivement
- État de navigation visible dans l'URL
- Pas besoin de Context pour la navigation

**Inconvénients potentiels** :
- Gestion du formatage des dates dans l'URL
- Validation des paramètres d'URL
- Migration de tous les composants qui utilisent `SelectedDateContext`
- Gestion des cas edge (dates invalides, dates trop anciennes)

### 3. Garder Context uniquement pour User
**Avantage** : Séparation claire entre données utilisateur (rarement changeantes) et navigation (fréquemment changeante)

## Analyse de l'architecture actuelle

### Points forts actuels
1. **Système de cache fonctionnel** : `apiCache` est simple, léger, et fonctionne bien
2. **Performance optimisée** : Indexation des données, mémorisation React, invalidation ciblée
3. **Réactivité en temps réel** : Système d'événements pour la communication entre composants
4. **Pas de dépendance externe** : Pas besoin d'installer TanStack Query

### Points faibles actuels
1. **Gestion manuelle du cache** : Il faut invalider manuellement le cache aux bons endroits
2. **Duplication de code** : Chaque hook répète la logique de fetch/cache/loading/error
3. **Pas de partage de lien** : Impossible de partager un lien vers un jour spécifique en mode sablier
4. **Bouton retour navigateur** : Ne fonctionne pas pour revenir à "aujourd'hui" depuis un jour passé

## Évaluation de la migration

### Question 1 : TanStack Query est-il nécessaire ?

**Analyse** :
- L'application fonctionne déjà bien avec le système actuel
- Le cache manuel est simple et efficace
- La réactivité en temps réel est déjà implémentée
- Les hooks sont bien optimisés avec mémorisation

**Verdict** : 
- **Option A (Recommandée)** : Garder le système actuel mais l'améliorer
  - Avantages : Pas de migration, pas de dépendance externe, système déjà optimisé
  - Inconvénients : Gestion manuelle du cache (mais déjà bien faite)
  
- **Option B** : Migrer vers TanStack Query
  - Avantages : Cache automatique, moins de code boilerplate, standard de l'industrie
  - Inconvénients : Migration majeure, nouvelle dépendance, risque de régression

**Recommandation** : **Option A** - Le système actuel est déjà performant et bien optimisé. Une migration vers TanStack Query serait un changement architectural majeur pour un gain limité.

### Question 2 : URL pour la date sélectionnée est-elle pertinente ?

**Analyse** :
- Le mode sablier est une fonctionnalité de navigation temporelle
- Le partage de lien serait utile pour partager un jour spécifique
- Le bouton retour navigateur serait intuitif pour revenir à "aujourd'hui"
- L'URL est déjà utilisée pour certaines pages (ex: `/exercices/[category]`)

**Verdict** : **OUI, c'est pertinent** - Utiliser l'URL pour la date sélectionnée apporterait des avantages UX significatifs.

**Format recommandé** :
- Mode normal : `/` (pas de paramètre)
- Mode sablier : `/?date=2026-02-04` ou `/historique?date=2026-02-04`
- Alternative : Route dédiée `/jour/2026-02-04` qui redirige vers la homepage avec le paramètre

## Plan d'implémentation recommandé (Hybride)

### Phase 1 : Migration de la date vers l'URL (Sans TanStack Query)

**Objectif** : Utiliser l'URL pour la date sélectionnée tout en gardant le système de cache actuel.

**Modifications** :

1. **Créer un hook `useSelectedDateFromURL`**
   - Lire le paramètre `date` depuis l'URL (via `useSearchParams` de Next.js)
   - Valider que la date est dans les 28 derniers jours
   - Retourner `selectedDate`, `selectedDateKey`, `isTimeMachineMode`
   - Fournir `setSelectedDate` qui met à jour l'URL

2. **Modifier `SelectedDateContext` pour utiliser l'URL**
   - Au lieu de `useState`, utiliser `useSearchParams` de Next.js
   - `setSelectedDate(date)` → `router.push(/?date=2026-02-04)`
   - `clearSelectedDate()` → `router.push(/)`

3. **Adapter tous les composants**
   - Remplacer `useSelectedDate()` par `useSelectedDateFromURL()` (ou garder le même nom)
   - S'assurer que les clics sur les jours mettent à jour l'URL

**Avantages** :
- Partage de lien possible
- Bouton retour navigateur fonctionne
- Pas de changement majeur dans les composants (même API)
- Pas besoin de TanStack Query

**Fichiers à modifier** :
- `src/app/contexts/SelectedDateContext.tsx` → Utiliser `useSearchParams` au lieu de `useState`
- Tous les composants qui appellent `setSelectedDate()` → Utiliser `router.push()` avec le paramètre

### Phase 2 (Optionnelle) : Migration vers TanStack Query

**Si décision de migrer** :

1. **Installer TanStack Query**
   ```bash
   npm install @tanstack/react-query
   ```

2. **Créer un QueryClientProvider**
   - Configurer le cache (staleTime, cacheTime)
   - Wrapper l'application dans `QueryClientProvider`

3. **Migrer les hooks un par un**
   - `useExercices` → `useQuery(['exercices', userId, date])`
   - `useHistory` → `useQuery(['history', userId, since])`
   - `useProgress` → `useQuery(['progress', userId])`
   - `useCategoryStats` → `useQuery(['categoryStats', userId, date])`

4. **Utiliser les mutations pour les updates**
   - `useCompleteExercice` → `useMutation` avec `onSuccess: () => queryClient.invalidateQueries(['exercices'])`
   - `ExerciceForm` → `useMutation` pour créer/éditer

**Avantages** :
- Cache automatique et intelligent
- Moins de code boilerplate
- Gestion automatique du loading/error
- Refetch automatique

**Inconvénients** :
- Migration majeure de tous les hooks
- Nouvelle dépendance
- Risque de régression

## Recommandation finale

### Approche recommandée : **Migration progressive hybride**

1. **Étape 1 (Prioritaire)** : Migrer la date sélectionnée vers l'URL
   - **Impact** : Moyen (modification de `SelectedDateContext` et quelques composants)
   - **Bénéfice** : Partage de lien, bouton retour navigateur
   - **Risque** : Faible (même API, juste changement d'implémentation)

2. **Étape 2 (Optionnelle)** : Évaluer TanStack Query après l'étape 1
   - **Impact** : Majeur (migration de tous les hooks)
   - **Bénéfice** : Cache automatique, moins de code
   - **Risque** : Moyen (migration importante, risque de régression)

### Pourquoi cette approche ?

- **L'URL pour la date** apporte des avantages UX concrets (partage, bouton retour) avec un risque faible
- **TanStack Query** apporte des avantages techniques mais le système actuel fonctionne déjà bien
- **Migration progressive** permet d'évaluer les bénéfices étape par étape

## Questions à se poser avant de migrer vers TanStack Query

1. **Le système actuel pose-t-il des problèmes concrets ?**
   - Si non → Pas besoin de migrer
   - Si oui → Identifier les problèmes spécifiques

2. **Les avantages de TanStack Query justifient-ils la migration ?**
   - Cache automatique vs cache manuel (actuellement bien géré)
   - Moins de code vs code déjà optimisé
   - Standard de l'industrie vs solution custom fonctionnelle

3. **Quel est le coût de la migration ?**
   - Temps de développement
   - Risque de régression
   - Courbe d'apprentissage

## Conclusion

**Recommandation immédiate** : Migrer la date sélectionnée vers l'URL (Phase 1)

**Recommandation TanStack Query** : Évaluer après la Phase 1, mais pas prioritaire si le système actuel fonctionne bien.

L'architecture actuelle est déjà performante et bien optimisée. Une migration vers TanStack Query serait un "nice to have" plutôt qu'une nécessité.
