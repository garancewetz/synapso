# Context - Synapso

## 📋 Vue d'ensemble

**Synapso** est une application web Progressive Web App (PWA) de rééducation conçue spécifiquement pour des personnes ayant subi un AVC (Accident Vasculaire Cérébral). L'application permet de gérer des exercices physiques de rééducation, de suivre sa progression, et de célébrer ses réussites.

### Objectif principal

Offrir un outil numérique **simple, intuitif, accessible et encourageant** pour accompagner les personnes en rééducation post-AVC dans leur parcours de récupération. L'interface est pensée pour minimiser la charge cognitive et maximiser l'encouragement.

### Approche Mobile First

**Synapso est une application mobile first** : l'expérience mobile est la priorité absolue. Tous les efforts doivent être mis en œuvre pour garantir une **performance optimale** et une **fluidité parfaite** sur les appareils mobiles. Chaque décision de design, d'architecture et d'implémentation doit être évaluée selon son impact sur l'expérience mobile, en privilégiant :
- Des temps de chargement minimaux
- Des animations fluides (60fps)
- Une réactivité immédiate aux interactions tactiles
- Une optimisation du bundle JavaScript
- Une gestion efficace de la mémoire
- Des requêtes réseau optimisées

---

## 👥 Utilisateurs cibles

### Profil principal
Personnes en rééducation après un AVC, avec possibilité de :
- **Troubles moteurs** : nécessité d'exercices physiques ciblés par zones du corps
- **Préférences individuelles** : main dominante (gauche/droite), fréquence de réinitialisation des exercices (quotidienne/hebdomadaire)

### Besoins spécifiques
- **Simplicité** : Navigation claire, actions évidentes, pas de complexité inutile
- **Intuitivité** : Flux logiques, feedback immédiat, pas de confusion possible
- **Accessibilité** : Navigation au clavier, contrastes élevés, textes lisibles, support des lecteurs d'écran
- **Encouragement** : Feedback positif, célébration des réussites, progression visible, messages motivants

---

## 🛠️ Architecture technique

### Principe Mobile First

**Cette PWA est conçue mobile first** : l'architecture, les composants et les optimisations sont pensés en priorité pour les appareils mobiles. Tous les efforts doivent être mis en œuvre pour garantir :

- **Performance mobile** : Temps de chargement minimal, bundle JavaScript optimisé, lazy loading des composants lourds
- **Fluidité mobile** : Animations à 60fps, transitions fluides, pas de lag ou de freeze
- **Réactivité tactile** : Feedback immédiat aux interactions, zones de touch généreuses, pas de délai perceptible
- **Optimisation réseau** : Requêtes API optimisées, cache efficace, réduction du transfert de données
- **Gestion mémoire** : Éviter les fuites mémoire, optimiser les re-renders, mémorisation intelligente

Chaque fonctionnalité doit être testée et optimisée sur mobile avant d'être considérée comme terminée.

### Stack technologique

#### Frontend
- **Framework** : Next.js 16.1.6 (App Router)
- **Runtime** : React 19.2.3
- **Langage** : TypeScript 5.7.2
- **Styling** : Tailwind CSS 4.1.18
- **Animations** : Framer Motion 12.23.24
- **Graphiques** : Recharts 3.6.0
- **Gestion d'état serveur** : TanStack Query 5.x (React Query)
- **Utilitaires** : 
  - `clsx` 2.1.1 (classes conditionnelles)
  - `date-fns` 4.1.0 (manipulation de dates)

#### Backend
- **Base de données** : PostgreSQL (hébergement Neon)
- **ORM** : Prisma 6.17.1
- **API** : Next.js API Routes (App Router)

#### Infrastructure
- **Hébergement** : Netlify
- **PWA** : Service Worker, Manifest, Icons
- **Authentification** : Cookie HTTP-only sécurisé

### Structure du projet

```
synapso/
├── prisma/
│   ├── schema.prisma           # Modèle de données
│   ├── seed.ts                 # Données initiales
│   └── migrations/             # Historique des migrations
├── src/
│   └── app/
│       ├── (pages)/            # Pages de l'application (App Router)
│       │   ├── page.tsx        # Page d'accueil (dashboard)
│       │   ├── exercice/       # Gestion des exercices (ajout, édition)
│       │   ├── exercices/      # Vues par catégorie
│       │   ├── historique/     # Suivi de progression et victoires
│       │   └── settings/       # Paramètres utilisateur
│       ├── api/                # Routes API (Next.js API Routes - wrappers HTTP)
│       │   ├── exercices/      # Routes exercices (appellent features/exercices/api/)
│       │   ├── progress/       # Routes progrès (appellent features/progress/api/)
│       │   ├── history/        # Route historique (appelle features/historique/api/)
│       │   ├── journal/        # Routes journal (appellent features/journal/api/)
│       │   ├── auth/           # Routes auth (appellent features/auth/api/)
│       │   ├── users/          # Routes utilisateurs (appellent features/auth/api/)
│       │   ├── metadata/       # Métadonnées (appelle features/exercices/api/)
│       │   ├── stats/          # Statistiques (appelle features/historique/api/)
│       │   ├── bodyparts/      # Bodyparts (appellent features/exercices/api/)
│       │   ├── equipments/     # Équipements (appelle features/exercices/api/)
│       │   ├── admin/          # Routes admin
│       │   └── dev/            # Routes dev
│       ├── features/           # Features organisées par domaine métier
│       │   ├── exercices/      # Exercices de rééducation
│       │   │   ├── api/        # Logique métier des routes API
│       │   │   ├── components/ # Composants (ExerciceCard, ExerciceForm, etc.)
│       │   │   ├── hooks/      # Hooks (useExercices, useCompleteExercice, useCategoryFilters, etc.)
│       │   │   └── utils/      # Utilitaires spécifiques
│       │   ├── historique/     # Historique et visualisations
│       │   │   ├── api/        # Logique métier des routes API
│       │   │   ├── components/ # Composants (ActivityHeatmap, BarChart, etc.)
│       │   │   ├── hooks/      # Hooks (useHistory, useDayDetailData, etc.)
│       │   │   └── utils/      # Utilitaires spécifiques
│       │   ├── progress/       # Progrès et victoires
│       │   │   ├── components/ # Composants (ProgressFAB, ProgressCard, etc.)
│       │   │   └── hooks/      # Hooks (useProgress, etc.)
│       │   ├── home/           # Page d'accueil
│       │   │   ├── components/ # Composants (WelcomeHeader, HomeTabs, etc.)
│       │   │   └── hooks/      # Hooks (useHomeTabs)
│       │   ├── journal/        # Module journal
│       │   │   ├── components/ # Composants (JournalNoteCard, JournalNotesList, etc.)
│       │   │   └── hooks/      # Hooks (useJournalNotes, useJournalCheck, etc.)
│       │   ├── time-machine/   # Mode sablier (remonter le temps)
│       │   │   ├── components/ # Composants (SelectedDateBanner, etc.)
│       │   │   └── hooks/      # Hooks (usePrefetchPreviousDates, etc.)
│       │   └── auth/           # Authentification
│       │       ├── api/        # Logique métier des routes API
│       │       ├── components/ # Composants (AuthScreen, UserSetup, etc.)
│       │       └── hooks/      # Hooks spécifiques
│       ├── components/         # Composants React réutilisables
│       │   ├── ui/             # Composants UI de base (Button, Card, Badge, etc.)
│       │   └── ...             # Composants partagés (NavBar, BottomNavBar, etc.)
│       ├── contexts/           # Contextes React (état global)
│       │   ├── UserContext.tsx        # Utilisateur courant
│       │   ├── ToastContext.tsx       # Notifications globales
│       │   ├── DayDetailModalContext.tsx # Modal détail du jour
│       │   ├── SelectedDateContext.tsx # Date sélectionnée (mode sablier)
│       │   └── TimeContext.tsx        # Contexte temporel global
│       ├── hooks/              # Hooks personnalisés
│       ├── providers/          # Providers React
│       │   └── QueryProvider.tsx     # Provider TanStack Query
│       ├── lib/                # Bibliothèques et utilitaires
│       │   └── api-queries.ts  # Fonctions API et query keys TanStack Query
│       ├── types/              # Types TypeScript
│       ├── constants/          # Constantes (couleurs, icônes, etc.)
│       └── utils/              # Fonctions utilitaires
├── public/                     # Fichiers statiques (PWA assets)
├── scripts/                    # Scripts utilitaires
└── tests/
    └── e2e/                    # Tests E2E Playwright
        ├── helpers/            # AuthHelper, TimeMachineHelper, test-constants (compte Testeuse)
        ├── *.spec.ts           # login, navigation, exercices, progress, time-machine, settings, journal, sharing, archivage
        └── playwright.config.ts
```

---

### Organisation par Features

**Principe** : L'application est organisée par **features** (domaines métier) plutôt que par type technique. Chaque feature contient tous les éléments nécessaires à sa fonctionnalité (composants, hooks, utils, types).

**Avantages** :
- **Cohésion** : Tous les éléments d'une feature sont regroupés
- **Maintenabilité** : Facile de trouver et modifier le code d'une fonctionnalité
- **Scalabilité** : Ajout de nouvelles features sans impacter les existantes
- **Réutilisabilité** : Export centralisé via `index.ts` dans chaque feature

**Structure d'une feature** :
```
features/[feature-name]/
├── components/    # Composants spécifiques à la feature
├── hooks/         # Hooks spécifiques à la feature
├── api/           # Logique métier API (server-side, fonctions pures)
│   ├── getXxx.ts  # Fonctions de récupération
│   ├── createXxx.ts
│   ├── updateXxx.ts
│   ├── deleteXxx.ts
│   └── index.ts   # Exports centralisés
├── utils/         # Utilitaires spécifiques à la feature
├── types/         # Types TypeScript spécifiques (optionnel)
└── index.ts       # Exports centralisés
```

**Features principales** :
- `exercices/` : Gestion des exercices de rééducation (ExerciceCard, ExerciceForm, complétion, ConfettiValidate, CategoryAffinerSection, useCategoryFilters, etc.)
- `historique/` : Visualisations et historique (heatmap, graphiques, statistiques)
- `progress/` : Progrès et victoires (ProgressFAB, ProgressCard, célébrations)
- `home/` : Page d'accueil (WelcomeHeader, onglets, dashboard)
- `journal/` : Module journal (notes)
- `time-machine/` : Mode sablier (remonter le temps, SelectedDateBanner)
- `auth/` : Authentification (AuthScreen, UserSetup)

**Composants partagés** : Les composants réutilisables entre features restent dans `components/` (UI de base, NavBar, BottomNavBar, etc.)

**Routes API** : Les routes API (`route.ts`) restent dans `app/api/` (obligatoire pour Next.js) mais appellent la logique métier extraite dans `features/[feature]/api/`. Les routes deviennent des wrappers minces qui gèrent l'authentification, la validation HTTP et les réponses.

---

## 🗄️ Modèle de données (Prisma)

### Entités principales

#### User
Représente un utilisateur de l'application.

```prisma
model User {
  id             Int                @id @default(autoincrement())
  name           String             @unique
  resetFrequency ResetFrequency     @default(DAILY)  // DAILY | WEEKLY
  dominantHand   DominantHand       @default(RIGHT)  // LEFT | RIGHT
  hasJournal     Boolean            @default(false)
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
  
  // Relations
  exercices      Exercice[]
  progress       Progress[]
  journalNotes   JournalNote[]
}
```

**Particularités** :
- `resetFrequency` : détermine si les exercices se réinitialisent chaque jour ou chaque semaine
- `dominantHand` : inverse automatiquement certains layouts (ex: boutons d'action)
- `hasJournal` : active/désactive le module journal

#### Exercice
Exercices de rééducation physique.

```prisma
model Exercice {
  id                 Int                @id @default(autoincrement())
  name               String
  descriptionText    String
  descriptionComment String?
  workoutRepeat      String?            // Nombre de répétitions
  workoutSeries      String?            // Nombre de séries
  workoutDuration    String?            // Durée
  equipments         String             // JSON array d'équipements
  category           ExerciceCategory   // UPPER_BODY | CORE | LOWER_BODY | STRETCHING
  completed          Boolean            @default(false)
  completedAt        DateTime?
  pinned             Boolean            @default(false)
  userId             Int
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  
  // Relations
  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  bodyparts          ExerciceBodypart[]
  history            History[]
}
```

**Particularités** :
- Catégories : 4 zones du corps avec code couleur distinct
- `pinned` : permet d'épingler un exercice en haut de liste
- `history` : historique complet de toutes les complétions (pour stats et heatmap)
- `completed` et `completedAt` : état de complétion actuel (se réinitialise selon `resetFrequency`)

#### Bodypart
Parties du corps associées aux exercices (relation many-to-many).

```prisma
model Bodypart {
  id        Int                @id @default(autoincrement())
  name      String             @unique
  exercices ExerciceBodypart[]
}
```

Exemples : Bras, Mains, Épaules, Dos, Jambes, Fessier, etc.

#### History
Historique de complétion des exercices (chaque fois qu'un exercice est marqué comme fait).

```prisma
model History {
  id          Int      @id @default(autoincrement())
  exerciceId  Int
  completedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  exercice    Exercice @relation(fields: [exerciceId], references: [id], onDelete: Cascade)
}
```

**Usage** : Permet de générer des statistiques, heatmaps, et de tracker la fréquence réelle des exercices (même si `completed` se réinitialise).

#### JournalNote
Notes du journal (infos à partager avec le kiné, suivi personnel).

```prisma
model JournalNote {
  id          Int       @id @default(autoincrement())
  title       String    // Titre de la note
  description String    @default("")  // Contenu / description
  date        DateTime? // Date optionnelle (événement lié)
  pinned      Boolean   @default(false)  // Marqué "pour le kiné"
  validated   Boolean   @default(false)  // Validé (par le kiné ou le patient)
  validatedAt DateTime?
  userId      Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([pinned])
  @@index([validated])
  @@index([date])
}
```

**Particularités** :
- Notes libres avec titre et description
- Date optionnelle pour associer une note à un événement
- `pinned` : affichées dans l’onglet Kiné de la page d’accueil
- `validated` : badge "Validé" et action de validation

#### Progress
Progrès et réussites à célébrer.

```prisma
model Progress {
  id        Int      @id @default(autoincrement())
  content   String   // Description du progrès
  emoji     String?  // Emoji catégorie (🦺, 👖, 🧘‍♀️, 👉, 💬)
  tags      String[] // Tags prédéfinis (Force, Souplesse, Équilibre, Confort)
  medias    String[] // URLs des médias/photos associés
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Particularités** :
- L'`emoji` permet de catégoriser le progrès (corps/journal)
- Utilisé pour générer des graphiques de progression et une timeline
- Emoji journal : 📔 (`JOURNAL_EMOJI`)
- Support des médias : photos associées aux progrès (affichage avec expandable et lightbox)

---

## 🎨 Fonctionnalités principales

### 1. Dashboard (Page d'accueil)

**Route** : `/` (`src/app/(pages)/page.tsx`)

Interface unifiée avec système d'onglets :
- **Exercices** : Vue des catégories d'exercices avec progression
- **Kiné** : Éléments épinglés pour le kiné (exercices, progrès, notes) avec sections titrées : "Exercices", "Progrès", "Notes pour le kiné"
- **Suivi** : Accès à l'historique, roadmap (40 derniers jours), et victoires
- Lien vers **Journal** (`/journal`) et **Paramètres** depuis le contenu

**Composants clés** :
- `HomeExercicesTab`, `HomeKineTab`, `HomePlusTab` : Contenu des onglets
- `CategoryCardWithProgress` : Cartes de catégories avec barre de progression
- `ProgressFAB` : Bouton flottant "Noter un progrès"
- `ProgressBottomSheet` : Modal pour créer/éditer un progrès

### 2. Exercices de rééducation

#### Organisation par catégories

4 catégories avec code couleur :
- 🦺 **Haut du corps** (Orange) : Bras, Mains, Épaules, Cou & Nuque
- 👉 **Milieu du corps** (Teal) : Dos, Corps, Bassin
- 👖 **Bas du corps** (Bleu) : Jambes, Fessier, Pied
- 🧘‍♀️ **Étirement** (Violet) : Étirements de toutes zones

**Code couleur** : Défini dans `src/app/constants/exercice.constants.ts` (source unique de vérité)

#### Page catégorie

**Route** : `/exercices/[category]` (ex: `/exercices/upper_body`)

**Composants** :
- `ExerciceCard` : Carte d'exercice avec détails, bouton de complétion, actions (éditer/supprimer)
- `CompleteButton` : Bouton intelligent qui affiche l'état de complétion
  - Non fait : "Fait aujourd'hui" (gris)
  - Fait aujourd'hui : "Fait" (vert émeraude)
  - Mode hebdomadaire avec compteur : "Fait (3× cette semaine)" quand `weeklyCount > 1`
  - **Mode sablier** : "Fait le [date]" (adapte le label selon la date sélectionnée)
- `StatusFilterSection` : Filtre d'état (Tous / Non faits / Faits)
- `CategoryAffinerSection` : Bloc repliable "Affiner la liste" contenant les filtres partie du corps et équipement (réduit la charge cognitive, zone tactile 44px, transition fluide)
- `FilterBadge` : Badges partie du corps (couleurs catégorie) et équipement (variant blanc)
- `useCategoryFilters` : Hook qui centralise l'état et la logique des filtres (bodyparts, équipements, listes filtrées, étirements liés)

**Filtres disponibles** :
- **Filtre d'état** : Tous / Non faits / Faits (toujours visible)
- **Affiner (repliable)** : Partie du corps + Équipement. Seuls les équipements et parties du corps présents dans les cartes de la catégorie sont proposés. Badge avec le nombre de filtres actifs quand au moins un est sélectionné.

**ExerciceCard / Header** :
- En **mode DAILY** : badge vert "Fait" en haut à droite quand `completedToday` (position absolue + `pr-24` pour éviter le saut du titre à l'affichage).
- En **mode WEEKLY** : `WeeklyCompletionIndicator` (badge N× cliquable + calendrier des 7 jours). Pas de badge "Fait" séparé ; le compteur hebdomadaire suffit.

**Célébration** : À la confirmation serveur d'une complétion, `ConfettiValidate` déclenche une explosion de confettis émeraude depuis le bouton (animation courte, expansion horizontale, disparition en fondu). Pas de contour vert sur la carte (évite le doublon).

**Note** : Pour la logique détaillée des compteurs dans les badges de filtre, voir la section "Logique des compteurs dans les badges de filtre" dans la page filtrage par équipement.

#### Page filtrage par équipement

**Route** : `/exercices/equipments`

**Fonctionnalités** :
- Filtrage des exercices par équipement(s) sélectionné(s)
- Sélection multiple d'équipements via badges cliquables
- Badge "Tous" pour réinitialiser rapidement les filtres (sans compteur)
- Filtre complémentaire : Tous / Non faits / Faits
- Synchronisation avec l'URL (query param `equipments`)
- Affichage groupé par catégorie avec compteurs
- Bouton "Ajouter un exercice" avec paramètre `from` pour navigation retour

**Composants** :
- `useEquipmentMetadata` : Hook pour récupérer les équipements avec leurs compteurs
- `useExercices` : Hook avec support du filtrage par équipements (côté serveur)
- `StatusFilterBadge` : Badges de filtre d'état (Tous / Non faits / Faits)
- `EquipmentFilterBadge` : Badges de filtre d'équipement avec icônes et compteurs

**Logique des compteurs dans les badges de filtre** :

Pour garantir une expérience utilisateur **simple et claire**, les compteurs suivent une logique unifiée et prévisible :

##### Principe fondamental

**Seuls les filtres de type "ressource" (équipements, parties du corps) affichent des compteurs. Les filtres d'état n'affichent pas de compteurs pour éviter la confusion.**

Cette simplification garantit que :
- Les compteurs sont **toujours stables** et ne changent jamais
- L'utilisateur comprend immédiatement ce que représente chaque compteur
- L'information sur le nombre d'exercices filtrés reste visible dans le header de la page

##### 1. Badges d'équipement (page `/exercices/equipments`)

**Comportement** : Compteurs **stables** qui ne changent jamais

- **Ce qu'ils affichent** : Le total d'exercices utilisant cet équipement (tous exercices confondus)
- **Source** : `/api/metadata` qui calcule sur **tous** les exercices de l'utilisateur
- **Exemple** : Badge "Tapis" affiche toujours "12" même si on filtre par "Non faits"
- **Pourquoi** : L'utilisateur veut savoir combien d'exercices utilisent le tapis au total, pas combien sont actuellement visibles
- **Badge "Tous"** : Aucun compteur (évite la confusion, représente tous les exercices)

##### 2. Badges d'état (Tous / Non faits / Faits)

**Comportement** : **Aucun compteur** affiché

- **Pourquoi** : Les compteurs d'état changeaient selon les équipements/bodyparts sélectionnés, créant de la confusion
- **Alternative** : L'information est visible dans le header de la page qui affiche le nombre d'exercices filtrés
- **Avantage** : Interface plus simple, moins de nombres qui bougent, focus sur l'action plutôt que sur les statistiques

##### 3. Badges de parties du corps (page catégorie `/exercices/[category]`)

**Comportement** : Compteurs **stables** qui ne changent jamais

- **Ce qu'ils affichent** : Le total d'exercices ciblant cette partie du corps dans la catégorie
- **Source** : Calculés sur **tous** les exercices de la catégorie (non filtrés par état)
- **Exemple** : Badge "Bras" affiche toujours "8" même si on filtre par "Faits"
- **Pourquoi** : L'utilisateur veut savoir combien d'exercices ciblent les bras dans cette catégorie, pas combien sont actuellement visibles
- **Badge "Tous"** : Aucun compteur (évite la confusion, représente tous les exercices de la catégorie)

##### Règle de cohérence simplifiée

**Filtres de type "ressource" (équipements, parties du corps)** :
- ✅ **Affichent des compteurs** = Total disponible dans le contexte
- ✅ **Stables** = Ne changent jamais selon les autres filtres
- ✅ **Clairs** = Permettent de comprendre l'étendue des options

**Filtres de type "état" (fait/non fait)** :
- ❌ **Pas de compteurs** = Évite la confusion des nombres qui changent
- ✅ **Information disponible** = Visible dans le header de la page
- ✅ **Simple** = Focus sur l'action plutôt que sur les statistiques

**Particularités** :
- Les équipements sont récupérés depuis tous les exercices de l'utilisateur (via `/api/metadata`)
- Filtrage côté serveur pour optimiser les performances
- URL partageable avec les équipements sélectionnés
- Adaptation au layout selon la main dominante (LEFT/RIGHT)
- Navigation retour : Le bouton "Ajouter un exercice" passe le paramètre `from` pour permettre un retour à la page équipements

#### Ajout/Édition d'exercice

**Routes** : `/exercice/add`, `/exercice/edit/[id]`

**Formulaire** (`ExerciceForm`) :
- Nom de l'exercice
- Catégorie (4 options avec code couleur)
- Description (texte + commentaire optionnel)
- Paramètres d'entraînement (répétitions, séries, durée)
- Parties du corps (multi-sélection avec badges)
- Équipements (multi-sélection)

**Validation** : Nom obligatoire, catégorie par défaut `UPPER_BODY`

**Navigation retour** :
- Le bouton "Ajouter un exercice" sur les pages catégorie et équipements passe le paramètre `from` dans l'URL
- La page de création affiche un bouton retour (`BackButton`) qui ramène à la page d'origine
- Le label du bouton retour est généré automatiquement via `getCurrentPageName()` (ex: "Retour à Haut du corps", "Retour à Filtrer par équipement")

#### Complétion d'exercice

**Logique** :
1. Clic sur `CompleteButton` → Création d'une entrée `History`
2. Mise à jour de `completed = true` et `completedAt = now()`
3. Si déjà complété (décompléter) → Suppression de l'entrée `History` correspondante
4. Réinitialisation automatique selon `resetFrequency` :
   - `DAILY` : à minuit chaque jour
   - `WEEKLY` : le lundi à minuit chaque semaine

**API `PATCH /api/exercices/[id]/complete`** :
- Accepte `completedAt` dans le body (date cible, ex. jour en mode sablier).
- Retourne toujours `weeklyCompletions` : tableau des dates de complétion de la **semaine** contenant `completedAt` (calcul via `getStartOfPeriod('WEEKLY', completedAt)`). Ainsi en mode WEEKLY, après compléter ou décompléter, le front reçoit le bon compteur (x1, x2, x3…) et met à jour le cache sans incohérence.

**Hook** : `useCompleteExercice` (TanStack `useMutation`) : appelle l'API, reçoit `completed`, `completedToday`, `completedAt`, `weeklyCompletions` ; convertit les dates ISO en `Date` ; met à jour le cache via `onCompleted(updatedExercice)` et invalide `exercices`, `history`, `categoryStats`, `todayCompletedCount`. `useExercices` fournit `updateExercice` pour le `setQueryData` local.

#### Mode "Sablier" (Remonter le temps)

**Concept** : Permet aux utilisateurs de compléter ou ajouter des exercices pour des jours passés s'ils ont oublié de le faire. Cette fonctionnalité offre une flexibilité importante pour les personnes qui peuvent avoir des difficultés à suivre leur routine quotidienne.

**Accès** :
- Via la heatmap d'activité (`/historique`) : Clic sur n'importe quel jour (vide ou avec exercices)
- Modal `DayDetailModal` : Bouton "Ajouter des exercices pour ce jour" (style sablier avec emoji ⏳)

**Fonctionnement** :
1. **Sélection d'un jour passé** : Clic sur un jour dans la heatmap ou bouton dans la modal
2. **Limitations temporelles** : 
   - **Maximum 28 jours en arrière** : L'utilisateur ne peut remonter que jusqu'à 28 jours dans le passé
   - **Pas de dates futures** : L'utilisateur ne peut pas sélectionner une date dans le futur (on ne peut pas voyager vers le futur)
   - **Validations** :
     - Si l'utilisateur tente de sélectionner un jour > 28 jours, un toast s'affiche : "Tu ne peux remonter que jusqu'à 28 jours en arrière"
     - Si l'utilisateur tente de sélectionner une date future, un toast s'affiche : "Tu ne peux pas voyager vers le futur"
     - Les validations sont effectuées dans `SelectedDateContext` (lecture depuis l'URL) et `DayDetailModal` (bouton sablier)
   - **Justification** : 
     - Limite de 28 jours : Garantit que les données sont toujours disponibles (l'historique charge 40 jours par défaut, donc 28 jours max = marge de sécurité)
     - Pas de futur : Le mode sablier permet de compléter des exercices oubliés dans le passé, pas de planifier pour le futur
   - **Constante** : `MAX_TIME_MACHINE_DAYS = 28` (définie dans `historique.constants.ts`)
3. **Stockage URL-based** :
   - La date sélectionnée est stockée dans l'URL via le paramètre `?date=yyyy-MM-dd`
   - **Avantages** : Partage de liens, navigation navigateur (retour/avant), persistance lors du rafraîchissement
   - **Implémentation** : `SelectedDateContext` utilise `useSearchParams` et `useRouter` pour synchroniser l'URL
4. **Activation du mode sablier** : 
   - **Esthétique cosmique indigo** : Distinction claire avec l'UI des progrès (amber/yellow)
   - Bannière fixe en haut de l'écran (fond indigo-900 avec pattern d'étoiles subtil) avec sablier doré ⏳ et texte blanc
   - Cadre indigo discret autour de toute l'application (bordure indigo-500/40 avec ombre subtile via `TimeMachineWrapper`)
   - Message : "Tu es sur le [date]" avec sous-texte explicatif
   - Bouton "Revenir à aujourd'hui" (blanc avec bordure indigo) pour sortir du mode
   - Animation de transition différenciée (`TimeMachineTransition`) :
     - **Entrée** : Fond indigo cosmique avec étoiles + sablier doré qui tourne
     - **Sortie** : Fond blanc pur + sablier qui disparaît avec message "Retour à aujourd'hui"
5. **Vue "machine à remonter le temps"** :
   - Les exercices affichent leur état pour le jour sélectionné (pas pour aujourd'hui)
   - `completedToday` est calculé pour le jour sélectionné via `TimeContext.referenceDate`
   - Les boutons "Fait aujourd'hui" deviennent "Fait le [date]"
   - Les exercices complétés pour ce jour passent en vert
   - Toutes les statistiques et graphiques reflètent l'état du jour sélectionné
6. **Actions disponibles** :
   - Marquer des exercices comme faits pour le jour sélectionné (avec `completedAt` personnalisé)
   - Créer de nouveaux exercices (avec `createdAt` à midi du jour sélectionné)
   - Voir l'état des exercices tel qu'il était ce jour-là
   - Consulter les statistiques et graphiques pour cette date précise

**Composants clés** :
- `SelectedDateContext` : Gestion de l'état global de la date sélectionnée avec validation de la limite de 28 jours
  - Stockage URL-based (`?date=yyyy-MM-dd`) pour partage et persistance
  - Debouncing pour les calculs coûteux (`debouncedSelectedDateKey`)
  - Nettoyage automatique lors du changement d'utilisateur
- `TimeContext` : Contexte temporel global (source unique de vérité pour `referenceDate`)
  - Calcule `referenceDate` (aujourd'hui ou date sélectionnée)
  - Précharge les jours adjacents en arrière-plan pour navigation instantanée
  - Optimisé avec dépendances stables (strings au lieu de Date objects)
- `SelectedDateBanner` : Bannière fixe en haut de l'écran (fond indigo-900 avec pattern d'étoiles subtil, sablier doré ⏳, texte blanc)

- `TimeMachineWrapper` : Cadre indigo discret autour de l'application (bordure indigo-500/40 avec ombre subtile, uniquement en mode sablier)
- `TimeMachineTransition` : Animation de transition différenciée :
  - **Entrée** : Fond indigo cosmique avec pattern d'étoiles + sablier doré qui tourne (2 tours)
  - **Sortie** : Fond blanc pur + sablier qui disparaît avec message "Retour à aujourd'hui"
- `DayDetailModal` : Modal avec bouton "Ajouter des exercices pour ce jour" (style sablier) + validation de la limite de 28 jours
- `CompleteButton` : Adaptation du label selon le mode sablier ("Fait le [date]")
- `ExerciceForm` : Création d'exercices avec `createdAt` personnalisé (midi du jour sélectionné)

**Modifications API** :
- `/api/exercices` : Accepte `targetDate` query param pour calculer `completedToday` pour un jour spécifique
- `/api/exercices/[id]` : Accepte `targetDate` query param pour calculer `completedToday` pour un jour spécifique
- `/api/exercices/[id]/complete` : Accepte `completedAt` dans le body ; retourne `completed`, `completedToday`, `completedAt`, `weeklyCompletions` (complétions de la semaine) pour cohérence mode WEEKLY
- `/api/exercices` (POST) : Accepte `createdAt` dans le body pour créer un exercice avec une date de création personnalisée (fixée à midi)

**Hooks modifiés** :
- `useExercices` : Passe `targetDate` à l'API si une date est sélectionnée
- `useCompleteExercice` : Passe `completedAt` à l'API si une date est sélectionnée
- `useCategoryStats` : Utilise la date sélectionnée pour calculer les statistiques de complétion par catégorie
- `useTodayCompletedCount` : Compte les exercices complétés le jour sélectionné (au lieu d'aujourd'hui)
- `usePeriodNavigation` : Utilise la date sélectionnée comme référence pour les périodes de navigation

**Fonctions utilitaires adaptées** :
- `getLast7DaysData` : Accepte un paramètre `referenceDate` optionnel pour calculer les 7 derniers jours par rapport au jour sélectionné
- `getCurrentWeekData` : Accepte un paramètre `referenceDate` optionnel pour calculer la semaine par rapport au jour sélectionné
- `calculateCurrentStreak` : Accepte un paramètre `referenceDate` optionnel pour calculer la série jusqu'au jour sélectionné

**Composants adaptés** :
- `DailyGoalProgress` : Label adaptatif "Objectif du [date]" en mode sablier
- `WelcomeHeaderGreeting` : Salutation adaptée avec la date sélectionnée "Bonjour, [nom] ([date])"
- `BarChart` : Met en évidence le jour sélectionné (barre bleue) au lieu d'aujourd'hui, légende adaptée "Jour sélectionné"
- `ProgressStatsChart` : Utilise la date sélectionnée pour calculer la limite du graphique (s'arrête à la semaine du jour sélectionné)
- `WelcomeHeaderWrapper` : Passe la date de référence aux fonctions de calcul de données hebdomadaires

**Cohérence temporelle** :
- **Filtrage de l'historique** : Sur la page `/historique`, seuls les exercices complétés jusqu'à la date sélectionnée (inclus) sont affichés
- **Filtrage des progrès** : Seuls les progrès créés jusqu'à la date sélectionnée (inclus) sont affichés dans la timeline
- **Graphiques cohérents** : Tous les graphiques (heatmap, montagne, donut chart) n'affichent que les données jusqu'à la date sélectionnée
- **Statistiques cohérentes** : Les statistiques (zones travaillées, etc.) reflètent uniquement les données jusqu'à la date sélectionnée
- **Implémentation** : Utilisation de `filteredHistory` et `filteredProgress` avec `useMemo` pour filtrer les données par date sélectionnée

**Expérience utilisateur** :
- **Esthétique cosmique indigo** : Distinction claire avec l'UI des progrès (amber/yellow) grâce à une palette indigo/bleu nuit
  - **Fond** : Indigo-900/950 (bleu nuit, ciel étoilé) avec pattern d'étoiles subtil
  - **Éléments dorés** : Sablier ⏳ et particules d'étoiles en amber/yellow pour contraste
  - **Bordures** : Indigo-500/700 avec effet de lueur cosmique
  - **Texte** : Blanc sur fond indigo pour lisibilité optimale (WCAG AA)
- **Visuel** : Cadre indigo discret + bannière fixe très visible pour éviter toute confusion
- **Feedback** : Les exercices passent immédiatement en vert après complétion pour le jour sélectionné (optimistic updates)
- **Navigation** : Bouton "Revenir à aujourd'hui" toujours accessible dans la bannière
- **Cohérence** : Tous les boutons et éléments liés au mode sablier utilisent la palette indigo cosmique et l'emoji ⏳ doré
- **Données synchronisées** : Toutes les statistiques, graphiques et compteurs affichent les données du jour sélectionné (compteur d'exercices, objectif du jour, calendrier de la semaine, série en cours, graphiques)
- **Limitation claire** : Message d'erreur explicite si tentative de remonter > 28 jours
- **Partage de liens** : L'URL contient la date sélectionnée, permettant de partager un lien vers un jour spécifique
- **Navigation navigateur** : Les boutons retour/avant du navigateur fonctionnent avec les changements de date
- **Transitions fluides différenciées** : 
  - **Entrée** : Animation sur fond indigo cosmique avec étoiles + sablier doré qui tourne
  - **Sortie** : Animation sur fond blanc pur + sablier qui disparaît avec message "Retour à aujourd'hui"

**Optimisations de performance** :
- **Préchargement** : `TimeContext` précharge automatiquement les jours adjacents (jour précédent et suivant) en arrière-plan avec `queryClient.prefetchQuery` pour une navigation instantanée
- **Debouncing** : `debouncedSelectedDateKey` dans `SelectedDateContext` pour retarder les calculs coûteux (100ms de délai)
- **Dépendances stables** : Utilisation de strings (`selectedDateKey`) au lieu de Date objects pour éviter les re-renders inutiles
- **Transitions optimisées** : `isTransitioning` dans `SelectedDateContext` permet de garder les anciennes données pendant l'animation avant de changer la vue
- **Cache intelligent** : TanStack Query gère automatiquement le cache des données pour les jours préchargés

### 3. Module Journal

Accessible uniquement si `currentUser.hasJournal === true`. Le journal contient uniquement des **notes** (plus de tâches).

#### Page principale Journal

**Route** : `/journal` (`src/app/(pages)/journal/page.tsx`)

- **Notes** (`JournalNotesList`) : Liste des notes avec titre, description, date optionnelle
- Bouton "Ajouter une note" centré → `/journal/add`

**Composants clés** :
- `JournalNoteCard` : Carte blanche (sans bande colorée), titre, description, date, badge "Validé", actions (Modifier, Pour le kiné, Partager)
- `JournalNoteForm` : Formulaire d'ajout/édition (titre, description, date)
- `JournalNotesList` : Liste des notes
- `AddButton` : Bouton centré pour ajouter une note

#### Routes notes

**Routes** : `/journal`, `/journal/add`, `/journal/edit/[id]`

**Fonctionnalités** :
- Ajout de notes (titre, description, date optionnelle)
- Édition et suppression des notes
- **Pour le kiné** (pin) : affiche la note dans l’onglet Kiné de la page d’accueil
- **Valider** : marque la note comme validée (badge "Validé")
- **Partager** : partage de la note

**Hooks** :
- `useJournalNotes` : Récupération et gestion des notes
- `useJournalCheck` : Vérification de l'accès au module journal
- `usePinJournalNote`, `useValidateJournalNote`, `useShareJournalNote` : Actions sur une note

#### Constantes

**Fichier** : `src/app/constants/journal.constants.ts`

- `JOURNAL_COLORS` : Palette complète de couleurs pour le module journal (formulaires, etc.)
- Les cartes de notes n’utilisent pas de bande colorée (carte blanche, contenu en avant)

**Emoji** : `JOURNAL_EMOJI = '📔'` (défini dans `emoji.constants.ts`)

#### Routes API

**`/api/journal/notes`** :
- `GET` : Liste des notes de l'utilisateur
- `POST` : Créer une note

**`/api/journal/notes/[id]`** :
- `GET` : Détail d'une note
- `PUT` : Mettre à jour une note
- `DELETE` : Supprimer une note

**`/api/journal/notes/[id]/pin`** : `PATCH` — Épingler / désépingler (pour l’onglet Kiné)

**`/api/journal/notes/[id]/validate`** : `PATCH` — Marquer comme validé / non validé

### 4. Historique et progression

#### Page Historique

**Route** : `/historique` (`src/app/(pages)/historique/page.tsx`)

**Cohérence temporelle** :
- **Filtrage automatique** : Quand une date est sélectionnée via le mode sablier, l'historique et les progrès sont automatiquement filtrés pour ne montrer que les données jusqu'à cette date (inclus)
- **Implémentation** : Utilisation de `filteredHistory` et `filteredProgress` avec `useMemo` qui filtrent respectivement :
  - Les exercices complétés (`completedAt <= selectedDate`)
  - Les progrès créés (`createdAt <= selectedDate`)
- **Normalisation des dates** : Utilisation de `startOfDay` et `format` de `date-fns` pour comparer uniquement les dates (sans heures)
- **Impact** : Tous les graphiques, statistiques et visualisations reflètent uniquement les données jusqu'à la date sélectionnée

3 visualisations principales :

##### 1. Heatmap d'activité (ActivityHeatmap)

- 40 derniers jours de progression
- Code couleur par catégorie d'exercice
- Indicateur de progrès (⭐) sur les jours avec progrès
- Série en cours (current streak) : nombre de jours consécutifs avec activité
- **Interactif** : Clic sur un jour → modal avec détail du jour

**Composant** : `ActivityHeatmap` (`src/app/features/historique/components/ActivityHeatmap.tsx`)

##### 2. Graphique des progrès (ProgressStatsChart)

- Évolution du nombre de progrès au fil du temps
- Graphique en aires empilées (Recharts)
- Affichage uniquement si ≥2 progrès

**Composant** : `ProgressStatsChart` (`src/app/features/historique/components/ProgressStatsChart.tsx`)

##### 3. Graphique en ligne d'activité (ActivityLineChart)

- Évolution de l'activité au fil du temps
- Graphique en ligne (Recharts)
- Affichage de la régularité et des tendances

**Composant** : `ActivityLineChart` (`src/app/features/historique/components/ActivityLineChart.tsx`)

##### 4. Graphique en barres de régularité (BarChart)

- Visualisation de la régularité quotidienne
- Barres colorées selon le nombre d'exercices
- Indicateur de série en cours (current streak)
- Points dorés (⭐) pour les jours avec progrès

**Composant** : `BarChart` (`src/app/features/historique/components/BarChart.tsx`)

##### 5. Graphique en donut des zones travaillées (DonutChart)

- Répartition des exercices par partie du corps
- Code couleur par catégorie mère (haut/milieu/bas/étirement)
- Filtre période : Cette semaine / Ce mois-ci / Tout
- Légende interactive (toggle zones)

**Composant** : `DonutChart` (`src/app/features/historique/components/DonutChart.tsx`)

#### Page Roadmap (40 derniers jours)

**Route** : `/historique/roadmap`

- Vue complète des 40 derniers jours
- Calendrier visuel avec code couleur
- Liste détaillée des exercices par jour (accordéons)

**Composant** : `WeekAccordionList` (`src/app/features/historique/components/WeekAccordionNew.tsx`)

#### Page Progrès

**Route** : `/historique/victories`

- Timeline de tous les progrès
- Filtre par catégorie (Tout / Corps)
- Édition/suppression en ligne

**Composant** : `ProgressTimeline`

### 5. Système de progrès et motivation

#### Concept

Les **progrès** sont au cœur de l'aspect motivationnel de l'app. Un progrès peut être :
- Une réussite physique (catégorisée par zone du corps)
- Un accomplissement personnel

#### Création de progrès

**Accès** :
- Bouton flottant `ProgressFAB` (présent sur toutes les pages)
- Bouton "Noter un progrès" en toutes lettres dans la page Historique (centré sous les cartes)
- Raccourci dans le menu sidebar : "Noter un progrès" (dans les actions rapides)

**Modal** : `ProgressBottomSheet`

**Interface** :
1. **Tags prédéfinis** : Force, Souplesse, Équilibre, Confort (toggle)
2. **Zone de texte** avec dictée vocale (micro)
3. **Médias** (optionnel) : Upload de photos (jusqu'à 2 médias)
4. **Sélection de catégorie** (optionnel) : 4 zones du corps + "Autre" (si `hasJournal = true`)
5. **Bouton "Noter mon progrès !"** → Création + confettis

**Modal** :
- Overflow auto pour permettre le scroll du contenu
- Croix de suppression des médias en gris (style neutre, non alarmant)

**Confettis** :
- Variante "default" : confettis multicolores + emojis variés
- Variante "golden" : confettis dorés + emojis de célébration (🏆⭐🌟✨💫👑)
- Animation Framer Motion de 3.2s avec chute fluide

**Composant** : `ConfettiRain` (`src/app/features/exercices/components/ConfettiRain.tsx`)

#### Affichage des progrès

- **Dashboard** : Dernier progrès + graphique (si ≥2 progrès)
- **Historique** : Graphique d'évolution + timeline complète
- **Heatmap** : Étoile ⭐ sur les jours avec progrès
- **ProgressCard** : Carte de progrès avec support des médias
  - Si un progrès a des médias : icône œil pour ouvrir la lightbox + chevron vers le bas indiquant l'expandable
  - Clic sur la carte → expansion avec affichage des photos
  - Clic sur l'icône œil → ouverture de la lightbox en plein écran

### 6. Authentification et setup initial

#### Authentification (`AuthScreen`)

**Composant** : `AuthScreen` (`src/app/features/auth/components/AuthScreen.tsx`)

**Fonctionnalités** :
- **Connexion** : Authentification avec nom d'utilisateur et mot de passe
- **Création de compte** : Inscription avec code d'invitation
  - Nom d'utilisateur
  - Code d'invitation (fourni par l'administrateur)
  - Mot de passe (minimum 8 caractères)
  - Confirmation du mot de passe
- **Protection** : Géré par `SiteProtection` (vérification du mot de passe du site)

**Flux** :
1. Après création de compte → Affichage de `UserSetup`
2. Après connexion → Redirection vers l'application

#### Setup initial (`UserSetup`)

**Composant** : `UserSetup` (`src/app/features/auth/components/UserSetup.tsx`)

**Affiché après** : Création d'un nouveau compte

**Paramètres configurables** :
1. **Main dominante** : Gauche / Droite (positionnement des boutons principaux)
2. **Rythme** : Quotidien / Hebdomadaire (fréquence de réinitialisation des exercices)
3. **Journal** : Oui / Non (accès au module journal)

**Comportement** :
- L'utilisateur configure ses paramètres à son rythme
- Bouton **"Sauvegarder et commencer"** : Enregistre les paramètres et redirige vers l'application
- Pas de redirection automatique : l'utilisateur décide quand il a terminé

### 7. Paramètres utilisateur

**Route** : `/settings` (`src/app/(pages)/settings/page.tsx`)

**Options configurables** :
1. **Nom d'utilisateur** : Modification du nom affiché
2. **Main dominante** : Gauche / Droite (inverse certains layouts)
3. **Fréquence de réinitialisation** : Quotidien / Hebdomadaire
4. **Profil journal** : Active/désactive le module journal
5. **Changement de mot de passe** : Modification du mot de passe utilisateur

**Gestion multi-utilisateurs** :
- Sélection de l'utilisateur actif
- Ajout de nouveaux utilisateurs
- Suppression d'utilisateurs (avec confirmation)

---

## 🎯 Patterns et conventions de code

### Architecture conditionnée par User et Date

**Principe fondamental** : L'affichage de l'application est conditionné par **deux dimensions principales** :

1. **User (Utilisateur)** : Détermine **QUOI** afficher
   - Quelles données (exercices, progrès, historique de l'utilisateur)
   - Préférences d'affichage (`dominantHand`, `resetFrequency`, `hasJournal`)
   - Géré par `UserContext` (source unique de vérité)

2. **Date (Référence temporelle)** : Détermine **QUAND** afficher
   - Pour quelle date afficher les données (aujourd'hui ou jour sélectionné)
   - État des exercices (`completedToday` calculé pour `referenceDate`)
   - Statistiques, graphiques, historique filtrés jusqu'à la date
   - Géré par `TimeContext` (source unique de vérité) et `SelectedDateContext` (mode sablier)

**Schéma conceptuel** :
```
Affichage = f(User, Date)

UserContext (QUOI)
  └─> Détermine les données à afficher
      └─> TimeContext (QUAND)
          └─> Détermine la date de référence
              └─> Composants UI
                  └─> Affichage conditionné
```

**Exemples concrets** :
- `useExercices(userId, targetDate)` → Affiche l'état des exercices pour le jour sélectionné
- `useCategoryStats(userId, referenceDate)` → Calcule les stats pour la date de référence
- `filteredHistory` → Filtre l'historique jusqu'à la date sélectionnée
- `BarChart`, `ProgressStatsChart` → S'arrêtent à la date sélectionnée

**Avantages** :
- ✅ Séparation claire des responsabilités
- ✅ Réutilisabilité : Les composants s'adaptent automatiquement
- ✅ Cohérence : Tous les composants utilisent la même référence temporelle
- ✅ Performance : Préchargement des jours adjacents
- ✅ Partage : L'URL contient la date (`?date=yyyy-MM-dd`)

### ⚠️ Point de vigilance critique : Timezone (dates)

**Le serveur Netlify tourne en UTC** (timezoneOffset = 0), tandis que les utilisateurs sont en **CET/CEST** (UTC+1/+2). Toute manipulation de date qui dépend du timezone local peut donner un résultat **décalé d'un jour** en production.

#### Règle d'or : ne JAMAIS envoyer de `.toISOString()` pour représenter un jour

`.toISOString()` convertit toujours en UTC. Exemple concret du bug rencontré :
```
// Client CET (Paris) :
dateKeyToISO('2026-02-06')
→ getDateFromKey('2026-02-06') → new Date('2026-02-06T00:00:00') → 6 fév 00:00 CET
→ .toISOString() → '2026-02-05T23:00:00.000Z'  ← RECULE D'UN JOUR EN UTC !

// Serveur UTC (Netlify) :
new Date('2026-02-05T23:00:00.000Z') → 5 fév 23:00 UTC
startOfDay() → 5 fév 00:00 UTC  ← MAUVAIS JOUR !
format(targetDate, 'yyyy-MM-dd') → '2026-02-05'  ← CHERCHE LE MAUVAIS JOUR
```

#### Comment transmettre une date entre client et serveur

```typescript
// ✅ BIEN : Envoyer le dateKey string directement
const targetDate = referenceDateKey; // '2026-02-06'
fetchExercices({ targetDate }); // URL: /api/exercices?targetDate=2026-02-06

// ❌ MAL : Convertir en ISO string
const targetDate = dateKeyToISO(referenceDateKey); // '2026-02-05T23:00:00.000Z'
fetchExercices({ targetDate }); // URL: /api/exercices?targetDate=2026-02-05T23:00:00.000Z
```

#### Comment parser une date côté serveur (API routes)

```typescript
// ✅ BIEN : "Noon UTC trick" — midi UTC est le même jour calendaire partout
const isDateKey = /^\d{4}-\d{2}-\d{2}$/.test(targetDateParam);
if (isDateKey) {
  targetDate = new Date(targetDateParam + 'T12:00:00.000Z');
}
// format(targetDate, 'yyyy-MM-dd') → '2026-02-06' ✅ (correct en UTC et CET)

// ❌ MAL : Parser l'ISO string et faire startOfDay
targetDate = startOfDay(new Date('2026-02-05T23:00:00.000Z'));
// Sur serveur UTC → '2026-02-05' ❌
// Sur serveur CET → '2026-02-06' ✅ (fonctionne en local mais pas en prod !)
```

#### Fonctions utilitaires et leur usage

| Fonction | Usage | Attention |
|---|---|---|
| `getDateKey(date)` → `'yyyy-MM-dd'` | Conversion Date → dateKey | ✅ Sûr partout |
| `getDateFromKey(dateKey)` → Date | Conversion dateKey → Date | ✅ Sûr (utilise startOfDay local) |
| `dateKeyToISO(dateKey)` → ISO string | Conversion dateKey → ISO | ⚠️ **Ne PAS utiliser pour les appels API** — le résultat dépend du timezone client |
| `format(date, 'yyyy-MM-dd')` | Extraction du jour | ✅ Sûr si la date est à midi UTC sur le serveur |

### Composants React

#### Déclaration des Props

**Règle stricte** : TOUJOURS utiliser `type Props`, JAMAIS `interface`

```typescript
// ✅ GOOD
type Props = {
  title: string;
  count: number;
};

export function MyComponent({ title, count }: Props) {
  return <div>{title}: {count}</div>;
}

// ❌ BAD
interface Props {
  title: string;
}
```

**Avec children** :

```typescript
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title: string;
}>;
```

#### Naming et exports

- **Fonction, pas arrow function** : `export function MyComponent() {}`
- **Nommage PascalCase** : `export function CategoryCard() {}`
- **Export nommé par défaut** sauf pour les pages Next.js (`page.tsx`, `layout.tsx`, `route.ts`)

```typescript
// ✅ GOOD - Composant
export function CategoryCard({ category }: Props) {
  return <div>...</div>;
}

// ✅ GOOD - Page Next.js
export default function HistoriquePage() {
  return <div>...</div>;
}
```

#### Client vs Server Components

- **Server Component par défaut** (pas de directive)
- **Client Component** uniquement si nécessaire : `'use client';`

**Besoin de `'use client'`** :
- Hooks React (`useState`, `useEffect`, etc.)
- Événements (`onClick`, `onChange`, etc.)
- Contexts (`useContext`)
- APIs navigateur (`window`, `localStorage`, etc.)

```typescript
// ✅ Server Component (pas d'interactivité)
export function StatCard({ value, label }: Props) {
  return <div>{label}: {value}</div>;
}

// ✅ Client Component (hooks, interactivité)
'use client';
export function CompleteButton({ onClick }: Props) {
  const [loading, setLoading] = useState(false);
  return <button onClick={onClick}>...</button>;
}
```

### Hooks personnalisés

#### Convention de nommage

- **Toujours préfixe `use`** : `useExercices`, `useVictories`, `usePageFocus`
- **Retour objet, pas tuple** : `return { data, loading, error }`

```typescript
// ✅ GOOD
export function useExercices() {
  const [exercices, setExercices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  return { exercices, loading };
}

// ❌ BAD - Tuple
export function useExercices() {
  return [exercices, loading];
}
```

#### Hooks disponibles

**API / Data Fetching (TanStack Query)** :
- `useExercices` : Récupération et mise à jour des exercices (utilise `useQuery` et `useMutation`)
- `useHistory` : Historique de complétion (utilise `useQuery`, avec options personnalisées)
- `useHistory` : Historique avec TanStack Query (utilisé partout maintenant)
- `useProgress` : Progrès de l'utilisateur (utilise `useQuery`)
- `useJournalNotes` : Notes du journal
- `useJournalCheck` : Vérification de l'accès au module journal
- `useCategoryStats` : Stats de progression par catégorie (utilise `useQuery` avec `select` pour transformation)
- `useTodayCompletedCount` : Nombre d'exercices complétés pour une date (utilise `useQuery`)
- `useCompleteExercice` : Complétion d'exercice avec optimistic updates (utilise `useMutation`)

**UI / Interaction** :
- `useProgressModal` : État de la modal de progrès
- `useMenuState` : État du menu de navigation
- `useCelebration` : Gestion des animations de célébration
- `useTouchNavigation` : Navigation tactile simplifiée

**Accessibilité** :
- `usePageFocus` : Focus initial sur la page
- `useFocusTrap` : Piège de focus dans les modales
- `useBodyScrollLock` : Verrouillage du scroll (modales)

**Reconnaissance vocale** :
- `useSpeechRecognition` : Web Speech API

**Stats / Calculs** :
- `useProgressStats` : Statistiques des progrès
- `useDayDetailData` : Détail d'un jour spécifique

### Gestion d'état (Contexts et TanStack Query)

**Architecture** : L'application utilise une combinaison de Contexts React pour l'état local et TanStack Query pour la gestion des données serveur (cache, synchronisation, optimistic updates).

**TanStack Query** :
- **Provider** : `QueryProvider` enveloppe l'application dans `layout.tsx`
- **Configuration** : Cache intelligent avec `staleTime: 30s`, `gcTime: 5min`, pas de refetch automatique au focus
- **Query Keys** : Centralisées dans `src/app/lib/api-queries.ts` pour éviter les erreurs de typo
- **Fetch Functions** : Fonctions réutilisables dans `api-queries.ts` pour tous les appels API
- **Optimistic Updates** : Implémentés dans `useCompleteExercice` pour une UI réactive
- **Transitions fluides** : `placeholderData` pour garder les données précédentes pendant le chargement
- **DevTools** : `ReactQueryDevtools` disponible en développement pour le debugging

**Contexts principaux** (5 contexts optimisés) :

#### 1. UserContext

**Responsabilité** : Gestion de l'utilisateur courant et des utilisateurs disponibles

```typescript
type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateCurrentUser: (updatedUser: User) => void;  // Optimistic update
  users: User[];
  loading: boolean;
  changingUser: boolean;
  refreshUsers: () => Promise<void>;
};
```

**Usage** :
```typescript
const { currentUser, users, loading } = useUser();
```

**Particularités** :
- Persistance dans `localStorage` (clé `synapso_current_user`)
- Utilisateur par défaut : "Calypso"
- Rechargement automatique au montage

#### 2. ToastContext

**Responsabilité** : Gestion des notifications globales (toasts)

```typescript
type ToastContextType = {
  showToast: (message: string) => void;
};
```

**Usage** :
```typescript
const { showToast } = useToast();
showToast('Message de succès !');
```

**Particularités** :
- Affichage de notifications temporaires en haut de l'écran
- Gestion automatique de l'affichage et de la disparition

#### 3. DayDetailModalContext

**Responsabilité** : Gestion de la modal de détail du jour (heatmap interactif)

```typescript
type DayDetailModalContextType = {
  selectedDay: HeatmapDay | null;
  openDayDetail: (day: HeatmapDay) => void;
  closeDayDetail: () => void;
};
```

**Usage** :
```typescript
const { selectedDay, openDayDetail, closeDayDetail } = useDayDetailModal();
```

**Particularités** :
- Partage de l'état de la modal entre composants distants (WelcomeHeaderWrapper, HistoriquePageClient, DayDetailModalWrapper)
- Pattern simple et efficace pour éviter le props drilling

#### 4. SelectedDateContext

**Responsabilité** : Gestion de la date sélectionnée pour le mode sablier (remonter le temps)

```typescript
type SelectedDateContextType = {
  selectedDate: Date | null;
  selectedDateKey: string | null; // Clé stable (yyyy-MM-dd)
  setSelectedDate: (date: Date | null) => void;
  clearSelectedDate: () => void;
  isDateSelected: boolean;
  isTimeMachineMode: boolean; // Mode sablier actif (date passée)
  isTransitioning: boolean; // Indique qu'une transition est en cours
  transitionType: 'enter' | 'exit' | null; // Type de transition en cours
};
```

**Particularités** :
- **URL-based** : La date sélectionnée est stockée dans l'URL (`?date=yyyy-MM-dd`) pour partage de liens et navigation navigateur
- **Validation** : Limite à 28 jours en arrière (`MAX_TIME_MACHINE_DAYS`), validation centralisée dans `dateValidation.utils.ts`
- **Transitions** : Gestion des animations d'entrée/sortie du mode sablier
- **Nettoyage automatique** : La date est réinitialisée quand l'utilisateur change
- **Simplifié** : Code réduit de 309 à 177 lignes (-43%) grâce à l'extraction de la validation et la simplification de la logique de transitions

#### 5. TimeContext

**Responsabilité** : Contexte temporel global pour toute l'application (date de référence)

```typescript
type TimeContextType = {
  referenceDate: Date; // Date de référence (aujourd'hui ou date sélectionnée)
  referenceDateKey: string; // Clé stable (yyyy-MM-dd)
  isTimeMachineMode: boolean; // Mode sablier actif
  isToday: boolean; // Est-ce que referenceDate = aujourd'hui ?
};
```

**Particularités** :
- **Source unique de vérité** : Tous les composants utilisent `referenceDate` pour les calculs temporels
- **Préchargement** : Précharge les jours adjacents en arrière-plan avec `queryClient.prefetchQuery`
- **Performance** : Calculs optimisés avec dépendances stables (strings)
- **⚠️ Timezone** : Les hooks qui envoient des dates aux API (`useExercices`, `useCategoryStats`, `useTodayCompletedCount`, `useHistory`) utilisent `referenceDateKey` (string `yyyy-MM-dd`) directement, jamais `dateKeyToISO()`. Voir section "Point de vigilance Timezone" ci-dessus.

### Styling (Tailwind CSS)

#### Classes conditionnelles

**Toujours utiliser `clsx`** :

```typescript
import clsx from 'clsx';

<div className={clsx(
  'base-classes',
  isActive && 'active-classes',
  { 'conditional-class': condition }
)}>
```

#### Système de couleurs

**Source unique de vérité** : `src/app/constants/exercice.constants.ts`

4 couleurs principales :
- **Bleu** (`blue`) : Bas du corps, ancrage, stabilité
- **Orange** (`orange`) : Haut du corps, énergie, action
- **Violet** (`purple`) : Étirements, détente, souplesse
- **Teal** (`teal`) : Milieu du corps, gainage, force centrale

**Vert émeraude** (`emerald`) : Réservé pour la validation et le succès

**Jaune/Or** (`amber`, `yellow`) : Réservé pour les victoires et la célébration

Chaque couleur a plusieurs variantes :
- `bg` : Fond léger (ex: `bg-blue-50`)
- `border` : Bordure (ex: `border-blue-200`)
- `text` : Texte (ex: `text-blue-700`)
- `accent` : Accent fort (ex: `bg-blue-500`)
- `tag` : Badge (ex: `bg-blue-100 text-blue-600`)

**Exemple d'utilisation** :

```typescript
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';

const colors = CATEGORY_COLORS['UPPER_BODY'];
// { bg: 'bg-orange-50', text: 'text-orange-800', ... }

<div className={`${colors.bg} ${colors.text}`}>
  Haut du corps
</div>
```

#### Keys dans les listes

**Priorité** :
1. ID unique si disponible : `key={item.id}`
2. Propriété unique : `key={item.value}`
3. Clé composite : `key={`${item.date}-${item.kind}`}`
4. **Éviter** : Index seul (`key={index}`)

### Gestion des erreurs

**Règle principale** : TOUJOURS utiliser `throw new Error()` pour les validations, JAMAIS `return`

```typescript
// ✅ GOOD
if (!params.documentId) {
  throw new Error('Missing documentId param');
}

if (!response.ok) {
  throw new Error(`Failed to fetch data: ${response.status}`);
}

// ❌ BAD
if (!params.documentId) {
  return null;
}
```

**Avantages** :
- Erreurs remontent automatiquement aux `error.tsx` boundaries
- Messages contextuels et clairs
- Pas de silence des erreurs

### Routes API (Next.js)

#### Structure

**Fichier** : `route.ts` dans `app/api/[resource]/`

**Exports nommés** : `GET`, `POST`, `PATCH`, `DELETE`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  // 1. Vérifier l'authentification
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // 2. Parser les paramètres
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // 3. Valider
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 4. Requête base de données
    const data = await prisma.exercice.findMany({
      where: { userId: parseInt(userId) },
    });

    // 5. Retourner la réponse
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

#### Authentification

**Middleware** : `requireAuth(request)` (dans `src/app/lib/auth.ts`)

- Vérifie le cookie HTTP-only `synapso_auth`
- Retourne `null` si authentifié, sinon `NextResponse` avec erreur 401

**Login** : Route `/api/auth/password` (POST)
- Vérifie le mot de passe contre `SITE_PASSWORD` (variable d'environnement)
- Définit le cookie HTTP-only (`maxAge: 30 jours`)

**Protection globale** : TOUTES les routes API appellent `requireAuth()` en premier

---

## ♿ Accessibilité et UX

### Principes de design

**4 piliers** (définis dans `.cursorrules`) :

1. **Simplicité** : Navigation claire, actions évidentes, pas de complexité inutile
2. **Intuitivité** : Flux logiques, feedback immédiat, pas de confusion possible
3. **Accessibilité** : Respect WCAG, navigation clavier, contrastes élevés, lecteurs d'écran
4. **Encouragement** : Feedback positif, célébration, progression visible, messages motivants

**Approche Mobile First** :

L'application est conçue **mobile first** : chaque décision de design doit privilégier l'expérience mobile. Cela implique :
- **Performance** : Chargement rapide, animations fluides (60fps), pas de lag
- **Fluidité** : Transitions douces, feedback immédiat, réactivité optimale
- **Optimisation** : Bundle minimal, lazy loading, requêtes optimisées
- **Test mobile** : Toute fonctionnalité doit être testée et validée sur mobile

### Design System

#### Composants de base

##### BaseCard (Compound Component Pattern)

**Fichier** : `src/app/components/ui/BaseCard.tsx`

Composant de carte universel utilisant le pattern compound components pour une composition flexible.
Utilise un **Context interne** pour propager automatiquement `isGolden` aux sous-composants.

**Structure** :
```typescript
// Carte normale
<BaseCard>
  <BaseCard.Accent color="bg-teal-500" />
  <BaseCard.Content>
    {/* Contenu principal */}
  </BaseCard.Content>
  <BaseCard.Footer>
    {/* Actions (boutons) */}
  </BaseCard.Footer>
</BaseCard>

// Carte dorée - isGolden propagé automatiquement aux sous-composants
<BaseCard isGolden>
  <BaseCard.Accent />  {/* Style doré automatique */}
  <BaseCard.Content>Victoire !</BaseCard.Content>
  <BaseCard.Footer>🎉</BaseCard.Footer>  {/* Style doré automatique */}
</BaseCard>
```

**Typage TypeScript** :
- Export typé `BaseCardComponent` avec sous-composants pour une meilleure autocomplétion
- Props documentées avec JSDoc

**Styles de carte** (via `card.constants.ts`) :
- `border border-gray-200` : Bordure légère pour la visibilité
- `rounded-2xl` : Coins arrondis généreux (16px)
- `shadow-sm` : Ombre légère par défaut
- `hover:shadow-md` : Ombre accentuée au survol
- `transition-all duration-200` : Transitions fluides
- `bg-white` : Fond blanc standard

**BaseCard.Accent** :
- Bande verticale colorée sur le bord gauche (`w-1.5` par défaut, `w-2.5` en mode golden)
- Couleur basée sur la catégorie de l'exercice (prop `color`)
- Utilise le Context pour détecter automatiquement le mode golden

**BaseCard.Footer** :
- Section d'actions avec fond gris clair (`bg-gray-50/70`)
- Bordure supérieure (`border-t border-gray-100`)
- Flex layout pour aligner les boutons
- Padding généreux pour les zones de touch (`px-4 py-3`)
- Utilise le Context pour détecter automatiquement le mode golden

**Variante dorée (Golden)** :
- Activée via `<BaseCard isGolden>` - propagé automatiquement aux sous-composants
- Pour les items maîtrisés ou célébrations
- Fond doré (`bg-amber-50`), bordure dorée (`border-amber-300`)
- Hover avec glow effect (`hover:ring-amber-300/60`)
- Accent en gradient (`from-amber-500 via-yellow-500 to-amber-600`)

##### Card Simple

**Fichier** : `src/app/components/ui/Card.tsx`

Carte simple pour contenus statiques sans actions.
Utilise les constantes de `card.constants.ts` pour garantir la cohérence avec `BaseCard`.

**Variantes** :
- `default` : Carte standard blanche avec ombre légère (utilise `DEFAULT_CARD_STYLES`) - par défaut
- `outlined` : Bordure épaisse sans ombre (`border-2 border-gray-200`)
- `subtle` : Fond gris clair (`bg-gray-50`)

**Padding** :
- `none` : Pas de padding
- `sm` : `p-3`
- `md` : `p-4 sm:p-6` (par défaut)
- `lg` : `p-6 sm:p-8`

**Cohérence** : Le `border-radius` (`rounded-2xl`) est partagé avec `BaseCard` via `DEFAULT_CARD_STYLES.rounded`.

##### Badge

**Fichier** : `src/app/components/ui/Badge.tsx`

Petit élément d'information visuelle (tags, labels).

**Variantes** :
- `default` : Badge neutre gris (`bg-gray-100 text-gray-800`), utilisé pour les bodyparts avec `className` de couleur personnalisée
- `workout` : Info d'entraînement slate (`bg-slate-100 text-slate-700`) - séries, répétitions, durée
- `equipment` : Matériel nécessaire blanc avec bordure (`bg-white text-gray-700 border border-gray-200`) - cohérent avec les filtres
- `completed` : Vert émeraude pour exercice complété (`bg-emerald-500/90 text-white border border-emerald-400/50`)
- `mastered` : Vert émeraude pour exercice maîtrisé (`bg-emerald-500 text-white`)

**Props** :
- `variant` : Variante visuelle (`default`, `workout`, `equipment`, `completed`, `mastered`)
- `icon` : Icône optionnelle affichée avant le texte (string emoji ou composant React, ex: "🏋️" ou `<CheckIcon />`)
- `className` : Classes CSS additionnelles (peuvent surcharger les couleurs par défaut)

**Styles de base** :
- Taille : `text-xs` (12px)
- Padding : `px-2.5 py-1`
- Border radius : `rounded-md`
- Font weight : `font-medium`

**Logique de couleur** : Si `className` contient `bg-` ou `text-`, les couleurs de la variante ne sont pas appliquées (permet de personnaliser via les constantes de catégorie).

##### Button

**Fichier** : `src/app/components/ui/Button.tsx`

Bouton d'action standard.

**Variantes** :
- `action` : Bleu (`bg-blue-600`) - par défaut
- `secondary` : Gris (`bg-gray-200`)
- `danger` : Rouge (`bg-red-600`)
- `danger-outline` : Rouge outline (`border border-red-300`)
- `golden` : Gradient doré pour les progrès (`bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500`)
- `simple` : Gris foncé (`bg-gray-800`)

**Styles** :
- Padding : `px-4 py-2`
- Border radius : `rounded-md`
- Transitions : `transition-colors`
- États disabled avec opacité réduite

##### CompleteButton

**Fichier** : `src/app/components/ui/CompleteButton.tsx`

Bouton spécial pour marquer un exercice comme fait.

**États** :
- Non fait : Gris avec texte "Fait"
- Fait aujourd'hui : Vert émeraude avec checkmark
- Fait cette semaine : Badge avec compteur (mode hebdomadaire)

**Couleurs** :
- Non fait : `bg-gray-100 text-gray-600`
- Fait : `bg-emerald-500 text-white`
- Hover : `hover:bg-emerald-600`

##### ActionButton

**Fichier** : `src/app/components/ui/ActionButton.tsx`

Bouton d'action unifié pour ProgressButton et AddButton.

**Variants** :
- `golden` : Bouton de progrès (variant golden du Button)
- `simple` : Bouton d'ajout (variant simple du Button)

**Display** :
- `fixed` : Bouton flottant fixe en bas de l'écran
- `inline` : Bouton standard pour intégration dans une page

**Note** : Utilise le composant `Button` en interne avec les variants `golden` et `simple`.

##### Autres composants UI

**Input** : Champ de saisie standard avec support de la reconnaissance vocale via `InputWithSpeech`

**Textarea** : Zone de texte multiligne avec support de la reconnaissance vocale via `TextareaWithSpeech`

**Loader** : Spinner de chargement

**Logo** : Logo de l'application

**SegmentedControl** : Contrôle de segmentation pour les filtres

**ToggleButtonGroup** : Groupe de boutons toggle

**PeriodNavigation** : Navigation par période (semaine/mois)

**ViewAllLink** : Lien "Voir tout" avec icône

**AddButton** : Bouton d'ajout utilisant ActionButton

**Accordion** : Composant accordéon avec compound pattern

**BottomSheetModal** : Modal bottom sheet pour mobile

**Note** : Les badges `completed` et `mastered` utilisent le composant `Badge` avec les variantes correspondantes. Voir la section Badge ci-dessus.

**BackButton** : Bouton de retour avec chevron et label dynamique (`getCurrentPageName`)

**Note sur les badges équipements** :
- Dans `ExerciceCard`, les badges équipements sont cliquables et redirigent vers `/exercices/equipments?equipments=...`
- Style blanc avec bordure pour cohérence avec les filtres
- Effets hover/active pour indiquer l'interactivité (mobile-first : `active:` pour le touch, `md:hover:` pour desktop)

**WeeklyCompletionIndicator** : Indicateur de complétion hebdomadaire

#### Constantes de couleurs

**Fichier** : `src/app/constants/exercice.constants.ts`

Source unique de vérité pour toutes les couleurs de l'application.

**Palette principale** :
- 🦺 **Orange** : Haut du corps, énergie, action
- 👉 **Teal** : Milieu du corps, gainage, force centrale
- 👖 **Bleu** : Bas du corps, ancrage, stabilité
- 🧘‍♀️ **Violet** : Étirements, détente, souplesse

**Pour chaque couleur** :
```typescript
{
  bg: 'bg-orange-50',           // Fond très léger
  text: 'text-orange-800',      // Texte foncé
  border: 'border-orange-200',  // Bordure
  accent: 'bg-orange-500',      // Accent fort
  tag: 'bg-orange-100 text-orange-600', // Badge
  cardBorder: 'border-orange-200',
  iconBg: 'bg-orange-100',
  iconText: 'text-orange-600',
  focusRing: 'focus:ring-orange-400'
}
```

**Couleurs spéciales** :
- **Vert émeraude** (`emerald`) : Validation, succès, exercice fait
- **Jaune/Or** (`amber`) : Victoires, célébration, items maîtrisés, progrès
- **Indigo cosmique** (`indigo-900`, `indigo-950`, `indigo-500/700`) : Mode sablier (remonter le temps) - bannière, cadre, boutons
  - **Éléments dorés** : Sablier ⏳ et particules d'étoiles en `amber-400`/`yellow-400` pour contraste sur fond indigo

#### Patterns de design

##### Pattern de liste avec cartes

**Utilisation** : Listes d'exercices, citations, challenges

```tsx
<ul className="space-y-4">
  {items.map(item => (
    <BaseCard key={item.id}>
      {/* Contenu */}
    </BaseCard>
  ))}
</ul>
```

**Spacing** : `space-y-4` (16px entre les cartes)

##### Pattern de grille de catégories

**Utilisation** : Dashboard, vue catégories

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {categories.map(cat => (
    <CategoryCardWithProgress key={cat} {...props} />
  ))}
</div>
```

**Responsive** : 1 colonne mobile, 2 colonnes desktop

##### Pattern d'expansion (Accordion)

**Utilisation** : ExerciceCard, AccordionWeek

**Librairie** : Framer Motion pour animations fluides

```tsx
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {/* Contenu caché */}
    </motion.div>
  )}
</AnimatePresence>
```

**Indicateur** : ChevronIcon qui tourne

##### Pattern de modal (Bottom Sheet)

**Utilisation** : ProgressBottomSheet, DayDetailModal

**Composant** : `BottomSheetModal`

**Caractéristiques** :
- Slide up depuis le bas sur mobile
- Centre de l'écran sur desktop
- Backdrop semi-transparent
- Focus trap automatique
- Fermeture par Escape ou backdrop click

#### Typographie

**Tailles** :
- `text-xs` (12px) : Badges, hints
- `text-sm` (14px) : Corps de texte secondaire
- `text-base` (16px) : Corps de texte principal
- `text-lg` (18px) : Sous-titres
- `text-xl` (20px) : Titres de cartes
- `text-2xl` (24px) : Titres de sections
- `text-3xl` (30px) : Titres de pages

**Weights** :
- `font-medium` : Labels, badges (500)
- `font-semibold` : Titres de cartes (600)
- `font-bold` : Titres principaux, badges de compteur (700)

**Line height** :
- `leading-tight` : Titres
- `leading-relaxed` : Corps de texte pour lisibilité

**Couleurs de texte** :
- `text-gray-900` : Titres principaux
- `text-gray-800` : Titres secondaires
- `text-gray-700` : Corps de texte
- `text-gray-600` : Texte secondaire
- `text-gray-500` : Hints, placeholders
- `text-gray-400` : Texte désactivé

#### Spacing et Layout

**Container max-width** : `max-w-5xl mx-auto`

**Padding de page** :
- Mobile : `px-3 sm:p-6`
- Desktop : `p-6 sm:p-8`

**Gaps et Spacing** :
- Entre cartes : `space-y-4` (16px)
- Entre sections : `space-y-6` (24px)
- Dans une card : `p-4 md:p-5`
- Entre éléments inline : `gap-3` (12px)

**Responsive breakpoints** :
- `sm:` : 640px
- `md:` : 768px
- `lg:` : 1024px

#### Animations et Transitions

**Durées standard** :
- `duration-150` : Micro-interactions (hover, focus)
- `duration-200` : Transitions de cartes, buttons
- `duration-300` : Modals, accordions
- `duration-500` : Animations de progression

**Easing** :
- `ease-out` : Par défaut
- `ease-in-out` : Modals

**Hover effects** :
- Scale légère : `hover:scale-[1.02]`
- Active scale : `active:scale-[0.98]`
- Shadow : `hover:shadow-lg`
- Brightness : `hover:brightness-105`

#### Accessibilité (ARIA)

**Attributs obligatoires** :
- `aria-label` : Sur tous les boutons d'action
- `role` : Sur les éléments interactifs custom
- `tabIndex={0}` : Sur les cartes cliquables
- `aria-expanded` : Sur les accordions
- `aria-valuenow/min/max` : Sur les barres de progression

**Navigation clavier** :
- Enter et Space : Activer les cartes/boutons
- Escape : Fermer les modals
- Tab : Navigation entre éléments focusables

### Navigation

#### Navigation principale (Desktop)

**Composant** : `NavBar` (`src/app/components/NavBar/`)

- Logo cliquable (retour accueil)
- Bouton menu hamburger (accessible au clavier)
- Menu déroulant avec focus trap
- Navigation par catégories avec indicateurs colorés

**Menu sidebar** : Ordre des éléments
1. Actions rapides :
   - Ajouter un exercice
   - Noter un progrès
2. Sections principales :
   - Mon parcours
   - Journal (si `hasJournal = true`)

#### Navigation mobile (Bottom Tab Bar)

**Composant** : `BottomNavBar`

- 5 onglets maximum : Accueil + 4 catégories (si exercices disponibles)
- Icônes + labels courts
- Indicateur visuel de la page active
- Optimisé pour le touch (grande zone de clic)

#### Navigation tactile simplifiée

**Hook** : `useTouchNavigation`

- Zones de clic agrandies (padding généreux)
- Feedback visuel au toucher (`active:scale-95`)
- Pas de double-clic nécessaire
- Boutons espacés (évite les erreurs)

**Composant** : `TouchLink` (lien avec optimisation tactile)

### Gestion du focus

#### Focus initial de page

**Hook** : `usePageFocus`

- Place automatiquement le focus sur le premier élément pertinent au chargement
- Exclut le menu de navigation (si fermé)
- Conforme WCAG 2.1 (gestion du focus lors des changements de contexte)

**Usage** :
```typescript
// Focus automatique sur le premier élément focusable
usePageFocus();

// Focus sur un élément spécifique
const inputRef = useRef<HTMLInputElement>(null);
usePageFocus({ targetRef: inputRef });
```

#### Focus trap (modales)

**Hook** : `useFocusTrap`

- Empêche le focus de sortir d'une modal ouverte
- Cycle Tab entre les éléments focusables de la modal
- Escape pour fermer
- Restaure le focus après fermeture

**Composant** : `BottomSheetModal` (utilise `useFocusTrap` automatiquement)

### Contrastes et lisibilité

**Couleurs** :
- Contraste minimum 4.5:1 pour le texte normal (WCAG AA)
- Contraste minimum 3:1 pour le texte large et les composants UI

**Typographie** :
- Tailles lisibles : `text-sm` (14px), `text-base` (16px), `text-lg` (18px)
- Pas de texte en dessous de 14px
- Interligne généreux (`leading-relaxed`)

**Boutons** :
- Taille minimum 44x44px (Apple HIG, WCAG)
- Labels clairs et explicites
- États visuels distincts (hover, active, disabled)

### Feedback utilisateur

#### Feedback visuel

**Loaders** :
- Spinner animé pendant les requêtes (`Loader` component)
- États de chargement sur les boutons (`isLoading` prop)

**États de validation** :
- Bouton vert émeraude pour "fait" / "complété"
- Bouton gris pour "non fait"
- Transitions douces (`transition-all duration-200`)

**Confettis** :
- Apparition automatique lors des victoires
- Variantes selon le contexte (default / golden)
- Animation fluide (Framer Motion)

#### Feedback textuel

**Messages encourageants** :
- "Bravo !" lors de la complétion d'exercices
- "Ta victoire !" dans la modal de célébration
- "Célébrer !" comme CTA (appel à l'action)
- Emojis utilisés abondamment (👏 🎉 ⭐ 💪)

**Messages d'erreur** :
- Clairs et contextuels
- Évitent le jargon technique
- Proposent une solution si possible
- Component : `ErrorMessage`

#### Feedback auditif (reconnaissance vocale)

- Micro animé pendant l'écoute (rouge pulsant)
- Affichage du texte en cours de reconnaissance
- Confirmation visuelle du texte reconnu

### Adaptations pour troubles moteurs

#### Main dominante

**Paramètre** : `currentUser.dominantHand` (`LEFT` | `RIGHT`)

**Impact** :
- **Main gauche** : Boutons d'action à gauche, inversement du layout
- **Main droite** : Boutons d'action à droite (par défaut)

**Exemple** :
```typescript
<div className={clsx(
  'flex items-center justify-between',
  currentUser?.dominantHand === 'LEFT' && 'flex-row-reverse'
)}>
```

#### Zones de clic élargies

- Padding généreux sur tous les boutons (`py-3 px-4` minimum)
- Cartes entièrement cliquables (`TouchLink`)
- Espacement entre éléments interactifs (`gap-3` minimum)

#### Pas de gestes complexes

- Pas de swipe ou pinch requis
- Pas de hover nécessaire (tout accessible au touch)
- Pas de double-clic
- Alternatives clavier pour tout

### Système de réinitialisation adaptatif

**Problème** : Certaines personnes ont besoin de plus de temps pour faire les exercices.

**Solution** : Fréquence de réinitialisation configurable

- **Quotidien** (`DAILY`) : Les exercices se réinitialisent chaque jour à minuit
- **Hebdomadaire** (`WEEKLY`) : Les exercices se réinitialisent chaque lundi à minuit

**Impact** :
- L'utilisateur voit "Fait" pendant toute la période choisie
- Pas de pression quotidienne si mode hebdomadaire
- Historique complet conservé pour les stats

**Utilitaire** : `src/app/utils/resetFrequency.utils.ts`

---

## 🚀 Configuration et déploiement

### Variables d'environnement

**Fichier** : `.env` (créer depuis `ENV.example`)

```bash
# Base de données PostgreSQL (Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require&schema=public"

# Mot de passe pour accéder au site
SITE_PASSWORD="votre_mot_de_passe_site"

# Environnement (dev pour développement, production pour production)
NEXT_PUBLIC_ENVIRONMENT="dev"

# URL de base du site (pour Open Graph)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Production** :
- `DATABASE_URL` : Connection string Neon
- `SITE_PASSWORD` : Mot de passe sécurisé
- `NEXT_PUBLIC_ENVIRONMENT` : `"production"` (masque la bannière de dev)
- `NEXT_PUBLIC_SITE_URL` : URL de production (ex: `https://synapso.netlify.app`)

### Installation locale

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp ENV.example .env
# Éditer .env avec vos valeurs

# 3. Générer le client Prisma
npm run db:generate

# 4. Pousser le schéma vers la base de données
npm run db:push

# 5. Initialiser avec des données de test (optionnel)
npm run db:seed

# 6. Lancer le serveur de développement
npm run dev
```

**Accès** : http://localhost:3000

### Scripts npm disponibles

#### Développement
- `npm run dev` : Serveur de développement avec Turbopack
- `npm run lint` : Vérifier le code avec ESLint

#### Build
- `npm run build` : Compiler pour la production
- `npm run start` : Lancer le serveur de production

#### Base de données
- `npm run db:studio` : Ouvrir Prisma Studio (interface visuelle)
- `npm run db:generate` : Générer le client Prisma
- `npm run db:push` : Pousser le schéma sans migration
- `npm run db:migrate` : Créer et appliquer une migration
- `npm run db:seed` : Initialiser avec des données de test
- `npm run db:reset` : Réinitialiser complètement la base de données
- `npm run db:backup` : Exporter les données en JSON
- `npm run db:import` : Importer les données depuis JSON

#### Production
- `npm run db:migrate:deploy` : Appliquer les migrations en production

#### PWA
- `npm run pwa:icons` : Générer les icônes PWA

### Déploiement Netlify

**Configuration** : `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Étapes** :

1. **Créer une base de données sur Neon** (https://neon.tech)
   - Créer un projet
   - Copier la connection string

2. **Configurer Netlify**
   - Connecter le repository GitHub
   - Ajouter les variables d'environnement :
     - `DATABASE_URL`
     - `SITE_PASSWORD`
     - `NEXT_PUBLIC_ENVIRONMENT="production"`
     - `NEXT_PUBLIC_SITE_URL="https://votre-site.netlify.app"`

3. **Déployer**
   - Netlify détecte automatiquement Next.js
   - Build automatique à chaque push sur `main`

4. **Appliquer les migrations** (première fois)
   ```bash
   npx prisma migrate deploy
   ```

### PWA (Progressive Web App)

**Fichiers** :
- `public/manifest.json` : Manifest de l'application
- `public/sw.js` : Service Worker
- `public/icon-*.png` : Icônes de différentes tailles
- `public/apple-touch-icon.png` : Icône Apple

**Installation** :
- Chrome/Edge : Bouton "Installer" dans la barre d'adresse
- Safari iOS : "Ajouter à l'écran d'accueil"
- Android : Prompt d'installation automatique

**Fonctionnalités PWA** :
- Installation sur l'écran d'accueil
- Mode plein écran
- Icône personnalisée
- Splash screen

**Composant** : `PWARegister` (enregistrement du Service Worker)

---

## 📊 Visualisations de données (Recharts)

### DonutChart (Graphique en donut)

**Usage** : Répartition des zones travaillées

**Composant** : `DonutChart` (`src/app/features/historique/components/DonutChart.tsx`)

**Props** :
- `data` : Tableau de `{ name: string, value: number, fill: string }`
- `title` : Titre du graphique
- `emptyMessage` : Message si pas de données
- `legendPosition` : `'bottom'` | `'right'`
- `filterSlot` : Composant de filtre (ex: `SegmentedControl`)

**Particularités** :
- Légende interactive (clic pour toggle)
- Label central avec total
- Responsive (empile la légende sur mobile)

### ProgressStatsChart (Graphique d'évolution des progrès)

**Usage** : Évolution des victoires au fil du temps

**Composant** : `ProgressStatsChart` (`src/app/features/historique/components/ProgressStatsChart.tsx`)

**Type** : Area Chart (graphique en aires)

**Données** :
- Victoires groupées par mois

**Particularités** :
- Code couleur : Orange (physique)
- Tooltip avec détail
- **Mode sablier** : Utilise la date sélectionnée pour calculer la limite du graphique (s'arrête à la semaine du jour sélectionné)
- Responsive (s'adapte à la largeur)
- Lazy-loaded pour optimiser les performances

### ActivityLineChart (Graphique en ligne d'activité)

**Usage** : Visualisation de l'évolution de l'activité au fil du temps

**Composant** : `ActivityLineChart` (`src/app/features/historique/components/ActivityLineChart.tsx`)

**Type** : Line Chart (graphique en ligne)

**Particularités** :
- Affichage de la régularité et des tendances
- Navigation par période (semaine/mois)
- Responsive

### BarChart (Graphique en barres de régularité)

**Usage** : Visualisation de la régularité quotidienne

**Composant** : `BarChart` (`src/app/features/historique/components/BarChart.tsx`)

**Type** : Bar Chart (graphique en barres)

**Particularités** :
- Barres colorées selon le nombre d'exercices
- Indicateur de série en cours (current streak)
- Points dorés (⭐) pour les jours avec progrès
- **Mode sablier** : Met en évidence le jour sélectionné (barre bleue) au lieu d'aujourd'hui, légende adaptée "Jour sélectionné"
- Responsive

### ActivityHeatmap (Calendrier d'activité)

**Usage** : Visualisation des 40 derniers jours

**Composant** : `ActivityHeatmap` (`src/app/features/historique/components/ActivityHeatmap.tsx`)

**Affichage** :
- Grille de jours avec code couleur par catégorie
- Étoile ⭐ si victoire ce jour-là
- Série en cours (current streak) : compteur de jours consécutifs

**Interactivité** :
- Clic sur un jour → Modal avec détail (`DayDetailModal`)
- Détail : Liste des exercices faits, victoires du jour
- **Mode sablier** : Clic sur n'importe quel jour (vide ou avec exercices) → Bouton "Ajouter des exercices pour ce jour" (style sablier avec emoji ⏳)

**Particularités** :
- Code couleur par catégorie dominante du jour
- Responsive (s'adapte au nombre de colonnes)
- Tous les jours sont cliquables (pas seulement ceux avec exercices) pour activer le mode sablier

---

## 🔄 Flux utilisateur typiques

### Premier lancement

1. **Accueil** → Modal de mot de passe (`SiteProtection`)
2. Saisie du mot de passe → Cookie HTTP-only créé
3. **Pas d'utilisateur** → `AuthScreen` avec onglet "Créer un compte"
4. Formulaire d'inscription :
   - Nom d'utilisateur
   - Code d'invitation (fourni par l'administrateur)
   - Mot de passe (minimum 8 caractères)
   - Confirmation du mot de passe
5. Création du compte → Affichage de `UserSetup` (personnalisation)
6. Configuration des paramètres :
   - **Main dominante** : Gauche / Droite (positionnement des boutons)
   - **Rythme** : Quotidien / Hebdomadaire (fréquence de réinitialisation)
   - **Journal** : Oui / Non (accès au module journal)
7. Clic sur **"Sauvegarder et commencer"** → Paramètres enregistrés + Redirection vers l'application
8. **Pas d'exercice** → `EmptyState` avec bouton "Créer mon premier exercice"
9. Clic → Formulaire d'ajout d'exercice (`/exercice/add`)
10. Remplissage + Enregistrer → Retour dashboard avec exercice visible

### Faire un exercice

1. **Dashboard** → Sélection onglet "Corps"
2. Clic sur une catégorie (ex: "Haut du corps")
3. Page catégorie avec liste d'exercices (`/exercices/upper_body`)
4. Clic sur "Fait aujourd'hui" → Exercice marqué ✅ (vert émeraude)
5. Entrée `History` créée, compteur de progression mis à jour
6. Message de confirmation (optionnel)

### Noter un progrès

1. **N'importe quelle page** → Clic sur le bouton flottant ⭐ (`ProgressFAB`)
2. Modal `ProgressBottomSheet` s'ouvre
3. Sélection de tags (Force, Souplesse, Équilibre, Confort) [optionnel]
4. Saisie de texte (clavier ou micro 🎤) [optionnel]
5. Sélection de catégorie (zone du corps) [optionnel]
6. Clic "Noter mon progrès !" → Confettis 🎉 + Progrès enregistré
7. Modal se ferme, progrès visible dans l'historique

### Consulter sa progression

1. **Dashboard** → Onglet "Parcours"
2. Clic "Mon parcours" → Page `/historique`
3. **Heatmap** : Vue des 40 derniers jours avec code couleur
4. Clic sur un jour → Modal avec détail du jour
5. **Graphique progrès** : Évolution au fil du temps (si ≥2 progrès)
6. **Donut zones travaillées** : Répartition par partie du corps
7. Filtre période (semaine/mois/tout) pour ajuster les données

### Gérer son journal (si hasJournal = true)

1. Lien vers **Journal** depuis la page d’accueil (ou navigation) → Page `/journal`
2. Page `/journal` : liste des notes + bouton "Ajouter une note"
3. Ajout d’une note : Clic "Ajouter une note" → `/journal/add` → Formulaire (titre, description, date optionnelle) → Enregistrer
4. Édition : depuis une note → "Modifier" → `/journal/edit/[id]`
5. Depuis une note : "Pour le kiné" (épingle) pour l’afficher dans l’onglet Kiné, "Valider", "Partager"

---

## 🎓 Choix d'architecture et justifications

### Pourquoi Next.js App Router ?

1. **Server Components par défaut** : Réduction de la taille du bundle JS côté client
2. **Layouts imbriqués** : Structure claire et réutilisation de layouts
3. **Loading states et error boundaries** : Gestion native des états de chargement et d'erreur
4. **API Routes intégrées** : Pas besoin de backend séparé
5. **Optimisations automatiques** : Images, fonts, scripts

### Pourquoi Prisma ORM ?

1. **Type-safety** : Types TypeScript générés automatiquement depuis le schéma
2. **Migrations gérées** : Historique complet des changements de schéma
3. **Requêtes lisibles** : API fluide et expressive
4. **Studio visuel** : Interface graphique pour visualiser les données
5. **Compatible PostgreSQL** : Base de données robuste pour la production

### Pourquoi PostgreSQL (Neon) ?

1. **Robustesse** : Base de données relationnelle éprouvée
2. **Relations complexes** : Gestion facile des many-to-many (exercices ↔ bodyparts)
3. **Indexes** : Performance pour les requêtes fréquentes
4. **Neon** : Serverless, scaling automatique, backups automatiques, gratuit pour commencer

### Pourquoi un système de progrès ?

**Problématique** : Les personnes en rééducation post-AVC peuvent se décourager face aux difficultés et à la lenteur des progrès.

**Solution** : Gamification positive avec célébrations visuelles (confettis) et tracking de réussites.

**Impact psychologique** :
- Renforcement positif immédiat
- Visualisation de la progression
- Motivation à continuer
- Sentiment d'accomplissement

**Implémentation** :
- Facilité de création (bouton flottant toujours accessible)
- Dictée vocale (pas besoin de taper)
- Tags rapides (un clic)
- Confettis dorés (récompense visuelle)
- Timeline persistante (relecture des progrès)

### Pourquoi le mode de réinitialisation configurable ?

**Problématique** : Certaines personnes progressent plus lentement et peuvent se sentir en échec si les exercices se réinitialisent tous les jours.

**Solution** : Fréquence quotidienne OU hebdomadaire au choix.

**Avantages** :
- Adaptation au rythme de chacun
- Moins de pression si mode hebdomadaire
- Conservation de l'historique complet (stats non impactées)
- Flexibilité pour les périodes difficiles

### Pourquoi Recharts pour les graphiques ?

1. **Composants React** : Intégration native dans l'écosystème
2. **Responsive** : S'adapte automatiquement à la taille de l'écran
3. **Accessible** : Attributs ARIA automatiques
4. **Personnalisable** : Contrôle total du style
5. **Performant** : Optimisé pour React

---

## ⚡ Optimisations de performance

### Principe Mobile First

**Toutes les optimisations de performance sont orientées mobile first** : chaque optimisation doit être évaluée selon son impact sur l'expérience mobile. Les priorités sont :

1. **Temps de chargement** : Minimiser le First Contentful Paint (FCP) et le Largest Contentful Paint (LCP) sur mobile
2. **Fluidité** : Maintenir 60fps constant sur les animations et interactions
3. **Bundle size** : Réduire au maximum la taille du JavaScript initial
4. **Réseau** : Optimiser les requêtes API, réduire le transfert de données
5. **Mémoire** : Éviter les fuites, optimiser les re-renders

### Lazy Loading (Code Splitting)

Les composants lourds utilisant Recharts (~200KB) sont chargés à la demande pour réduire le bundle initial :

**Composants lazy-loadés** :
- `LazyDonutChart` : Graphique en donut (zones travaillées)
- `LazyProgressStatsChart` : Graphique de progression

**Fichiers** : `src/app/features/historique/components/LazyDonutChart.tsx`, `LazyProgressStatsChart.tsx`

```typescript
// Utilisation de next/dynamic pour le lazy loading
export const LazyDonutChart = dynamic<DonutChartProps>(
  () => import('./DonutChart').then((mod) => ({ default: mod.DonutChart })),
  { ssr: false, loading: () => <DonutChartSkeleton /> }
);
```

### TanStack Query (Gestion d'état serveur)

#### Architecture

**Provider** : `QueryProvider` enveloppe l'application et configure le `QueryClient` avec :
- `staleTime: 30s` : Données considérées fraîches pendant 30 secondes
- `gcTime: 5min` : Garde les données en cache pendant 5 minutes
- `refetchOnWindowFocus: false` : Pas de refetch automatique au focus
- `refetchOnReconnect: false` : Pas de refetch automatique au reconnect
- `retry: 2` : 2 tentatives en cas d'erreur

**Query Keys** : Centralisées dans `src/app/lib/api-queries.ts` :
- `exercices.list(filters)` : `filters` inclut `category`, `equipments`, `includeArchived`, `targetDate`, **`resetFrequency`** (DAILY | WEEKLY). Inclure `resetFrequency` permet d’avoir un cache distinct par mode : au changement de mode en paramètres, la clé change et les listes sont refetchées avec la bonne période (jour vs semaine).
- `history`, `progress`, `categoryStats`, `todayCompletedCount` : voir `api-queries.ts`.

**Fetch Functions** : Fonctions réutilisables dans `api-queries.ts` :
- `fetchExercices(filters)` : Récupération des exercices
- `fetchHistory(params)` : Récupération de l'historique
- `fetchProgress(params)` : Récupération des progrès
- `fetchCategoryStats(params)` : Récupération des stats par catégorie
- `fetchTodayCompletedCount(params)` : Comptage des exercices complétés
- `completeExercice(id, userId, completedAt)` : Complétion d'exercice
- `createExercice(data)`, `updateExercice(id, data)`, `deleteExercice(id)` : CRUD exercices

#### Hooks migrés vers TanStack Query

**Hooks utilisant `useQuery`** :
- `useExercices` : Cache intelligent, transitions fluides avec `placeholderData`
- `useHistory` : Options personnalisables (nombre de jours)
- `useProgress` : Récupération des progrès avec limite optionnelle
- `useCategoryStats` : Transformation avec `select` pour filtrer par `referenceDate`
- `useTodayCompletedCount` : Comptage optimisé pour une date spécifique

**Hooks utilisant `useMutation`** :
- `useCompleteExercice` : Optimistic updates avec rollback en cas d'erreur
- `ExerciceForm` : Création/édition/suppression avec invalidation automatique du cache

#### Optimisations de performance

**Optimistic Updates** :
- Mise à jour immédiate de l'UI avant la réponse serveur
- Rollback automatique en cas d'erreur
- Implémenté dans `useCompleteExercice` pour la complétion d'exercices

**Transitions fluides** :
- `placeholderData: (previousData) => previousData` pour garder les données précédentes pendant le chargement
- Évite les "flashs" de contenu vide lors des changements de date en mode sablier

**Options de requête spécifiques** :
- Données qui changent souvent (exercices, history) : `staleTime: 10s`, `gcTime: 2min`
- Données qui changent rarement (equipments, metadata) : `staleTime: 5min`, `gcTime: 10min`

**Préchargement** :
- `TimeContext` précharge les jours adjacents en arrière-plan avec `queryClient.prefetchQuery`
- Navigation instantanée entre jours en mode sablier

#### Invalidation de cache

**Stratégie** : Invalidation ciblée avec `queryClient.invalidateQueries()` :
- Après création/édition/suppression d'exercice : Invalidation de `exercices`, `history`, `categoryStats`, `todayCompletedCount`
- Après complétion d'exercice : Invalidation de toutes les queries concernées
- Changement d'utilisateur : `queryClient.clear()` pour vider tout le cache

**Avant** : Utilisation d'événements personnalisés (`category-stats-refresh`, `exercice-completed-refresh`) et cache manuel (`apiCache`)

**Après** : TanStack Query gère automatiquement la synchronisation via les invalidations de cache

#### DevTools

**En développement** : `ReactQueryDevtools` disponible pour :
- Visualiser toutes les queries actives
- Inspecter le cache
- Déboguer les états de chargement/erreur
- Tester les invalidations

### Optimisation des requêtes API

#### Filtre côté serveur pour l'historique

L'API `/api/history` accepte un paramètre `since` pour filtrer les données côté serveur et réduire le transfert :

```typescript
// Avant : récupérait TOUT l'historique
GET /api/history

// Après : récupère seulement depuis une date
GET /api/history?since=2026-01-01T00:00:00.000Z
```

**Hook concerné** : `useCategoryStats` utilise automatiquement ce filtre pour ne charger que la période active (jour ou semaine), avec transformation client-side via `select` pour respecter `referenceDate` en mode sablier.

### Mémorisation React

#### UserContext mémorisé

Le `UserContext` utilise `useMemo` pour éviter les re-renders globaux inutiles :

```typescript
const contextValue = useMemo<UserContextType>(() => ({
  currentUser, effectiveUser, isAdmin, loading, /* ... */
}), [currentUser, effectiveUser, isAdmin, loading, allUsers]);
```

#### Composants de liste mémorisés

Les composants de carte utilisent `React.memo` pour éviter les re-renders quand un seul item change :
- `ExerciceCard`
- `JournalNoteCard`

### Optimisation des animations (Confettis)

**ConfettiRain** (pluie globale, objectif du jour, etc.) : Réduction des particules sur mobile, `will-change: transform, opacity`, animations GPU-friendly.

**ConfettiValidate** (célébration complétion d’exercice) :
- Déclenché à la **confirmation serveur** (réponse PATCH complete), depuis le bouton "Fait aujourd'hui".
- Couleurs émeraude uniquement ; confettis plus petits ; expansion plutôt horizontale (×1.35) et moins verticale (×0.5) ; animation courte (1.6 s) avec disparition en fondu (opacité).
- Composant dédié `features/exercices/components/ConfettiValidate.tsx` ; pas de contour vert sur la carte (évite le doublon).

### Optimisation des fonts

Utilisation de `next/font` pour le chargement optimisé de la font Inter :

```typescript
// src/app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
```

**Avantages** :
- Hébergement local des fonts (pas de requête externe à Google Fonts)
- Préchargement automatique
- Élimination du FOUT (Flash of Unstyled Text)

### Index de base de données

#### Index composite sur History

Un index composite optimise les requêtes fréquentes filtrant par exercice ET date :

```prisma
model History {
  // ...
  @@index([exerciceId, completedAt]) // Index composite
  @@index([completedAt])             // Index simple conservé
}
```

### Service Worker optimisé

Le Service Worker utilise une version fixe pour éviter d'invalider le cache à chaque visite :

```javascript
// public/sw.js
const CACHE_VERSION = 'v1.2.0'; // Version fixe, mise à jour manuellement
```

**Stratégie de cache** : Network First avec fallback sur cache pour le mode offline.

### Résumé des gains

| Optimisation | Impact |
|-------------|--------|
| Lazy loading Recharts | -200KB bundle initial |
| Filtre `since` API history | Réduction transfert réseau |
| UserContext mémorisé | Réduction re-renders globaux |
| React.memo composants | Réduction re-renders listes |
| Confettis mobile | +15fps sur appareils bas de gamme |
| next/font | Élimination FOUT |
| Index composite DB | Requêtes ~30% plus rapides |

---

## 🚀 Optimisations de performance futures (opportunités)

### Architecture actuelle : Points forts et axes d'amélioration

L'architecture actuelle est déjà bien optimisée avec TanStack Query, lazy loading, et mémorisation. Voici les **opportunités d'amélioration** identifiées pour challenger encore les performances :

### 1. Réduction du bundle JavaScript initial

#### Problème actuel
- Beaucoup de pages sont en `'use client'` (page.tsx, historique/page.tsx)
- Tous les Contexts sont chargés même si non utilisés
- Framer Motion chargé même pour les pages sans animations

#### Solutions proposées

**A. Server Components pour les parties statiques**
```typescript
// ✅ AVANT : Tout en Client Component
'use client';
export default function Home() {
  // Tout le code client
}

// ✅ APRÈS : Hybride Server/Client
// page.tsx (Server Component)
export default async function Home() {
  const user = await getCurrentUser(); // Fetch côté serveur
  return (
    <>
      <HomeHeader user={user} /> {/* Server Component */}
      <HomeTabs /> {/* Client Component isolé */}
    </>
  );
}
```

**B. Code splitting plus agressif des Contexts**
```typescript
// ✅ Charger les Contexts uniquement quand nécessaires
const TimeContextProvider = dynamic(
  () => import('@/app/contexts/TimeContext').then(mod => mod.TimeProvider),
  { ssr: false }
);
```

**Gain estimé** : -100KB à -200KB de bundle initial

### 2. Streaming et Suspense pour un chargement progressif

#### Problème actuel
- Les pages attendent toutes les données avant de s'afficher
- Pas de feedback visuel pendant le chargement des données lourdes

#### Solution proposée
```typescript
// ✅ Utiliser Suspense pour charger progressivement
export default function HistoriquePage() {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <HistoriqueHeader />
      </Suspense>
      
      <Suspense fallback={<HeatmapSkeleton />}>
        <ActivityHeatmap />
      </Suspense>
      
      <Suspense fallback={<ChartsSkeleton />}>
        <HistoriqueCharts />
      </Suspense>
    </>
  );
}
```

**Gain estimé** : FCP réduit de 30-50% (First Contentful Paint)

### 3. Optimisation des Contexts (réduction des re-renders)

#### Problème actuel
- 6 Contexts différents (User, Time, SelectedDate, Category, History, DayDetailModal)
- Chaque changement de Context peut déclencher des re-renders en cascade
- `UserContext` et `TimeContext` sont utilisés partout

#### Solutions proposées

**A. Split des Contexts par domaine**
```typescript
// ✅ Séparer UserContext en sous-contextes
// UserDataContext (données) vs UserUIContext (préférences UI)
// Réduit les re-renders : seuls les composants concernés se mettent à jour
```

**B. Utiliser des sélecteurs pour TanStack Query**
```typescript
// ✅ Au lieu de récupérer toutes les données
const { data } = useQuery(queryKeys.exercices.all);

// ✅ Utiliser un sélecteur pour ne récupérer que ce qui change
const exercices = useQuery({
  ...queryKeys.exercices.all,
  select: (data) => data.filter(e => e.category === activeCategory)
});
```

**C. Contexts conditionnels (charger uniquement si nécessaire)**
```typescript
// ✅ Charger TimeContext uniquement si mode sablier activé
{isTimeMachineMode && (
  <TimeContextProvider>
    {/* Contenu */}
  </TimeContextProvider>
)}
```

**Gain estimé** : Réduction de 40-60% des re-renders inutiles

### 4. Cache côté serveur (Next.js Cache API)

#### Problème actuel
- Toutes les requêtes passent par l'API route → Prisma → PostgreSQL
- Pas de cache HTTP côté serveur
- Données recalculées à chaque requête

#### Solution proposée
```typescript
// ✅ Dans les API Routes
export async function GET(request: NextRequest) {
  const cacheKey = `exercices-${userId}-${targetDate}`;
  
  // Vérifier le cache
  const cached = await cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);
  
  // Sinon, fetch et cache
  const data = await prisma.exercice.findMany({...});
  await cache.set(cacheKey, data, { revalidate: 30 }); // 30s
  
  return NextResponse.json(data);
}
```

**Gain estimé** : Réduction de 50-70% des requêtes DB pour les données fréquentes

### 5. Agrégations côté base de données

#### Problème actuel
- Les statistiques sont calculées côté client (ex: `useCategoryStats`)
- Toutes les données sont transférées puis filtrées/calculées

#### Solution proposée
```typescript
// ✅ Créer une route API dédiée pour les stats
// /api/stats/category?userId=1&date=2026-01-15

// Côté serveur : agrégation SQL
const stats = await prisma.$queryRaw`
  SELECT 
    category,
    COUNT(*) as total,
    SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
  FROM Exercice
  WHERE userId = ${userId}
  GROUP BY category
`;

// Réduit le transfert réseau de 80-90%
```

**Gain estimé** : Réduction de 80-90% du transfert réseau pour les stats

### 6. Préchargement intelligent (prefetching)

#### Problème actuel
- Préchargement uniquement des jours adjacents en mode sablier
- Pas de préchargement des pages fréquemment visitées

#### Solutions proposées

**A. Prefetch des routes probables**
```typescript
// ✅ Dans le layout ou après connexion
useEffect(() => {
  // Précharger les pages les plus visitées
  router.prefetch('/exercices/upper_body');
  router.prefetch('/historique');
}, []);
```

**B. Prefetch conditionnel basé sur l'usage**
```typescript
// ✅ Précharger la catégorie suivante si l'utilisateur navigue souvent
if (userBehavior.tendsToNavigateCategories) {
  router.prefetch(`/exercices/${nextCategory}`);
}
```

**Gain estimé** : Navigation instantanée sur les pages préchargées

### 7. Optimisation des requêtes API (batch requests)

#### Problème actuel
- Chaque hook fait sa propre requête API
- Plusieurs requêtes parallèles pour une même page

#### Solution proposée
```typescript
// ✅ Créer une route API "batch" pour charger plusieurs ressources
// /api/batch?resources=exercices,history,stats&userId=1&date=2026-01-15

export async function GET(request: NextRequest) {
  const { resources, userId, date } = parseParams(request);
  
  // Exécuter toutes les requêtes en parallèle
  const [exercices, history, stats] = await Promise.all([
    fetchExercices(userId, date),
    fetchHistory(userId, date),
    fetchStats(userId, date),
  ]);
  
  return NextResponse.json({ exercices, history, stats });
}

// ✅ Côté client : une seule requête au lieu de 3
const { data } = useQuery({
  queryKey: ['batch', userId, date],
  queryFn: () => fetchBatch({ userId, date })
});
```

**Gain estimé** : Réduction de 40-60% du temps de chargement initial (moins de round-trips)

### 8. Virtualisation des listes longues

#### Problème actuel
- Tous les exercices sont rendus même si non visibles
- Scroll lent avec beaucoup d'exercices

#### Solution proposée
```typescript
// ✅ Utiliser react-window ou @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

function ExercicesList({ exercices }) {
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: exercices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Hauteur estimée d'une carte
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map(virtualItem => (
        <ExerciceCard key={virtualItem.key} exercice={exercices[virtualItem.index]} />
      ))}
    </div>
  );
}
```

**Gain estimé** : Scroll fluide même avec 100+ exercices, réduction mémoire

### 9. Service Worker amélioré (cache stratégique)

#### Problème actuel
- Cache basique "Network First"
- Pas de stratégie différenciée par type de ressource

#### Solution proposée
```javascript
// ✅ Stratégies différenciées
const CACHE_STRATEGIES = {
  // API : Cache First avec revalidation (données qui changent peu)
  '/api/metadata': 'cache-first',
  
  // Exercices : Stale While Revalidate (données qui changent souvent)
  '/api/exercices': 'stale-while-revalidate',
  
  // Stats : Cache First (calculs coûteux)
  '/api/stats': 'cache-first',
};

// Réduit les requêtes réseau de 60-80% en mode offline/faible connexion
```

**Gain estimé** : Expérience fluide même en mode offline/faible connexion

### 10. Réduction des dépendances lourdes

#### Problème actuel
- Framer Motion chargé même si pas d'animations
- date-fns chargé en entier

#### Solutions proposées

**A. Tree-shaking agressif**
```typescript
// ✅ Importer uniquement ce qui est nécessaire
import { format, startOfDay } from 'date-fns'; // Au lieu de import * from 'date-fns'
```

**B. Alternatives légères**
```typescript
// ✅ Remplacer Framer Motion par CSS animations pour les cas simples
// Utiliser Framer Motion uniquement pour les animations complexes
```

**Gain estimé** : -50KB à -100KB de bundle

---

### Priorisation des optimisations

**Impact élevé / Effort faible** (Quick wins) :
1. ✅ Cache côté serveur (Next.js Cache API)
2. ✅ Agrégations côté DB pour les stats
3. ✅ Batch requests API
4. ✅ Tree-shaking des dépendances

**Impact élevé / Effort moyen** :
5. ✅ Server Components pour parties statiques
6. ✅ Streaming avec Suspense
7. ✅ Optimisation des Contexts (split)

**Impact moyen / Effort faible** :
8. ✅ Préchargement intelligent
9. ✅ Service Worker amélioré

**Impact moyen / Effort élevé** :
10. ✅ Virtualisation des listes (si >50 items)

---

### Métriques de performance cibles

| Métrique | Actuel (estimé) | Cible | Amélioration |
|----------|----------------|-------|--------------|
| **FCP** (First Contentful Paint) | ~1.5s | <1s | -33% |
| **LCP** (Largest Contentful Paint) | ~2.5s | <1.5s | -40% |
| **Bundle initial** | ~300KB | <200KB | -33% |
| **Time to Interactive** | ~3s | <2s | -33% |
| **Requêtes DB/page** | 3-5 | 1-2 | -60% |
| **Re-renders inutiles** | ~20/page | <5/page | -75% |

---

### Architecture optimisée (vision)

```
┌─────────────────────────────────────────────────────────┐
│              SERVER (Next.js App Router)                 │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Server Components (pages statiques)             │   │
│  │  • Fetch données côté serveur                    │   │
│  │  • Cache Next.js (revalidate: 30s)              │   │
│  │  • Streaming avec Suspense                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  API Routes optimisées                          │   │
│  │  • Batch requests (/api/batch)                   │   │
│  │  • Agrégations SQL (stats)                       │   │
│  │  • Cache serveur (30s)                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Streaming HTML
                          ▼
┌─────────────────────────────────────────────────────────┐
│              CLIENT (React 19)                            │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Client Components isolés                        │   │
│  │  • Code splitting agressif                       │   │
│  │  • Contexts conditionnels                        │   │
│  │  • Virtualisation listes longues                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  TanStack Query optimisé                         │   │
│  │  • Sélecteurs pour réduire re-renders           │   │
│  │  • Préchargement intelligent                    │   │
│  │  • Cache client (5min)                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Service Worker
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Cache stratégique (Network First / Cache First)         │
│  • Réduction 60-80% requêtes réseau                     │
│  • Mode offline fonctionnel                            │
└─────────────────────────────────────────────────────────┘
```

---

### Notes importantes

**⚠️ Trade-offs à considérer** :
- **Server Components** : Moins de JavaScript côté client, mais nécessite un serveur Node.js (OK avec Netlify)
- **Cache serveur** : Données potentiellement "stale" pendant 30s (acceptable pour cette app)
- **Batch requests** : Plus complexe à maintenir, mais gain de performance significatif
- **Virtualisation** : Nécessaire uniquement si >50 items (peut-être pas prioritaire)

**✅ Principe** : Optimiser d'abord ce qui a le plus d'impact utilisateur (FCP, LCP, bundle initial)

---

## 🔮 Évolutions futures possibles

### Fonctionnalités envisageables

1. **Rappels et notifications**
   - Notifications push pour les exercices
   - Rappels personnalisés (matin/soir)
   - Encouragements quotidiens

2. **Mode accompagnant**
   - Compte "proche aidant" avec accès lecture
   - Partage de progression avec famille/thérapeutes
   - Ajout d'exercices par le thérapeute

3. **Exercices vidéo**
   - Bibliothèque de vidéos de démonstration
   - Upload de vidéos personnalisées
   - Timer intégré pour suivre les séries

4. **Objectifs et défis**
   - Définition d'objectifs hebdomadaires/mensuels
   - Défis progressifs (ex: 5 jours consécutifs)
   - Badges de récompense

5. **Export de données**
   - PDF de rapport de progression
   - Export CSV pour analyse externe
   - Partage avec professionnels de santé

6. **Mode hors-ligne amélioré**
   - Synchronisation automatique au retour en ligne
   - Cache des données pour usage hors connexion
   - Indicateur de statut de connexion

7. **Accessibilité vocale**
   - Commandes vocales pour naviguer
   - Lecture vocale des exercices
   - Mode mains-libres complet

### Améliorations techniques

1. **Tests automatisés**
   - Tests unitaires (Jest)
   - Tests d'intégration (React Testing Library)
   - **Tests E2E (Playwright)** : dans `tests/e2e/`. Compte de test : Testeuse / 1234 (à créer en base ou via seed). Specs : connexion et déconnexion, navigation (accueil, historique, catégories, équipements, archivés, paramètres, notifications), exercices (CRUD, archivage), progrès (CRUD), mode sablier (time-machine), paramètres (enregistrement profil), journal (affichage, création de note), partage (ouverture modale), archivage (archiver/désarchiver). Lancer avec `npx playwright test` (serveur sur port 3003).

2. **Monitoring et analytics**
   - Suivi des erreurs (Sentry)
   - Analytics d'usage (sans données personnelles)
   - Performance monitoring

3. **Internationalisation**
   - Support multi-langues (i18n)
   - Formats de dates localisés
   - Traduction de l'interface

---

## 📚 Ressources et documentation

### Documentation externe

- **Next.js** : https://nextjs.org/docs
- **React** : https://react.dev/
- **Prisma** : https://www.prisma.io/docs
- **Tailwind CSS** : https://tailwindcss.com/docs
- **Recharts** : https://recharts.org/en-US/
- **Framer Motion** : https://www.framer.com/motion/
- **WCAG 2.1** : https://www.w3.org/WAI/WCAG21/quickref/

### Documentation interne

- **README.md** : Instructions d'installation et déploiement
- **ENV.example** : Variables d'environnement nécessaires
- **.cursorrules** : Conventions de code et règles du projet
- **prisma/schema.prisma** : Structure de la base de données
- **src/app/constants/** : Constantes et configuration centralisée

### Fichiers clés à consulter

#### Architecture
- `src/app/layout.tsx` : Structure globale, providers
- `src/app/(pages)/page.tsx` : Dashboard principal
- `src/app/lib/prisma.ts` : Client Prisma
- `src/app/lib/auth.ts` : Gestion de l'authentification

#### Composants essentiels
- `src/app/components/ui/CompleteButton.tsx` : Bouton de complétion d'exercice
- `src/app/features/progress/components/ProgressBottomSheet.tsx` : Modal de création de progrès
- `src/app/features/exercices/components/ConfettiRain.tsx` : Animation de confettis
- `src/app/components/AuthWrapper.tsx` : Protection par mot de passe
- `src/app/features/journal/components/JournalNoteCard.tsx` : Carte de note du journal (carte blanche, sans bande colorée)
- `src/app/features/journal/components/JournalNotesList.tsx` : Liste des notes

#### Hooks importants
- `src/app/features/exercices/hooks/useExercices.ts` : Récupération des exercices (query key inclut `resetFrequency` pour cohérence DAILY/WEEKLY)
- `src/app/features/exercices/hooks/useCompleteExercice.ts` : Complétion d'exercice ; réception de `weeklyCompletions` pour le mode WEEKLY
- `src/app/features/exercices/hooks/useCategoryFilters.ts` : Filtres page catégorie (bodyparts, équipements, listes dérivées)
- `src/app/features/exercices/api/completeExercice.ts` : Retourne `weeklyCompletions` (semaine de `completedAt`) pour le front
- `src/app/features/progress/hooks/useProgress.ts` : Récupération des progrès
- `src/app/features/journal/hooks/useJournalNotes.ts` : Récupération des notes du journal
- `src/app/features/journal/hooks/useJournalCheck.ts` : Vérification de l'accès au module journal
- `src/app/hooks/usePageFocus.ts` : Gestion du focus (accessibilité)
- `src/app/hooks/useSpeechRecognition.ts` : Reconnaissance vocale

#### Contextes
- `src/app/contexts/UserContext.tsx` : Utilisateur courant (utilise `queryClient.clear()` pour nettoyer le cache)
- `src/app/contexts/ToastContext.tsx` : Notifications globales
- `src/app/contexts/DayDetailModalContext.tsx` : Modal détail du jour
- `src/app/contexts/SelectedDateContext.tsx` : Date sélectionnée pour le mode sablier (URL-based)
- `src/app/contexts/TimeContext.tsx` : Contexte temporel global (date de référence, préchargement)

#### Providers
- `src/app/providers/QueryProvider.tsx` : Provider TanStack Query avec configuration et DevTools

#### Bibliothèques
- `src/app/lib/api-queries.ts` : Query keys centralisées et fonctions de fetch réutilisables pour TanStack Query

#### Logique métier API (par feature)
- `src/app/features/exercices/api/` : Fonctions de gestion des exercices (getExercices, createExercice, updateExercice, deleteExercice, completeExercice, archiveExercice, pinExercice, uploadMedia, getMetadata, getBodyparts, getBodypart, createBodypart, updateBodypart, deleteBodypart, getEquipments)
- `src/app/features/progress/api/` : Fonctions de gestion des progrès (getProgress, createProgress, updateProgress, deleteProgress)
- `src/app/features/journal/api/` : Fonctions de gestion du journal (getJournalNotes, createJournalNote, updateJournalNote, deleteJournalNote, pinJournalNote, validateJournalNote)
- `src/app/features/historique/api/` : Fonctions de gestion de l'historique (getHistory, getCategoryStats)
- `src/app/features/auth/api/` : Fonctions d'authentification et gestion utilisateurs (login, register, checkAuth, getUsers, getUser, updateUser, deleteUser, updateUserPassword)

---

## 🤝 Contribuer au projet

### Convention de commits

Le projet suit la spécification [Conventional Commits](https://www.conventionalcommits.org/).

**Format** : `<type>(<scope>): <description>`

**Types** :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `refactor` : Refactoring (ni bug ni feature)
- `style` : Formatage, espaces, ponctuation
- `docs` : Documentation uniquement
- `test` : Ajout/correction de tests
- `perf` : Amélioration de performance
- `build` : Système de build, dépendances
- `ci` : CI/CD, configuration

**Scope** : Module/fonctionnalité concernée (ex: `clinical-data`, `forms`, `api`, `domain`)

**Exemples** :
```bash
feat(exercices): add weekly reset frequency option
fix(victory): resolve confetti animation on mobile
refactor(api): simplify authentication middleware
docs(readme): update installation instructions
```

**Breaking changes** :
```bash
feat(api)!: change authentication endpoint

BREAKING CHANGE: The /auth endpoint now requires a different payload structure
```

### Processus de développement

1. **Créer une branche** : `git checkout -b feat/nouvelle-fonctionnalite`
2. **Développer** : Suivre les conventions de code (`.cursorrules`)
3. **Tester** : Vérifier en local, tester l'accessibilité
4. **Commit** : Respecter les conventions de commits
5. **Push** : `git push origin feat/nouvelle-fonctionnalite`
6. **Pull Request** : Décrire les changements, ajouter des captures d'écran si UI

### Checklist avant commit

- [ ] Le code suit les conventions `.cursorrules`
- [ ] Les types sont correctement définis (`type Props`, pas `interface`)
- [ ] Les composants sont nommés en PascalCase
- [ ] Les hooks retournent des objets (pas des tuples)
- [ ] `'use client'` uniquement si nécessaire
- [ ] `clsx` utilisé pour les classes conditionnelles
- [ ] Keys uniques dans les listes (pas d'index seul)
- [ ] Erreurs lancées avec `throw new Error()` (pas de `return`)
- [ ] Accessibilité vérifiée (navigation clavier, contrastes, labels)
- [ ] Testé sur mobile (responsive)

---

## 📞 Support et contact

### Pour signaler un bug

1. Vérifier que le bug n'est pas déjà connu
2. Reproduire le bug de manière fiable
3. Noter les étapes de reproduction
4. Noter l'environnement (navigateur, OS, taille d'écran)
5. Créer une issue GitHub avec ces informations

### Pour proposer une amélioration

1. Vérifier que la fonctionnalité n'existe pas déjà
2. Décrire le besoin utilisateur
3. Proposer une solution (optionnel)
4. Créer une issue GitHub ou une discussion

---

## 📖 Styleguide

**Route** : `/styleguide` (`src/app/(pages)/styleguide/page.tsx`)

Le styleguide est une documentation visuelle complète de tous les composants UI disponibles dans l'application. Il est organisé par catégories avec une carte par composant.

### Structure

Le styleguide est organisé en sections principales :

1. **Boutons** : Tous les composants bouton (Button, CompleteButton, ActionButton, AddButton, ProgressButton, BackButton)
2. **Cartes** : Composants de carte (Card, BaseCard)
3. **Badges** : Badges et indicateurs visuels (Badge avec toutes ses variantes)
4. **Champs de formulaire** : Inputs et textareas (Input, Textarea, InputWithSpeech, TextareaWithSpeech)
5. **Contrôles** : Composants de contrôle (ToggleButtonGroup, SegmentedControl)
6. **Navigation** : Composants de navigation (PeriodNavigation, ViewAllLink)
7. **Accordion** : Composant accordéon avec compound pattern
8. **Composants utilitaires** : Loader, Logo, WeeklyCompletionIndicator
9. **Actions de formulaire** : FormActions
10. **Composants composites** : Note sur les composants composés

### Composant ComponentCard

Chaque composant UI est affiché dans une `ComponentCard` qui fournit :
- Un titre clair
- Une description optionnelle
- Un espace organisé pour les exemples et variantes

### Utilisation

Le styleguide permet de :
- Visualiser tous les composants UI disponibles
- Voir les variantes et options de chaque composant
- Tester les composants interactifs
- Comprendre la structure et les props de chaque composant

**Note** : Les composants composites (CategoryCardWithProgress, ExerciceCard, etc.) sont documentés dans leur contexte d'utilisation dans l'application plutôt que dans le styleguide.

### Architecture du système de design

#### Hiérarchie des composants

Le système de design suit une architecture en couches pour maximiser la réutilisabilité :

```
Button (composant de base)
  └── ActionButton (composant unifié)
      ├── AddButton (wrapper spécialisé)
      └── ProgressButton (wrapper spécialisé)
```

**Principe** : Les composants de base sont réutilisés par des wrappers spécialisés qui ajoutent de la logique métier ou simplifient l'API.

#### Patterns de composition

**Compound Components Pattern** : Utilisé pour `BaseCard` et `Accordion`

```typescript
// BaseCard avec sous-composants
<BaseCard isGolden>
  <BaseCard.Accent />
  <BaseCard.Content>...</BaseCard.Content>
  <BaseCard.Footer>...</BaseCard.Footer>
</BaseCard>
```

**Avantages** :
- Flexibilité maximale
- API intuitive
- Propagation automatique du contexte (ex: `isGolden`)

#### Export centralisé

Tous les composants UI sont exportés via `src/app/components/ui/index.tsx` :

```typescript
// ✅ BON - Import centralisé
import { Button, Badge, Card } from '@/app/components/ui';

// ⚠️ ACCEPTABLE - Import direct (mais moins préféré)
import { Button } from '@/app/components/ui/Button';
```

#### Constantes de style

**Source unique de vérité** :
- `exercice.constants.ts` : Couleurs de catégories
- `card.constants.ts` : Styles de cartes
- `emoji.constants.ts` : Emojis standardisés

**Règle** : JAMAIS de couleurs hardcodées dans les composants, toujours utiliser les constantes.

#### Cohérence des variants

Tous les composants suivent des conventions de variants cohérentes :

- **Tailles** : `sm`, `md`, `lg`
- **Variants** : `default`, `secondary`, `danger`, etc.
- **Padding** : `none`, `sm`, `md`, `lg`
- **Border radius** : `md`, `lg`, `full`

#### Utilisation recommandée

**Composants de base** : Utiliser directement pour des cas génériques
- `Button` : Bouton standard
- `Card` : Carte simple
- `Badge` : Badge générique
- `Input` / `Textarea` : Champs de formulaire

**Wrappers spécialisés** : Utiliser pour des cas d'usage spécifiques
- `AddButton` : Bouton d'ajout (utilise ActionButton)
- `ProgressButton` : Bouton de progrès (utilise ActionButton)
- `CompleteButton` : Bouton de complétion (logique métier)
- `InputWithSpeech` / `TextareaWithSpeech` : Champs avec dictée vocale

**Composants composites** : Utiliser pour des cas complexes
- `BaseCard` : Carte interactive avec compound pattern
- `Accordion` : Accordéon avec compound pattern

#### Bonnes pratiques

1. **Toujours utiliser `clsx`** pour les classes conditionnelles
2. **Utiliser les constantes** pour les couleurs et styles
3. **Préférer l'export centralisé** (`@/app/components/ui`)
4. **Documenter avec JSDoc** les composants complexes
5. **Respecter les conventions** de naming (PascalCase, noms descriptifs)

#### Audit et qualité

Un audit complet du styleguide est disponible dans `AUDIT_STYLEGUIDE.md` qui évalue :
- Structure et organisation (9/10)
- Cohérence du style (9/10)
- Factorisation (10/10)
- Simplicité (9/10)
- Compréhensibilité (9/10)
- Utilisation (8/10)

**Score global** : 8.5/10 ⭐⭐⭐⭐

Le système de design est excellent avec quelques améliorations mineures recommandées (voir `AUDIT_STYLEGUIDE.md` pour les détails).

---

**Dernière mise à jour** : 15 janvier 2026  
**Version de l'application** : 0.1.14 (correction gauges mode sablier)  
**Auteur du contexte** : Documentation générée par analyse du projet Synapso

### Modifications récentes (v0.1.12)

- **Simplification drastique du code** :
  - **useCompleteExercice** : Refactorisation complète pour éliminer la complexité inutile
    - Suppression de toutes les fonctions helper complexes (`matchesTargetDate`, `matchesHistoryDate`, `createOptimisticEntry`, `calculateNewState`)
    - Suppression de tous les `useMemo` inutiles (calculs directs au lieu de mémorisation)
    - Simplification de `targetDate` : utilisation directe de `referenceDateKey` (undefined = aujourd'hui)
    - Suppression de `isTimeMachineMode` : utilisation directe de `referenceDateKey`
    - Logique simplifiée : toggle `completedToday` → ajouter/supprimer de l'historique → invalider les queries
    - Rollback simplifié : `forEach` sur une ligne
    - Code réduit de 207 lignes à 146 lignes (-30%)
  - **useCategoryStats** : Simplification du calcul des stats
    - Remplacement de `filter` + `forEach` par une simple boucle `for...of`
    - Nettoyage des commentaires verbeux
    - Code réduit de 74 lignes à 63 lignes (-15%)
  - **Résultat** : Code plus simple, direct, sans boucles de rendu, plus facile à maintenir

### Modifications récentes (v0.1.14)

- **Correction du problème de mise à jour des gauges en mode sablier** :
  - **Problème identifié** : Les gauges ne se mettaient pas à jour en mode sablier après avoir complété un exercice, alors que cela fonctionnait en mode "aujourd'hui"
  - **Cause** : La query `useCategoryStats` n'était pas toujours active au moment de l'invalidation, donc `refetchOnMount: true` seul ne suffisait pas en mode sablier
  - **Solution** :
    - `refetchOnMount: 'always'` : Force le refetch au montage même si les données ne sont pas stale
    - `useEffect` en mode sablier : Force un refetch explicite au montage en mode sablier pour garantir des données fraîches
    - `refetchOnWindowFocus: true` : Refetch aussi quand la fenêtre reprend le focus
  - **Fichiers modifiés** :
    - `src/app/features/exercices/hooks/useCategoryStats.ts` : Ajout de `refetchOnMount: 'always'`, `refetchOnWindowFocus: true` et `useEffect` pour forcer le refetch en mode sablier
    - `src/app/features/exercices/hooks/useCompleteExercice.ts` : Invalidation de toutes les queries history (actives et inactives) avec `refetchType: 'active'`
  - **Résultat** : Les gauges se mettent à jour correctement dans les deux modes (aujourd'hui et sablier)

### Modifications récentes (v0.1.13)

- **Optimisation de l'architecture** :
  - **Suppression de HistoryContext** : Remplacé par `useHistory` (TanStack Query) - réactivité gérée automatiquement via invalidations
  - **Suppression de CategoryContext** : Non utilisé (aucune utilisation trouvée)
  - **Optimisation de l'ordre des providers** : Réduction de 7 à 5 providers, ordre optimisé pour réduire les re-renders
  - **Simplification de SelectedDateContext** : 
    - Suppression de `debouncedSelectedDateKey` (non utilisé)
    - Simplification de `normalizedSelectedDate` (suppression du ref inutile)
    - Simplification de la logique de transitions (1 ref au lieu de 3)
    - Extraction de la validation dans `dateValidation.utils.ts`
    - **Résultat** : Code réduit de 309 à 177 lignes (-43%)
  - **Résultat global** : -30% de providers, -277 lignes de code, réduction estimée de 20-30% des re-renders
  - **Architecture finale** : 5 contexts nécessaires et justifiés (UserContext, ToastContext, DayDetailModalContext, SelectedDateContext, TimeContext)

### Modifications récentes (v0.1.11)

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

### Modifications récentes (v0.1.10)

- **Améliorations design du mode sablier** :
  - **Bannière responsive** : `SelectedDateBanner` améliorée pour mobile avec texte adaptatif ("Aujourd'hui" sur mobile, "Revenir à aujourd'hui" sur desktop)
  - **Lisibilité améliorée** : Utilisation de `truncate` et `line-clamp` pour éviter les débordements de texte sur petits écrans
  - **Cadre cosmique** : `TimeMachineWrapper` avec effet de lueur cosmique subtil via `shadow-[0_0_20px_rgba(99,102,241,0.08)]` pour une distinction visuelle plus douce
  - **Indicateurs visuels** : Badge cosmique discret ajouté dans `ExerciceCard` (coin supérieur droit) avec sablier doré ⏳ pour indiquer visuellement que l'exercice est en mode sablier
  - **Accessibilité** : Amélioration des contrastes et de la lisibilité sur tous les écrans (mobile-first)

### Modifications récentes (v0.1.9)

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

### Modifications récentes (v0.1.8)

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

### Modifications récentes (v0.1.7)

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

### Modifications récentes (v0.1.6)

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

### Modifications récentes (v0.1.4)

- **Module Journal** : Module de notes uniquement (tâches supprimées)
  - **Notes** : Titre, description, date optionnelle ; épingle "Pour le kiné", validation, partage
  - Routes : `/journal`, `/journal/add`, `/journal/edit/[id]`
  - Composants : `JournalNoteCard` (carte blanche), `JournalNotesList`
  - Hooks : `useJournalNotes`, `useJournalCheck`, `usePinJournalNote`, `useValidateJournalNote`, `useShareJournalNote`
  - API : `/api/journal/notes`, `/api/journal/notes/[id]`, `/api/journal/notes/[id]/pin`, `/api/journal/notes/[id]/validate`
  - **Onglet Kiné (page d'accueil)** : Sections titrées "Exercices", "Progrès", "Notes pour le kiné" pour les éléments épinglés

### Modifications récentes (v0.1.3)

- **Filtres** : Ajout du badge "Tous" pour réinitialiser rapidement les filtres (équipements et bodyparts)
- **Badges équipements** : Style blanc avec bordure pour cohérence avec les filtres, cliquables pour navigation vers la page de filtres
- **Navigation retour** : Bouton retour sur la page de création d'exercice qui ramène à la page d'origine (catégorie ou équipements)
- **Simplification** : Retrait des compteurs sur les badges "Tous" pour réduire la surcharge visuelle
- **Mobile first** : Effets hover uniquement sur desktop (`md:hover:`), feedback tactile avec `active:` pour mobile

