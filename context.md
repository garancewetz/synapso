# Context - Synapso

**Dernière mise à jour du contexte** : 2 mars 2025

### À lire en priorité

- **Timezone** : Ne jamais envoyer `.toISOString()` pour représenter un jour ; utiliser le `dateKey` (`yyyy-MM-dd`) côté client et le "noon UTC trick" côté serveur. Voir [Point de vigilance critique : Timezone (dates)](#-point-de-vigilance-critique--timezone-dates).
- **Mobile first** : Performance et fluidité mobile sont la priorité ; chaque fonctionnalité doit être testée sur mobile. Voir [Principe Mobile First](#principe-mobile-first).
- **Structure** : Code organisé par features ; conventions (Props, hooks, erreurs) dans [Patterns et conventions de code](#-patterns-et-conventions-de-code).

### Sommaire

- [Vue d'ensemble](#-vue-densemble) · [Architecture technique](#️-architecture-technique) · [Modèle de données](#️-modèle-de-données-prisma) · [Fonctionnalités et routes](#-fonctionnalités-et-routes) · [Patterns et conventions](#-patterns-et-conventions-de-code) · [Timezone](#-point-de-vigilance-critique--timezone-dates) · [Accessibilité](#-accessibilité-et-ux) · [Configuration](#-configuration-et-déploiement) · [Ressources](#-ressources-et-documentation) · [Contribuer](#-contribuer-au-projet) · [Styleguide et modifs](#-styleguide)

---

## 📋 Vue d'ensemble

**Synapso** est une PWA de rééducation pour personnes post-AVC : exercices physiques, suivi de progression, célébration des réussites.

**Objectif** : Outil **simple, intuitif, accessible et encourageant**. Interface pensée pour minimiser la charge cognitive et maximiser l'encouragement.

**Mobile first** : Expérience mobile prioritaire (performance, fluidité 60fps, réactivité tactile, bundle optimisé). Voir [Principe Mobile First](#principe-mobile-first) pour les implications détaillées.

---

## 👥 Utilisateurs cibles

Personnes en rééducation après un AVC : troubles moteurs possibles, préférences (main dominante, réinitialisation quotidienne/hebdomadaire). Besoins : **simplicité**, **intuitivité**, **accessibilité** (WCAG, clavier, contrastes, lecteurs d'écran), **encouragement** (feedback positif, célébration, progression visible).

---

## 🛠️ Architecture technique

### Principe Mobile First

Architecture, composants et optimisations pensés pour le mobile : chargement minimal, bundle optimisé, lazy loading, animations 60fps, zones de touch généreuses, requêtes et cache optimisés, pas de fuites mémoire. Chaque fonctionnalité doit être testée sur mobile avant d'être considérée terminée.

### Stack

- **Frontend** : Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Recharts, TanStack Query 5, clsx, date-fns 4
- **Backend** : PostgreSQL (Neon), Prisma 6, Next.js API Routes
- **Infra** : Netlify, PWA (Service Worker, Manifest), auth par cookie HTTP-only

### Structure du projet

```
src/app/
├── (pages)/          # Pages : page.tsx (dashboard), exercice/, exercices/, historique/, settings/, journal/
├── api/              # Routes API (wrappers HTTP qui appellent features/*/api/)
├── features/         # Par domaine : exercices, historique, progress, home, journal, time-machine, auth
│   └── [feature]/    # components/, hooks/, api/, utils/, index.ts
├── components/        # Partagés (ui/, NavBar, BottomNavBar…)
├── contexts/         # UserContext, ToastContext, DayDetailModalContext, SelectedDateContext, TimeContext
├── providers/        # QueryProvider
├── lib/              # prisma, auth, api-queries
├── constants/        # exercice.constants, card.constants, emoji.constants
└── utils/
```

**Organisation par features** : Chaque feature regroupe composants, hooks, api (logique métier), utils. Les routes dans `app/api/` délèguent à `features/[feature]/api/`. Composants réutilisables dans `components/`.

---

## 🗄️ Modèle de données (Prisma)

Détail complet dans `prisma/schema.prisma`.

- **User** : name, resetFrequency (DAILY|WEEKLY), dominantHand (LEFT|RIGHT), hasJournal
- **Exercice** : name, description, workoutRepeat/Series/Duration, equipments (JSON), category (UPPER_BODY|CORE|LOWER_BODY|STRETCHING), completed/completedAt, pinned, userId ; relations bodyparts (M-N), history
- **Bodypart** : name (unique), lien M-N avec exercices
- **History** : exerciceId, completedAt — historique des complétions (stats, heatmap)
- **JournalNote** : title, description, date?, pinned (pour le kiné), validated, userId
- **Progress** : content, emoji, tags, medias[], userId — progrès/victoires à célébrer

---

## 🎨 Fonctionnalités et routes

- **Dashboard** `/` : Onglets Exercices, Kiné (éléments épinglés), Suivi ; ProgressFAB, CategoryCardWithProgress.
- **Exercices** : 4 catégories (haut/milieu/bas/étirement), code couleur dans `exercice.constants.ts`. `/exercices/[category]` (ExerciceCard, CompleteButton, filtres état + bodyparts/équipement), `/exercices/equipments` (filtre par équipements). Complétion → History, réinitialisation selon resetFrequency. **Mode sablier** : date dans URL `?date=yyyy-MM-dd`, max 28 jours en arrière ; SelectedDateContext, TimeContext, bannière indigo.
- **Journal** `/journal` (si hasJournal) : notes (titre, description, date), épingle "pour le kiné", validation, partage. JournalNoteCard, useJournalNotes.
- **Historique** `/historique` : heatmap 40 jours, BarChart, DonutChart, ProgressStatsChart, ActivityLineChart ; DayDetailModal au clic sur un jour.
- **Progrès** : ProgressFAB partout, ProgressBottomSheet (tags, texte, médias, catégorie), ConfettiRain. Timeline sur /historique/victories.
- **Auth** : AuthScreen (login/création avec code invitation), UserSetup après inscription (main dominante, rythme, journal). requireAuth() sur toutes les API.
- **Paramètres** `/settings` : nom, main dominante, fréquence réinitialisation, journal, mot de passe ; gestion multi-utilisateurs.

---

## 🎯 Patterns et conventions de code

### Architecture conditionnée par User et Date

Affichage = f(User, Date). **UserContext** détermine les données et préférences ; **TimeContext** fournit `referenceDate` / `referenceDateKey`. Les hooks (useExercices, useCategoryStats, etc.) utilisent `referenceDateKey` pour les appels API. Jamais `dateKeyToISO()` pour les API.

### ⚠️ Point de vigilance critique : Timezone (dates)

**Le serveur Netlify tourne en UTC**, les utilisateurs en CET/CEST. Toute date en timezone local peut être décalée d'un jour en prod.

#### Règle d'or : ne JAMAIS envoyer `.toISOString()` pour représenter un jour

`.toISOString()` convertit en UTC. Exemple : `2026-02-06` 00:00 CET → `2026-02-05T23:00:00.000Z` → sur serveur UTC, `startOfDay` donne le 5 → **mauvais jour**.

#### Client → API : envoyer le dateKey string

```typescript
// ✅ BIEN
fetchExercices({ targetDate: referenceDateKey }); // '2026-02-06'

// ❌ MAL
fetchExercices({ targetDate: dateKeyToISO(referenceDateKey) });
```

#### Serveur (API) : parser avec le "noon UTC trick"

```typescript
// ✅ BIEN : midi UTC = même jour calendaire partout
if (/^\d{4}-\d{2}-\d{2}$/.test(targetDateParam)) {
  targetDate = new Date(targetDateParam + 'T12:00:00.000Z');
}

// ❌ MAL
targetDate = startOfDay(new Date(isoString)); // dépend du timezone serveur
```

#### Utilitaires

| Fonction | Usage | Attention |
|---|---|---|
| `getDateKey(date)` | Date → `'yyyy-MM-dd'` (timezone locale) | Affichage, référence client |
| `getDateKeyUTC(date)` | Date → `'yyyy-MM-dd'` en **UTC** | Comparaisons avec le serveur (completedToday, stats, modal détail) ; côté serveur pour tout calcul de "jour" |
| `getDateFromKey(dateKey)` | dateKey → Date | ✅ Sûr |
| `dateKeyToISO(dateKey)` | dateKey → ISO | ⚠️ **Ne pas utiliser pour les appels API** |
| `format(date, 'yyyy-MM-dd')` | Extraction jour | ✅ Sûr si date à midi UTC côté serveur |

**Règle** : Côté serveur et pour tout calcul "ce jour" aligné avec l’API (cartes, objectif, stats), utiliser **getDateKeyUTC**. Côté client pour l’affichage ou la date de référence utilisateur, utiliser getDateKey (locale).

### Composants React

- **Props** : Toujours `type Props = { ... }`, jamais `interface`. Avec children : `PropsWithChildren<{ ... }>`.
- **Composants** : `export function MyComponent() {}` (pas arrow), PascalCase. Export nommé sauf pages Next.js (page.tsx, layout.tsx, route.ts).
- **Client vs Server** : Server par défaut ; `'use client'` seulement si hooks, événements, contextes ou APIs navigateur.

### Hooks

- Préfixe `use`, retour **objet** (pas tuple) : `return { data, loading, error }`.
- Principaux : useExercices, useHistory, useProgress, useCategoryStats, useTodayCompletedCount, useCompleteExercice, useJournalNotes, useJournalCheck, useProgressModal, usePageFocus, useFocusTrap, useSpeechRecognition, useDayDetailData.

### Gestion d'état

- **TanStack Query** : QueryProvider dans layout, query keys et fetch dans `lib/api-queries.ts`, optimistic updates dans useCompleteExercice.
- **Contexts** (5) : UserContext (utilisateur courant, localStorage), ToastContext (toasts), DayDetailModalContext (modal détail jour), SelectedDateContext (date sablier, URL), TimeContext (referenceDate, préchargement). Les hooks API utilisent `referenceDateKey` (string), jamais `dateKeyToISO()`.

### Styling (Tailwind)

- **Classes conditionnelles** : Toujours `clsx(...)`.
- **Couleurs** : Constantes dans `exercice.constants.ts` (catégories), `card.constants.ts`, `emoji.constants.ts`. Pas de couleurs en dur.
- **Keys** : `key={item.id}` ou propriété unique ; éviter `key={index}`.

### Gestion des erreurs

Toujours `throw new Error('contexte')` pour les validations, jamais `return`. Les erreurs remontent aux `error.tsx` ; pas de silence d'erreur.

### Routes API

Fichier `route.ts` dans `app/api/[resource]/`. Exports nommés GET, POST, PATCH, DELETE. Toutes les routes appellent `requireAuth(request)` en premier (cookie `synapso_auth`). Login : `/api/auth/password` (POST, SITE_PASSWORD). Logique métier dans `features/[feature]/api/`, pas dans route.ts.

---

## ♿ Accessibilité et UX

**4 piliers** (.cursorrules) : Simplicité, Intuitivité, Accessibilité (WCAG, clavier, contrastes, lecteurs d'écran), Encouragement. Mobile first : performance, fluidité, test mobile obligatoire.

**Design system** : Composants UI dans `src/app/components/ui/` (BaseCard, Card, Badge, Button, etc.). Constantes : `exercice.constants.ts`, `card.constants.ts`. Route **/styleguide** pour la doc visuelle ; détails dans `AUDIT_STYLEGUIDE.md`.

Navigation : zones tactiles ≥ 44px, focus visible, ordre logique. Contrastes et lisibilité : WCAG AA. Feedback immédiat, messages encourageants.

---

## 🚀 Configuration et déploiement

**Variables** (voir `ENV.example`) : `DATABASE_URL`, `SITE_PASSWORD`, `NEXT_PUBLIC_ENVIRONMENT`, `NEXT_PUBLIC_SITE_URL`.

**Install** : `npm install` → copier `.env` → `npm run db:generate` → `npm run db:push` → `npm run db:seed` (optionnel) → `npm run dev`.

**Scripts** : `dev`, `build`, `start`, `lint` ; `db:studio`, `db:generate`, `db:push`, `db:migrate`, `db:seed`, `db:reset`, `db:backup`, `db:import` ; `db:migrate:deploy` (prod) ; `pwa:icons`.

**Netlify** : Connexion repo, variables d'env, build auto. Premier déploiement : `npx prisma migrate deploy`. Config dans `netlify.toml` avec `@netlify/plugin-nextjs`.

**PWA** : `public/manifest.json`, `public/sw.js`, icônes. Installation via navigateur ou "Ajouter à l'écran d'accueil".

---

## 📊 Visualisations (Recharts)

DonutChart (zones travaillées), ProgressStatsChart (évolution progrès), ActivityLineChart (activité), BarChart (régularité), ActivityHeatmap (40 jours, cliquable). Composants dans `features/historique/components/`.

---

## 🔄 Flux utilisateur

Premier lancement → Auth / UserSetup → Dashboard. Faire un exercice : catégorie → CompleteButton → confettis. Noter un progrès : ProgressFAB → ProgressBottomSheet. Consulter progression : Historique, heatmap, graphiques. Journal (si activé) : notes, épingle pour le kiné.

---

## 📚 Ressources et documentation

**Externe** : Next.js, React, Prisma, Tailwind, Recharts, Framer Motion, WCAG 2.1 (liens standards).

**Interne** : README.md, ENV.example, .cursorrules, prisma/schema.prisma, src/app/constants/.

**Fichiers clés** : layout.tsx, (pages)/page.tsx, lib/prisma.ts, lib/auth.ts, lib/api-queries.ts ; components/ui/ ; features/exercices/hooks/useExercices.ts, useCompleteExercice.ts ; features/progress, journal, historique (hooks + api) ; contexts/*.tsx ; providers/QueryProvider.tsx.

---

## 🤝 Contribuer au projet

**Commits** : [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): description`. Types : feat, fix, refactor, docs, test, perf, build, ci. Scope = module (ex. exercices, api). Ex. : `feat(exercices): add weekly reset`.

**Process** : Branche → dev (conventions .cursorrules) → tests / accessibilité → commit → PR. Checklist : Props en `type`, hooks retour objet, `clsx`, keys uniques, `throw new Error`, testé mobile.
