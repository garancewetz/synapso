# Context - Synapso

## 📋 Vue d'ensemble

**Synapso** est une application web Progressive Web App (PWA) de rééducation conçue spécifiquement pour des personnes ayant subi un AVC (Accident Vasculaire Cérébral). L'application permet de gérer des exercices physiques de rééducation, de suivre sa progression, de gérer les difficultés d'aphasie (troubles du langage), et de célébrer ses réussites.

### Objectif principal

Offrir un outil numérique **simple, intuitif, accessible et encourageant** pour accompagner les personnes en rééducation post-AVC dans leur parcours de récupération. L'interface est pensée pour minimiser la charge cognitive et maximiser l'encouragement.

---

## 👥 Utilisateurs cibles

### Profil principal
Personnes en rééducation après un AVC, avec possibilité de :
- **Troubles moteurs** : nécessité d'exercices physiques ciblés par zones du corps
- **Troubles du langage (aphasie)** : besoin de suivre les erreurs de langage et de pratiquer des exercices d'orthophonie
- **Préférences individuelles** : main dominante (gauche/droite), fréquence de réinitialisation des exercices (quotidienne/hebdomadaire)

### Besoins spécifiques
- **Simplicité** : Navigation claire, actions évidentes, pas de complexité inutile
- **Intuitivité** : Flux logiques, feedback immédiat, pas de confusion possible
- **Accessibilité** : Navigation au clavier, contrastes élevés, textes lisibles, support des lecteurs d'écran
- **Encouragement** : Feedback positif, célébration des réussites, progression visible, messages motivants

---

## 🛠️ Architecture technique

### Stack technologique

#### Frontend
- **Framework** : Next.js 15.5.9 (App Router)
- **Runtime** : React 19.2.3
- **Langage** : TypeScript 5.7.2
- **Styling** : Tailwind CSS 4.1.18
- **Animations** : Framer Motion 12.23.24
- **Graphiques** : Recharts 3.6.0
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
│       │   ├── aphasie/        # Module aphasie (citations, exercices)
│       │   ├── exercice/       # Gestion des exercices (ajout, édition)
│       │   ├── exercices/      # Vues par catégorie
│       │   ├── historique/     # Suivi de progression et victoires
│       │   └── settings/       # Paramètres utilisateur
│       ├── api/                # Routes API (Next.js API Routes)
│       │   ├── exercices/      # CRUD exercices
│       │   ├── aphasie/        # CRUD citations aphasie
│       │   ├── aphasie-challenges/ # CRUD exercices orthophonie
│       │   ├── progress/       # CRUD progrès
│       │   ├── history/        # Historique des complétions
│       │   ├── users/          # Gestion des utilisateurs
│       │   └── auth/           # Authentification
│       ├── components/         # Composants React
│       │   ├── ui/             # Composants UI réutilisables
│       │   └── historique/     # Composants de visualisation de données
│       ├── contexts/           # Contextes React (état global)
│       │   ├── UserContext.tsx        # Utilisateur courant
│       │   ├── CategoryContext.tsx    # Catégorie active
│       │   └── DayDetailModalContext.tsx # Modal détail du jour
│       ├── hooks/              # Hooks personnalisés
│       ├── types/              # Types TypeScript
│       ├── constants/          # Constantes (couleurs, icônes, etc.)
│       ├── utils/              # Fonctions utilitaires
│       └── lib/                # Bibliothèques (Prisma, Auth)
├── public/                     # Fichiers statiques (PWA assets)
└── scripts/                    # Scripts utilitaires
```

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
  isAphasic      Boolean            @default(false)
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
  
  // Relations
  exercices      Exercice[]
  progress       Progress[]
  aphasieItems   AphasieItem[]
  aphasieChallenges AphasieChallenge[]
}
```

**Particularités** :
- `resetFrequency` : détermine si les exercices se réinitialisent chaque jour ou chaque semaine
- `dominantHand` : inverse automatiquement certains layouts (ex: boutons d'action)
- `isAphasic` : active/désactive le module d'aphasie

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

#### AphasieItem
Citations ou erreurs de langage à retenir (journal d'aphasie).

```prisma
model AphasieItem {
  id        Int      @id @default(autoincrement())
  quote     String   // Ce qui a été dit (erreur)
  meaning   String   // Ce qui était voulu (correction)
  date      String?  // Date de l'incident
  comment   String?  // Commentaire optionnel
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### AphasieChallenge
Exercices d'orthophonie à pratiquer.

```prisma
model AphasieChallenge {
  id        Int      @id @default(autoincrement())
  text      String   // Texte de l'exercice
  mastered  Boolean  @default(false)  // Exercice maîtrisé ou non
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Progress
Progrès et réussites à célébrer.

```prisma
model Progress {
  id        Int      @id @default(autoincrement())
  content   String   // Description du progrès
  emoji     String?  // Emoji catégorie (🦺, 👖, 🧘‍♀️, 👉, 💬)
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Particularités** :
- L'`emoji` permet de catégoriser le progrès (corps/orthophonie)
- Utilisé pour générer des graphiques de progression et une timeline

---

## 🎨 Fonctionnalités principales

### 1. Dashboard (Page d'accueil)

**Route** : `/` (`src/app/(pages)/page.tsx`)

Interface unifiée avec système d'onglets :
- **Corps** : Vue des catégories d'exercices avec progression
- **Aphasie** : Journal d'aphasie et exercices d'orthophonie (si `isAphasic = true`)
- **Parcours** : Accès à l'historique, roadmap (40 derniers jours), et victoires
- **Paramètres** : Configuration utilisateur

**Composants clés** :
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
  - Fait cette semaine : "Fait cette semaine" (vert clair)
  - Mode hebdomadaire avec compteur : "Fait (3× cette semaine)"

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

#### Complétion d'exercice

**Logique** :
1. Clic sur `CompleteButton` → Création d'une entrée `History`
2. Mise à jour de `completed = true` et `completedAt = now()`
3. Si déjà complété → Suppression de l'entrée `History` correspondante
4. Réinitialisation automatique selon `resetFrequency` :
   - `DAILY` : à minuit chaque jour
   - `WEEKLY` : le lundi à minuit chaque semaine

**Hook** : `useExercices` centralise la récupération et la mise à jour

### 3. Module Aphasie (Orthophonie)

Accessible uniquement si `currentUser.isAphasic === true`.

#### Page principale Aphasie

**Route** : `/aphasie` (`src/app/(pages)/aphasie/page.tsx`)

3 sections :
1. **Exercices orthophonie** (`AphasieChallengesList`) : exercices à pratiquer, marquage "maîtrisé"
2. **Citations** (`AphasieItemCard`) : journal des erreurs de langage
3. **Progrès orthophonie** (`ProgressTimeline`) : progrès liés à l'orthophonie

#### Citations (AphasieItem)

**Routes** : `/aphasie/citations`, `/aphasie/add`, `/aphasie/edit/[id]`

**Champs** :
- Citation (ce qui a été dit)
- Signification (ce qui était voulu)
- Date (optionnel)
- Commentaire (optionnel)

**Affichage** : Cartes avec citation en gros, signification en dessous, badge de date

#### Exercices orthophonie (AphasieChallenge)

**Routes** : `/aphasie/exercices`, `/aphasie/exercices/add`, `/aphasie/exercices/edit/[id]`

**Fonctionnalités** :
- Ajout de textes à pratiquer
- Bouton "Marquer maîtrisé" (vert émeraude avec ✨)
- Filtrage maîtrisé/non maîtrisé
- **Création automatique d'un progrès** quand marqué maîtrisé (avec confettis dorés !)

**Composants** :
- `AphasieChallengeCard`
- `AphasieChallengeForm`

#### Reconnaissance vocale

Intégration Web Speech API (`useSpeechRecognition`) :
- Dictée vocale dans les formulaires (bouton micro 🎤)
- Feedback visuel pendant l'écoute (animation, texte rouge)
- Affichage du texte en cours de reconnaissance (`interimTranscript`)

**Utilisation** : Facilite la saisie pour les personnes avec troubles moteurs ou de langage

### 4. Historique et progression

#### Page Historique

**Route** : `/historique` (`src/app/(pages)/historique/page.tsx`)

3 visualisations principales :

##### 1. Heatmap d'activité (ActivityHeatmap)

- 40 derniers jours de progression
- Code couleur par catégorie d'exercice
- Indicateur de progrès (⭐) sur les jours avec progrès
- Série en cours (current streak) : nombre de jours consécutifs avec activité
- **Interactif** : Clic sur un jour → modal avec détail du jour

**Composant** : `ActivityHeatmap` (`src/app/components/historique/ActivityHeatmap.tsx`)

##### 2. Graphique des progrès (ProgressStatsChart)

- Évolution du nombre de progrès au fil du temps
- Graphique en aires empilées (Recharts)
- Distinction progrès physiques / orthophonie (si aphasique)
- Affichage uniquement si ≥2 progrès

**Composant** : `ProgressStatsChart` (`src/app/components/historique/ProgressStatsChart.tsx`)

##### 3. Graphique en donut des zones travaillées (DonutChart)

- Répartition des exercices par partie du corps
- Code couleur par catégorie mère (haut/milieu/bas/étirement)
- Filtre période : Cette semaine / Ce mois-ci / Tout
- Légende interactive (toggle zones)

**Composant** : `DonutChart` (`src/app/components/historique/DonutChart.tsx`)

#### Page Roadmap (40 derniers jours)

**Route** : `/historique/roadmap`

- Vue complète des 40 derniers jours
- Calendrier visuel avec code couleur
- Liste détaillée des exercices par jour (accordéons)

**Composant** : `WeekAccordion`

#### Page Progrès

**Route** : `/historique/victories`

- Timeline de tous les progrès
- Filtre par catégorie (Tout / Corps / Orthophonie)
- Édition/suppression en ligne

**Composant** : `ProgressTimeline`

### 5. Système de progrès et motivation

#### Concept

Les **progrès** sont au cœur de l'aspect motivationnel de l'app. Un progrès peut être :
- Une réussite physique (catégorisée par zone du corps)
- Une réussite d'orthophonie (pour utilisateurs aphasiques)
- Un accomplissement personnel

#### Création de progrès

**Accès** :
- Bouton flottant `ProgressFAB` (présent sur toutes les pages)
- Bouton "Ajouter" dans la section Historique
- Automatique lors du marquage "maîtrisé" d'un exercice orthophonie

**Modal** : `ProgressBottomSheet`

**Interface** :
1. **Tags prédéfinis** : Force, Souplesse, Équilibre, Confort (toggle)
2. **Zone de texte** avec dictée vocale (micro)
3. **Sélection de catégorie** (optionnel) : 4 zones du corps + Orthophonie
4. **Bouton "Noter mon progrès !"** → Création + confettis

**Confettis** :
- Variante "default" : confettis multicolores + emojis variés
- Variante "golden" : confettis dorés + emojis de célébration (🏆⭐🌟✨💫👑)
- Animation Framer Motion de 3.2s avec chute fluide

**Composant** : `ConfettiRain` (`src/app/components/ConfettiRain.tsx`)

#### Affichage des progrès

- **Dashboard** : Dernier progrès + graphique (si ≥2 progrès)
- **Historique** : Graphique d'évolution + timeline complète
- **Aphasie** : Progrès orthophonie uniquement (filtrés par emoji)
- **Heatmap** : Étoile ⭐ sur les jours avec progrès

### 6. Paramètres utilisateur

**Route** : `/settings` (`src/app/(pages)/settings/page.tsx`)

**Options configurables** :
1. **Nom d'utilisateur** : Modification du nom affiché
2. **Main dominante** : Gauche / Droite (inverse certains layouts)
3. **Fréquence de réinitialisation** : Quotidien / Hebdomadaire
4. **Profil aphasique** : Active/désactive le module d'aphasie

**Gestion multi-utilisateurs** :
- Sélection de l'utilisateur actif
- Ajout de nouveaux utilisateurs
- Suppression d'utilisateurs (avec confirmation)

**Composant** : `CreateUserCard` (ajout rapide d'utilisateur)

---

## 🎯 Patterns et conventions de code

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

**API / Data Fetching** :
- `useExercices` : Récupération et mise à jour des exercices
- `useHistory` : Historique de complétion
- `useProgress` : Progrès de l'utilisateur
- `useAphasieItems` : Citations d'aphasie
- `useAphasieChallenges` : Exercices d'orthophonie
- `useCategoryStats` : Stats de progression par catégorie

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
- `useTodayCompletedCount` : Nombre d'exercices faits aujourd'hui

### Gestion d'état (Contexts)

**3 Contexts principaux** :

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

#### 2. CategoryContext

**Responsabilité** : Gestion de la catégorie active (navigation entre catégories)

```typescript
type CategoryContextType = {
  activeCategory: ExerciceCategory | null;
  setActiveCategory: (category: ExerciceCategory | null) => void;
};
```

#### 3. DayDetailModalContext

**Responsabilité** : Gestion de la modal de détail du jour (heatmap interactif)

```typescript
type DayDetailModalContextType = {
  isOpen: boolean;
  selectedDay: HeatmapDay | null;
  openDayDetail: (day: HeatmapDay) => void;
  closeDayDetail: () => void;
};
```

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
- `default` : Carte standard blanche avec ombre légère (utilise `DEFAULT_CARD_STYLES`)
- `elevated` : Ombre accentuée (`shadow-lg`)
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
- `equipment` : Matériel nécessaire gris avec bordure (`bg-gray-100 text-gray-700 border border-gray-200`)

**Props** :
- `variant` : Variante visuelle (`default`, `workout`, `equipment`)
- `icon` : Icône optionnelle affichée avant le texte (ex: "🏋️")
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
- `primary` : Slate foncé (`bg-slate-800`)
- `secondary` : Gris (`bg-gray-200`)
- `danger` : Rouge (`bg-red-600`)
- `action` : Bleu (`bg-blue-600`)
- `danger-outline` : Rouge outline (`border border-red-300`)

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

##### IconButton

**Fichier** : `src/app/components/ui/IconButton.tsx`

Bouton carré avec icône uniquement.

**Styles** :
- Taille : `w-9 h-9` (36x36px)
- Border radius : `rounded-lg`
- Fond : `bg-white` avec bordure
- Hover : `hover:bg-gray-50`
- Active state : Bordure colorée + fond teinté

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
- **Jaune/Or** (`amber`) : Victoires, célébration, items maîtrisés
- **Violet** (`purple`) : Orthophonie, module aphasie

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

**Composant** : `DonutChart` (`src/app/components/historique/DonutChart.tsx`)

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

### VictoryStatsChart (Graphique d'évolution)

**Usage** : Évolution des victoires au fil du temps

**Composant** : `VictoryStatsChart` (`src/app/components/historique/VictoryStatsChart.tsx`)

**Type** : Area Chart (graphique en aires)

**Données** :
- Victoires groupées par mois
- Distinction victoires physiques / orthophonie (aires empilées)

**Particularités** :
- Code couleur : Orange (physique), Jaune (orthophonie)
- Tooltip avec détail par type
- Responsive (s'adapte à la largeur)

### ActivityHeatmap (Calendrier d'activité)

**Usage** : Visualisation des 40 derniers jours

**Composant** : `ActivityHeatmap` (`src/app/components/historique/ActivityHeatmap.tsx`)

**Affichage** :
- Grille de jours avec code couleur par catégorie
- Étoile ⭐ si victoire ce jour-là
- Série en cours (current streak) : compteur de jours consécutifs

**Interactivité** :
- Clic sur un jour → Modal avec détail (`DayDetailModalWrapper`)
- Détail : Liste des exercices faits, victoires du jour

**Particularités** :
- Code couleur par catégorie dominante du jour
- Responsive (s'adapte au nombre de colonnes)

---

## 🔄 Flux utilisateur typiques

### Premier lancement

1. **Accueil** → Modal de mot de passe (`SiteProtection`)
2. Saisie du mot de passe → Cookie HTTP-only créé
3. **Pas d'utilisateur** → Card "Créer un utilisateur" (`CreateUserCard`)
4. Saisie du nom → Création utilisateur par défaut (quotidien, droitier, non aphasique)
5. **Pas d'exercice** → `EmptyState` avec bouton "Créer mon premier exercice"
6. Clic → Formulaire d'ajout d'exercice (`/exercice/add`)
7. Remplissage + Enregistrer → Retour dashboard avec exercice visible

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
5. Sélection de catégorie (zone du corps ou orthophonie) [optionnel]
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

### Gérer son aphasie (si isAphasic)

1. **Dashboard** → Onglet "Aphasie"
2. Page `/aphasie` avec 3 sections :
   - **Exercices orthophonie** : Pratiquer, marquer maîtrisé → Progrès auto + confettis dorés
   - **Citations** : Ajouter/consulter les erreurs de langage
   - **Progrès** : Timeline des progrès orthophonie
3. Ajout d'une citation :
   - Clic "Ajouter une citation"
   - Formulaire : Citation + Signification + Date + Commentaire
   - Enregistrer → Visible dans la liste

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

### Pourquoi la distinction aphasie/physique ?

**Problématique** : Tous les utilisateurs post-AVC n'ont pas d'aphasie. Il ne faut pas encombrer l'interface avec des fonctionnalités non pertinentes.

**Solution** : Module d'aphasie activable/désactivable via `isAphasic`.

**Avantages** :
- Interface adaptée au profil
- Pas de confusion pour les non-aphasiques
- Filtrage automatique des progrès orthophonie
- Séparation claire des exercices physiques / orthophonie

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
   - Tests E2E (Playwright)

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
- `src/app/components/ProgressBottomSheet.tsx` : Modal de création de progrès
- `src/app/components/ConfettiRain.tsx` : Animation de confettis
- `src/app/components/AuthWrapper.tsx` : Protection par mot de passe

#### Hooks importants
- `src/app/hooks/useExercices.ts` : Récupération des exercices
- `src/app/hooks/useProgress.ts` : Récupération des progrès
- `src/app/hooks/usePageFocus.ts` : Gestion du focus (accessibilité)
- `src/app/hooks/useSpeechRecognition.ts` : Reconnaissance vocale

#### Contextes
- `src/app/contexts/UserContext.tsx` : Utilisateur courant
- `src/app/contexts/CategoryContext.tsx` : Catégorie active
- `src/app/contexts/DayDetailModalContext.tsx` : Modal détail du jour

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

**Dernière mise à jour** : 10 janvier 2026  
**Version de l'application** : 0.1.0  
**Auteur du contexte** : Documentation générée par analyse du projet Synapso

