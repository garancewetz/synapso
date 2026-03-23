# Synapso

Application web de reeducation post-AVC concu pour aider les patients a suivre leurs exercices quotidiens, visualiser leur progression et rester motives tout au long de leur parcours de reeducation.

<!-- Decommenter et ajouter un screenshot quand disponible :
![Apercu de Synapso](docs/screenshot-home.png)
-->

## Pourquoi ce projet ?

Apres un AVC, la reeducation est un processus long et exigeant. Les patients doivent effectuer des exercices quotidiens, souvent sans visibilite sur leur progression. Synapso repond a ce besoin avec une interface simple, encourageante et adaptee aux contraintes motrices et cognitives.

## Fonctionnalites

- **Exercices par categories** — parcours structures (motricite fine, equilibre, cognition...) avec validation quotidienne
- **Historique visuel** — heatmap d'activite, graphiques de progression et statistiques par periode
- **Journal personnel** — prise de notes libres pour suivre le ressenti au fil des jours
- **Mode sablier** — voyage dans le temps pour consulter ou completer les jours passes (jusqu'a 28 jours)
- **Partage de progression** — generation d'un resume partageable avec son entourage ou son kinesitherapeute
- **PWA** — installable sur mobile, pensee mobile-first

## Demo

> Lien de demo a venir.

## Stack technique

| Categorie | Technologies |
|-----------|-------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| State | TanStack Query v5, React Context |
| Base de donnees | PostgreSQL, Prisma 6 |
| Tests | Vitest (unit), Playwright (E2E) |
| Deploiement | Netlify |
| Monitoring | Web Vitals |
| Media | Cloudinary |

## Installation

### Prerequis

- Node.js 20+
- npm 10+
- PostgreSQL

### Setup local

```bash
# 1. Cloner le repo
git clone https://github.com/garancewetz/synapso.git
cd synapso

# 2. Installer les dependances
npm install

# 3. Configurer l'environnement
cp ENV.example .env
# Renseigner les variables dans .env (voir ENV.example pour le detail)

# 4. Initialiser la base de donnees
npm run db:generate
npm run db:push
npm run db:seed

# 5. Lancer le serveur de developpement
npm run dev
```

L'application est accessible sur [http://localhost:3003](http://localhost:3003).

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de developpement (Turbopack) |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | Verification ESLint |
| `npm run test:run` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests end-to-end (Playwright) |
| `npm run db:generate` | Generation du client Prisma |
| `npm run db:push` | Synchronisation du schema |
| `npm run db:seed` | Donnees de demonstration |

## Architecture

```
src/app/
  (pages)/          # Routes UI (App Router)
  api/              # Routes API REST
  features/         # Logique metier par domaine
    exercices/      #   hooks, composants, API calls
    historique/     #   statistiques et timeline
    journal/        #   notes personnelles
    progress/       #   suivi de progression
    time-machine/   #   mode sablier
  components/       # Composants partages et UI
  contexts/         # Contextes React (Time, SelectedDate)
  hooks/            # Hooks transverses
  lib/              # Infrastructure (auth, prisma, logger)
  utils/            # Utilitaires (dates, partage)
prisma/             # Schema et seed
tests/              # Unit + E2E
```

## Defis techniques

- **Gestion des timezones** — Le serveur (Netlify) tourne en UTC tandis que les utilisateurs sont en CET/CEST. Toutes les dates transitent sous forme de `dateKey` (`yyyy-MM-dd`) et sont parsees cote serveur avec le "noon UTC trick" pour eviter les decalages d'un jour.
- **Mobile-first** — Interface optimisee pour des utilisateurs aux capacites motrices reduites : zones de tap larges, animations douces, navigation simplifiee.
- **Architecture par features** — Chaque domaine metier (exercices, historique, journal) est isole avec ses propres hooks, composants et appels API, facilitant la maintenance et l'evolution.

## Securite

- Aucun secret commite dans le repository
- Mots de passe haches avec bcrypt
- Cookies signes (HMAC-SHA256) avec comparaison timing-safe
- Headers de securite (CSP, HSTS, X-Frame-Options)
- Rate limiting (Upstash Redis)
- Validation des entrees avec Zod

## Auteur

**Garance Wetzel** — Developpeur Front-end

- GitHub : [@garancewetz](https://github.com/garancewetz)

## Licence

MIT
