# Changelog – Synapso

Historique détaillé des modifications par version. Les trois dernières versions restent dans [context.md](context.md) (section Styleguide / Modifications récentes).

---

### v0.1.11

- **Corrections du problème de hard refresh et des gauges** :
  - **Problème résolu** : Les données nécessitaient un hard refresh pour se mettre à jour, et les gauges affichaient parfois des données incorrectes lors du changement de jour
  - **Refetch explicite** : Ajout d'un `useEffect` dans `useCategoryStats` et `useExercices` qui force un refetch explicite quand `referenceDateKey` change
    - Délai de 100ms pour éviter les refetchs multiples lors du montage initial
    - Garantit que les données sont toujours à jour même si TanStack Query ne détecte pas automatiquement le changement
  - **Configuration agressive des queries** :
    - `staleTime: 0` : Les données sont toujours considérées comme stale pour forcer le refetch
    - `refetchOnMount: true` : Refetch automatique au montage du composant
    - `refetchOnWindowFocus: true` : Refetch quand la fenêtre reprend le focus (utile si on complète un exercice dans un autre onglet)
  - **Invalidation toujours active** : Dans `TimeContext`, toujours forcer `refetchType: 'active'` pour garantir un refetch immédiat lors du changement de jour (même en mode normal)
  - **Gestion du placeholderData** : En mode sablier, ne jamais utiliser `placeholderData` pour éviter d'afficher les anciennes données d'une autre date
  - **État de chargement amélioré** : En mode sablier, considérer comme loading si `isLoading` ou `isFetching` pour éviter d'afficher des données incorrectes pendant le changement de jour
  - **Résultat** : Plus besoin de hard refresh, les données se mettent à jour automatiquement au changement de jour, à la navigation entre pages, et au retour sur l'onglet

### v0.1.10

- **Améliorations design du mode sablier** :
  - **Bannière responsive** : `SelectedDateBanner` améliorée pour mobile avec texte adaptatif ("Aujourd'hui" sur mobile, "Revenir à aujourd'hui" sur desktop)
  - **Lisibilité améliorée** : Utilisation de `truncate` et `line-clamp` pour éviter les débordements de texte sur petits écrans
  - **Cadre cosmique** : `TimeMachineWrapper` avec effet de lueur cosmique subtil via `shadow-[0_0_20px_rgba(99,102,241,0.08)]` pour une distinction visuelle plus douce
  - **Indicateurs visuels** : Badge cosmique discret ajouté dans `ExerciceCard` (coin supérieur droit) avec sablier doré ⏳ pour indiquer visuellement que l'exercice est en mode sablier
  - **Accessibilité** : Amélioration des contrastes et de la lisibilité sur tous les écrans (mobile-first)

### v0.1.9

- **Esthétique cosmique indigo pour le mode sablier** :
  - **Objectif** : Distinction claire avec l'UI des progrès (amber/yellow) pour éviter toute confusion
  - **Bannière** : `SelectedDateBanner` avec fond indigo-900, pattern d'étoiles subtil, sablier doré ⏳, texte blanc
  - **Cadre** : `TimeMachineWrapper` avec bordure indigo-500/40 discrète autour de l'application (uniquement en mode sablier)
  - **Animations différenciées** : `TimeMachineTransition` avec deux animations distinctes :
    - **Entrée** : Fond indigo cosmique avec pattern d'étoiles + sablier doré qui tourne (2 tours)
    - **Sortie** : Fond blanc pur + sablier qui disparaît avec message "Retour à aujourd'hui"
  - **Bannière heatmap** : `ActivityHeatmap` avec bannière indigo cosmique au lieu de jaune/amber
  - **Palette de couleurs** :
    - **Fond** : Indigo-900/950 (bleu nuit, ciel étoilé) avec pattern d'étoiles subtil
    - **Éléments dorés** : Sablier ⏳ et particules d'étoiles en amber-400/yellow-400 pour contraste
    - **Bordures** : Indigo-500/700 avec effet de lueur cosmique
    - **Texte** : Blanc sur fond indigo pour lisibilité optimale (WCAG AA)
  - **Avantages** :
    - Distinction claire entre mode sablier (indigo) et progrès (amber/yellow)
    - Esthétique cosmique et mystique évoquant le voyage dans le temps
    - Accessibilité : Contrastes WCAG AA respectés
    - Simplicité : Effets subtils, pas de surcharge visuelle

### v0.1.8

- **Migration vers TanStack Query** :
  - **Architecture** : Remplacement du cache manuel (`apiCache`) et des événements personnalisés par TanStack Query
  - **Provider** : `QueryProvider` ajouté dans `layout.tsx` avec configuration optimisée
  - **Query Keys** : Centralisées dans `src/app/lib/api-queries.ts` pour éviter les erreurs
  - **Fetch Functions** : Fonctions réutilisables dans `api-queries.ts` pour tous les appels API
  - **Hooks migrés** : `useExercices`, `useHistory`, `useProgress`, `useCategoryStats`, `useTodayCompletedCount` utilisent maintenant `useQuery`
  - **Mutations** : `useCompleteExercice` et `ExerciceForm` utilisent `useMutation` avec optimistic updates
  - **Optimisations** :
    - Optimistic updates avec rollback automatique en cas d'erreur
    - Transitions fluides avec `placeholderData` pour éviter les flashs de contenu vide
    - Options de requête spécifiques selon le type de données (staleTime, gcTime)
    - Préchargement des jours adjacents en mode sablier
  - **DevTools** : `ReactQueryDevtools` disponible en développement pour le debugging
  - **Nettoyage** : Suppression de `apiCache` et des événements personnalisés (`category-stats-refresh`, `exercice-completed-refresh`)
  - **Invalidation** : Invalidation ciblée du cache avec `queryClient.invalidateQueries()` au lieu d'événements

- **Améliorations de performance** :
  - **Optimistic Updates** : Mise à jour immédiate de l'UI avant la réponse serveur dans `useCompleteExercice`
  - **Transitions fluides** : `placeholderData` pour garder les données précédentes pendant le chargement
  - **Préchargement** : `TimeContext` précharge les jours adjacents en arrière-plan pour navigation instantanée
  - **Options spécifiques** : `staleTime` et `gcTime` adaptés selon le type de données

- **Améliorations de code** :
  - **Typage** : Amélioration du typage dans `ExerciceForm` (remplacement de `any` par types explicites)
  - **Gestion d'erreur** : Ajout de `onError` dans toutes les mutations pour meilleure gestion des erreurs
  - **Query Keys** : Optimisation pour éviter la duplication (calcul unique des filtres dans `useExercices`)
  - **Select** : Utilisation de `select` dans `useCategoryStats` pour transformer les données directement dans le cache

### v0.1.7

- **Limitation du mode sablier à 28 jours** :
  - **Constante** : `MAX_TIME_MACHINE_DAYS = 28` dans `historique.constants.ts`
  - **Validation** : `DayDetailModal` et `SelectedDateContext` valident que la date sélectionnée n'est pas > 28 jours
  - **Message d'erreur** : Toast "Tu ne peux remonter que jusqu'à 28 jours en arrière" si tentative de remonter trop loin
  - **Justification** : Garantit que les données sont toujours disponibles (l'historique charge 40 jours par défaut)

- **Cohérence temporelle dans la page historique** :
  - **Filtrage de l'historique** : `filteredHistory` filtre les exercices pour ne garder que ceux complétés jusqu'à la date sélectionnée (inclus)
  - **Filtrage des progrès** : `filteredProgress` filtre les progrès pour ne garder que ceux créés jusqu'à la date sélectionnée (inclus)
  - **Utilisation cohérente** : Tous les hooks et calculs utilisent `filteredHistory` et `filteredProgress` au lieu de `history` et `progressList`
  - **Impact** : Graphiques, statistiques et visualisations reflètent uniquement les données jusqu'à la date sélectionnée
  - **Normalisation** : Utilisation de `startOfDay` et `format` pour comparer uniquement les dates (sans heures)

### v0.1.6

- **Mode "Sablier" (Remonter le temps)** : Fonctionnalité permettant de compléter ou ajouter des exercices pour des jours passés
  - **Accès** : Clic sur n'importe quel jour dans la heatmap ou bouton dans `DayDetailModal`
  - **Interface** : Bannière fixe indigo cosmique avec sablier doré ⏳ + cadre indigo discret autour de l'application
  - **Fonctionnalités** :
    - Vue "machine à remonter le temps" : Les exercices affichent leur état pour le jour sélectionné
    - Complétion d'exercices pour un jour passé (avec `completedAt` personnalisé)
    - Création d'exercices avec date de création personnalisée (fixée à midi du jour sélectionné)
    - Boutons adaptés : "Fait le [date]" au lieu de "Fait aujourd'hui"
  - **Composants** : `SelectedDateContext`, `SelectedDateBanner`, `TimeMachineWrapper`, `TimeMachineTransition`, `DayDetailModal` (bouton sablier)
  - **API** : Support de `targetDate` et `completedAt` dans les routes d'exercices
  - **Design** : Esthétique cosmique indigo (fond indigo-900/950 avec pattern d'étoiles, sablier doré ⏳, bordures indigo) pour distinction claire avec l'UI des progrès (amber/yellow)
  - **Animations différenciées** :
    - **Entrée** : Fond indigo cosmique avec étoiles + sablier doré qui tourne
    - **Sortie** : Fond blanc pur + sablier qui disparaît avec message "Retour à aujourd'hui"
  - **Adaptations complètes** :
    - **Hooks** : `useCategoryStats`, `useTodayCompletedCount`, `usePeriodNavigation` adaptés pour utiliser la date sélectionnée
    - **Fonctions utilitaires** : `getLast7DaysData`, `getCurrentWeekData`, `calculateCurrentStreak` acceptent un paramètre `referenceDate`
    - **Composants UI** : `DailyGoalProgress` (label adaptatif "Objectif du [date]"), `WelcomeHeaderGreeting` (salutation adaptée avec date), `BarChart` (mise en évidence du jour sélectionné), `ProgressStatsChart` (limite du graphique basée sur la date sélectionnée)
    - **Synchronisation** : Toutes les statistiques, graphiques et compteurs affichent les données du jour sélectionné (compteur d'exercices, objectif du jour, calendrier de la semaine, série en cours)

### v0.1.4

- **Module Journal** : Module de notes uniquement (tâches supprimées)
  - **Notes** : Titre, description, date optionnelle ; épingle "Pour le kiné", validation, partage
  - Routes : `/journal`, `/journal/add`, `/journal/edit/[id]`
  - Composants : `JournalNoteCard` (carte blanche), `JournalNotesList`
  - Hooks : `useJournalNotes`, `useJournalCheck`, `usePinJournalNote`, `useValidateJournalNote`, `useShareJournalNote`
  - API : `/api/journal/notes`, `/api/journal/notes/[id]`, `/api/journal/notes/[id]/pin`, `/api/journal/notes/[id]/validate`
  - **Onglet Kiné (page d'accueil)** : Sections titrées "Exercices", "Progrès", "Notes pour le kiné" pour les éléments épinglés

### v0.1.3

- **Filtres** : Ajout du badge "Tous" pour réinitialiser rapidement les filtres (équipements et bodyparts)
- **Badges équipements** : Style blanc avec bordure pour cohérence avec les filtres, cliquables pour navigation vers la page de filtres
- **Navigation retour** : Bouton retour sur la page de création d'exercice qui ramène à la page d'origine (catégorie ou équipements)
- **Simplification** : Retrait des compteurs sur les badges "Tous" pour réduire la surcharge visuelle
- **Mobile first** : Effets hover uniquement sur desktop (`md:hover:`), feedback tactile avec `active:` pour mobile
