# Context - Synapso

**Dernière mise à jour du contexte** : 13 mars 2026

### A lire en priorite

- **Timezone** : Ne jamais envoyer `.toISOString()` pour representer un jour ; utiliser le `dateKey` (`yyyy-MM-dd`) cote client et le "noon UTC trick" cote serveur. Voir [Point de vigilance critique : Timezone](#-point-de-vigilance-critique--timezone-dates).
- **Mobile first** : Performance et fluidite mobile sont la priorite absolue ; chaque fonctionnalite doit etre testee sur mobile. Voir [Principe Mobile First](#principe-mobile-first).
- **Structure** : Code organise par features ; conventions dans [Patterns et conventions de code](#-patterns-et-conventions-de-code).

### Sommaire

- [Vision](#-vision) · [Utilisateurs](#-utilisateurs-cibles) · [Fonctionnalites majeures](#-fonctionnalites-majeures) · [Stack & Patterns](#️-stack--patterns) · [Modele de donnees](#️-modele-de-donnees-prisma) · [Gestion d'etat & Cache](#-gestion-detat--cache) · [Systeme de celebration](#-systeme-de-celebration--feedback-visuel) · [Timezone](#-point-de-vigilance-critique--timezone-dates) · [Objectifs de performance](#-objectifs-de-performance) · [Configuration](#-configuration-et-deploiement) · [Contribuer](#-contribuer-au-projet)

---

## 🎯 Vision

**Synapso** est une PWA de reeducation post-AVC conçue pour transformer l'effort quotidien en experience motivante.

**Philosophie** : Chaque interaction doit encourager le patient. L'app ne se contente pas de lister des exercices — elle celebre chaque progres, visualise l'effort accompli, et donne au patient le sentiment tangible de sa progression. L'interface est pensee pour minimiser la charge cognitive et maximiser l'engagement : peu de texte, beaucoup de feedback visuel, des animations fluides qui recompensent l'action.

**Trois piliers** :
1. **Simplicite** — Interface epuree, parcours utilisateur minimal (2 taps pour valider un exercice)
2. **Encouragement** — Confettis, jauges animees, celebrations de paliers, progression visible partout
3. **Accessibilite** — Zones tactiles generiques (44px+), contrastes WCAG AA, support main gauche/droite, dictee vocale

---

## 👥 Utilisateurs cibles

Personnes en reeducation apres un AVC : troubles moteurs possibles, fatigue cognitive, besoin de routine et d'encouragement. Preferences personnalisables : main dominante (gauche/droite), frequence de reinitialisation (quotidienne/hebdomadaire), journal active ou non.

Cas d'usage secondaire : le **kinesitherapeute** qui epingle des notes, valide des exercices, et partage des programmes via le systeme de partage inter-utilisateurs.

---

## 🚀 Fonctionnalites majeures

### Dashboard (`/`)

Page d'accueil a onglets, point d'entree principal de l'app :

- **Onglet Exercices** : Categories avec jauge de progression inline (`CategoryCardWithProgress`), objectif quotidien anime (`DailyGoalProgress` — barre de progression avec effet de lueur au depassement), acces rapide aux archives et aux filtres par equipement.
- **Onglet Epingle** : Vue unifiee des exercices, progres et notes epingles — ce que le kine doit voir en priorite.
- **Onglet Suivi** : Raccourcis vers les pages Progres, Statistiques et Notes.

### Exercices — Le coeur du dynamisme

5 categories a code couleur (Haut du corps / Tronc / Bas du corps / Etirements / Visage), definies dans `exercice.constants.ts`.

**ExerciceCard** : Carte expandable avec :
- Indicateur de completion hebdomadaire (anneau visuel)
- Badge "Fait" pour la completion du jour
- Section expandable (Framer Motion, 150ms) : description, parametres workout, medias
- Lightbox plein ecran pour les photos
- Menu d'actions inline (editer, epingler, partager, archiver)
- Indicateur sablier en mode voyage dans le temps

**Completion** : Toggle via `useCompleteExercice` → creation/suppression d'entree `History` → invalidation du cache → confettis. Support des modes DAILY et WEEKLY.

**Filtres** : Par zone corporelle (`bodyparts`), equipement, statut (fait/a faire/tous). Barre de filtres actifs avec suppression individuelle.

### Systeme de celebration & feedback visuel

Architecture a 3 niveaux de confettis, orchestree par `ConfettiContext` :

| Niveau | Composant | Declencheur | Particules |
|--------|-----------|-------------|------------|
| Micro | `ConfettiValidate` | Validation d'un exercice | 28 (14 mobile), vert emeraude, 1.1s |
| Moyen | `ConfettiExplosion` | Celebration ponctuelle | 18-40, arc-en-ciel, 3.5s |
| Grand | `ConfettiRain` | 5+ exercices dans la journee | Emojis + confettis, cascade du haut, 3.2s |

**Throttling** : 800ms minimum entre confettis basse priorite. Les celebrations globales (`GlobalCelebration`) suppriment les confettis individuels pour eviter la surcharge visuelle.

**Jauge quotidienne** (`DailyGoalProgress`) : Objectif de 5 exercices/jour, barre animee (Framer Motion), changement de couleur au remplissage, compteur bonus avec effet de lueur pulsee au depassement.

### Journal (`/journal`)

Carnet du patient, activable dans les parametres (`hasJournal`) :
- **Auto-sauvegarde** : Sauvegarde 800ms apres la derniere frappe
- **Suppression intelligente** : Note supprimee automatiquement si tous les champs sont vides
- **Validation** : Le kine peut marquer une note comme "validee" pour la date de reference
- **Exercices lies** : Liaison many-to-many avec les exercices (via `ExercicePickerModal`)
- **Dictee vocale** : Saisie par voix via `useSpeechRecognition`

### Historique & Statistiques (`/historique`)

Deux onglets :

**Progres** : Timeline des victoires (`ProgressTimeline`), graphique d'evolution (`ProgressStatsChart`), mode slideshow pour revisiter les progres.

**Statistiques** :
- **Heatmap d'activite** (28 jours) : Grille calendaire cliquable → `DayDetailModal`
- **LineChart d'activite** : Navigation mensuelle, completions par jour
- **DonutChart** : Repartition des zones corporelles travaillees (semaine/mois/tout)
- Tous les graphiques Recharts sont lazy-loaded

### Mode Sablier (Time Machine)

Voyage dans le passe (max 28 jours). Date stockee dans l'URL (`?date=yyyy-MM-dd`), preservee a travers la navigation via `usePreserveDateParam`.

- `SelectedDateContext` : Gere le param URL + etat de transition
- `TimeContext` : Fournit `referenceDateKey` et `referenceDate` a tous les hooks
- **Prefetching** : Prechargement des jours adjacents (prev/next) pour navigation fluide
- **Immersion visuelle** : Bordure indigo + fond cosmique (`TimeMachineWrapper`)
- Tous les hooks envoient `referenceDateKey` comme `targetDate` a l'API

### Partage & Notifications (`/notifications`)

Partage d'exercices entre utilisateurs (kine ↔ patient, patient ↔ proche) :
- Envoi simple ou multiple via `useShareToUser`
- Reception et reponse (accepter/refuser) via `useReceivedShares` / `useRespondToShare`
- Badge de notifications (nombre de partages en attente)

### Auth & Parametres

- **Authentification** : Login/creation avec code invitation, cookie HTTP-only signe HMAC-SHA256
- **Setup initial** : Choix main dominante, rythme de reinitialisation, activation journal
- **Admin** : Impersonation d'utilisateurs (cookie separe), gestion utilisateurs
- **Rate limiting** : 5 tentatives auth/15min, 100 requetes API/min

---

## 🛠️ Stack & Patterns

### Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Framer Motion, Recharts |
| State | TanStack Query 5 + Contextes React (pas de Redux/Zustand) |
| Backend | Next.js API Routes, Prisma 6 (PostgreSQL Neon) |
| Media | Cloudinary (upload, optimisation auto `f_auto,q_auto`) |
| Dates | date-fns 4, "noon UTC trick" |
| Infra | Netlify (serveur UTC), PWA (Service Worker, Manifest) |
| Auth | Cookie HTTP-only signe (HMAC-SHA256), bcrypt |
| Tests | Playwright (E2E), Vitest (unit) |

### Principe Mobile First

Architecture, composants et optimisations pensees pour le mobile : chargement minimal, bundle optimise, lazy loading, animations 60fps, zones de touch genereuses (44px+), requetes et cache optimises. Chaque fonctionnalite doit etre testee sur mobile avant d'etre consideree terminee.

### Structure du projet

```
src/app/
├── (pages)/          # Pages : dashboard, exercice/, exercices/, historique/, settings/, journal/, notifications/
├── api/              # Routes API (wrappers HTTP → features/*/api/)
├── features/         # Par domaine : exercices, historique, progress, home, journal, time-machine, auth, sharing
│   └── [feature]/    # components/, hooks/, api/, utils/, types/, index.ts
├── components/       # Partages : ui/ (design system), NavBar/, BottomNavBar
├── contexts/         # 6 contextes : User, Time, Toast, DayDetailModal, Layout, Confetti
├── providers/        # QueryProvider
├── hooks/            # Hooks globaux : useCelebration, useHandPreference, useSpeechRecognition...
├── lib/              # prisma, auth, api-queries, query-keys, cache, logger
├── constants/        # exercice, card, emoji, equipment, journal, progress, accessibility, ui
├── types/            # Interfaces TypeScript par domaine
└── utils/            # date.utils, resetFrequency.utils, cloudinary.utils, navigation.utils
```

### Navigation

**Desktop** : NavBar sticky horizontale avec dropdown categories, zone utilisateur (badge, notifications, menu), support main dominante (layout inversable).

**Mobile** : BottomNavBar fixe avec :
- Boutons principaux : Accueil → Categories (slide expandable) → **Ajouter** (menu radial anime) → Journal → Suivi
- Menu radial "+" : Exercice (haut-droite), Progres (haut-centre), Note (haut-gauche)
- Slide categories : Expansion depuis la barre pour afficher les categories actives

### Conventions de code

**Composants** :
- Props : toujours `type Props = { ... }`, jamais `interface`
- Export nomme : `export function MyComponent() {}` (pas arrow), sauf pages Next.js
- Server par defaut ; `'use client'` seulement si hooks/evenements/contextes/APIs navigateur

**Hooks** :
- Prefixe `use`, retour **objet** (pas tuple) : `return { data, loading, error }`
- Principaux : useExercices, useCompleteExercice, useCategoryStats, useTodayCompletedCount, useHistory, useProgress, useJournalNotes, usePageFocus, useFocusTrap, useSpeechRecognition

**Styling** :
- Classes conditionnelles : toujours `clsx(...)`
- Couleurs : constantes dans `exercice.constants.ts`, jamais en dur
- Keys : `key={item.id}`, jamais `key={index}`

**Erreurs** :
- Toujours `throw new Error('contexte')`, jamais `return` silencieux
- Erreurs remontent aux `error.tsx`

**Routes API** :
- `route.ts` dans `app/api/[resource]/`, exports nommes GET/POST/PATCH/DELETE
- Toutes appellent `requireAuth(request)` en premier
- Logique metier dans `features/[feature]/api/`, pas dans route.ts

---

## 🗄️ Modele de donnees (Prisma)

Detail complet dans `prisma/schema.prisma`.

| Entite | Champs cles | Role |
|--------|-------------|------|
| **User** | name, role (ADMIN/USER), resetFrequency, dominantHand, hasJournal | Compte patient |
| **Exercice** | name, description, workout*, category (5 types), equipments (JSON), media (JSON), completed, pinned, archived | Definition d'exercice |
| **History** | exerciceId, completedAt | Trace de completion (stats, heatmap, jauges) |
| **Bodypart** | name (unique) | Zone corporelle (M-N avec exercices) |
| **JournalNote** | title, description, date, pinned, validated | Note du patient |
| **JournalNoteExercice** | noteId, exerciceId | Liaison note ↔ exercice |
| **Progress** | content, emoji, tags[], medias[] | Victoire a celebrer |
| **SharedExercice** | exerciceId, senderId, receiverId, status | Partage inter-utilisateurs |

Index de performance : `History(exerciceId, completedAt)` — critique pour les stats et le heatmap.

---

## 🔄 Gestion d'etat & Cache

### Hierarchie des providers (layout.tsx)

```
QueryProvider → UserProvider → ToastProvider → DayDetailModalProvider
  → TimeProvider → ConfettiProvider
    → AuthWrapper → LayoutComposer
```

### TanStack Query — Source de verite serveur

| Donnee | Stale time | GC time | Refetch on focus |
|--------|-----------|---------|-----------------|
| Exercices | 30s | 2min | Non |
| Completed count | 10s | 2min | Non |
| History | 1s | 2min | Non |
| Category stats | 30s | 2min | Non |

**Query keys** : Structure hierarchique dans `lib/query-keys.ts`, incluent toujours `targetDate` et les filtres actifs pour un cache granulaire.

**Invalidation apres completion** :
1. `setQueriesData()` via callback `updateExercice()` (optimistic)
2. `invalidateQueries()` cible : listes exercices du `targetDate` + history + completedCount
3. Evite d'invalider les listes `includeArchived:true` (deja mises a jour)

**Changement d'utilisateur** (admin) : Tous les caches non-user sont purges pour eviter les fuites de donnees.

### Contextes React (6)

| Contexte | Responsabilite |
|----------|---------------|
| `UserContext` | Utilisateur courant + effectif (impersonation), preferences |
| `TimeContext` | Date de reference, date selectionnee (URL `?date=`), mode sablier, prefetching, transitions |
| `ConfettiContext` | Throttling confettis (800ms), coordination celebrations globales |
| `ToastContext` | Notifications toast |
| `DayDetailModalContext` | Etat modal detail jour (heatmap) |
| `LayoutContext` | Navigation, date preservation, overlay categories |

---

## ⚠️ Point de vigilance critique : Timezone (dates)

**Le serveur Netlify tourne en UTC**, les utilisateurs en CET/CEST. Toute date en timezone local peut etre decalee d'un jour en prod.

### Regle d'or : ne JAMAIS envoyer `.toISOString()` pour representer un jour

`.toISOString()` convertit en UTC. Exemple : `2026-02-06` 00:00 CET → `2026-02-05T23:00:00.000Z` → serveur UTC fait `startOfDay` → **5 fevrier = mauvais jour**.

### Client → API : envoyer le dateKey string

```typescript
// ✅ BIEN
fetchExercices({ targetDate: referenceDateKey }); // '2026-02-06'

// ❌ MAL
fetchExercices({ targetDate: dateKeyToISO(referenceDateKey) });
```

### Serveur (API) : parser avec le "noon UTC trick"

```typescript
// ✅ BIEN : midi UTC = meme jour calendaire partout (UTC-12 a UTC+12)
if (/^\d{4}-\d{2}-\d{2}$/.test(targetDateParam)) {
  targetDate = new Date(targetDateParam + 'T12:00:00.000Z');
}

// ❌ MAL
targetDate = startOfDay(new Date(isoString)); // depend du timezone serveur
```

### Utilitaires

| Fonction | Usage | Attention |
|---|---|---|
| `getDateKey(date)` | Date → `'yyyy-MM-dd'` (timezone locale) | Affichage, reference client |
| `getDateKeyUTC(date)` | Date → `'yyyy-MM-dd'` en **UTC** | Comparaisons serveur (completedToday, stats) |
| `getDateFromKey(dateKey)` | dateKey → Date | Sûr |
| `dateKeyToISO(dateKey)` | dateKey → ISO | **Ne pas utiliser pour les appels API** |

**Regle** : Cote serveur et pour tout calcul "ce jour" aligne avec l'API → `getDateKeyUTC`. Cote client pour l'affichage → `getDateKey`.

---

## 🏎️ Objectifs de performance

### Fluidite UI (60fps)

- **React.memo** : ExerciceCard, tous les composants Confetti — prevention des re-renders inutiles
- **Framer Motion** : Animations GPU-accelerees (expansion cartes, jauges, confettis)
- **Dynamic imports** : ConfettiValidate charge a la demande, graphiques Recharts lazy-loaded
- **Particules reduites** : 50% de particules confetti sur mobile

### Reseau & Cache

- **Stale times calibres** : 10-30s selon la criticite (count temps reel vs listes stables)
- **Prefetching** : Jours adjacents precharges en mode sablier (500ms delay)
- **Placeholder data** : Donnees precedentes affichees pendant le refetch (pas de skeleton inutile)
- **Invalidation chirurgicale** : Seuls les caches impactes sont invalides apres mutation

### Base de donnees

- **Index composite** `History(exerciceId, completedAt)` : Critique pour stats et heatmap
- **`findFirst` vs `count`** : Verification d'existence optimisee
- **SQL aggregation** : Stats par categorie via aggregation directe (80-90% reduction transfert)
- **Select minimal** : Seuls les champs necessaires sont requetes

### Bundle

- **Lazy loading** : Graphiques Recharts, composants confetti, modales
- **Cloudinary** : Images optimisees automatiquement (`f_auto,q_auto`)
- **PWA** : Service Worker pour le cache offline

---

## 🔐 Securite

- Cookies signes HMAC-SHA256 (comparaison timing-safe)
- bcrypt 10 rounds pour les mots de passe
- Rate limiting (auth : 5/15min, API : 100/min)
- Prisma (requetes parametrees, pas d'injection SQL)
- Headers securite : HSTS, CSP, X-Frame-Options, Permissions-Policy
- Dummy hash sur utilisateur non trouve (anti timing attack)
- Logging filtre : password, token, secret jamais logges

---

## ♿ Accessibilite et UX

**4 piliers** : Simplicite, Intuitivite, Accessibilite (WCAG AA), Encouragement.

- Zones tactiles ≥ 44px, focus visible, ordre logique
- Contrastes WCAG AA
- `aria-live` regions pour les mises a jour dynamiques (jauges, confettis)
- Support main dominante (layout inversable)
- Dictee vocale (`useSpeechRecognition`) pour la saisie de texte
- Feedback immediat a chaque action

---

## ⚙️ Configuration et deploiement

**Variables** : `DATABASE_URL`, `COOKIE_SECRET`, `CLOUDINARY_*`, `NEXT_PUBLIC_ENVIRONMENT`, optionnel : `INVITATION_CODE`, `ADMIN_NAME`.

**Install** : `npm install` → `.env` → `npm run db:generate` → `npm run db:push` → `npm run dev`.

**Netlify** : Node.js 20, build auto, `@netlify/plugin-nextjs`. Premier deploiement : `npx prisma migrate deploy`.

**PWA** : `public/manifest.json`, `public/sw.js`, installation via navigateur.

---

## 🔄 Flux utilisateur

```
Premier lancement → Auth (login/register + code invitation) → UserSetup (main, rythme, journal)
     ↓
  Dashboard (/)
     ├── Onglet Exercices → Categorie → ExerciceCard → CompleteButton → ✨ Confettis
     ├── Onglet Epingle → Vue kine (exercices + notes + progres epingles)
     ├── Onglet Suivi → Historique, Stats, Journal
     ├── FAB "+" → Exercice / Progres / Note (menu radial)
     └── Mode Sablier → Navigation dans le passe (28 jours max) → Immersion visuelle indigo
```

---

## 🤝 Contribuer au projet

**Commits** : [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): description`. Types : feat, fix, refactor, docs, test, perf. Scope = module (ex. exercices, api).

**Process** : Branche → dev → tests + accessibilite → commit → PR. Checklist : Props `type`, hooks retour objet, `clsx`, keys uniques, `throw new Error`, teste mobile.
