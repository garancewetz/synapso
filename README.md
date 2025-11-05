# Synapso

Application web de gestion et suivi d'exercices de rééducation, développée avec Next.js et Prisma.

## 📋 Description

Synapso est une application de rééducation qui permet de :
- **Gérer des exercices de rééducation** : consulter, ajouter et modifier des exercices avec leurs détails (description, répétitions, séries, durée, équipements)
- **Organiser par parties du corps** : visualiser les exercices groupés par zones musculaires avec un système de couleurs
- **Filtrer les exercices** : par équipement, par statut (complété/à compléter), et par partie du corps
- **Suivre la progression** : marquer les exercices comme complétés et consulter l'historique détaillé
- **Consulter les statistiques** : nombre total d'exercices complétés, activité de la semaine, du mois, et répartition par partie du corps
- **Journal des erreurs d'aphasie** : enregistrer et consulter les erreurs de langage pour se souvenir (citations avec leurs significations)

## 🚀 Fonctionnalités principales

### Page d'accueil - Exercices
- Affichage des exercices organisés par parties du corps
- Navigation rapide vers les différentes sections
- Filtres par équipement et par statut (tous/complétés/à compléter)
- Compteurs en temps réel (total, complétés, à compléter)
- Marquage des exercices comme complétés (réinitialisable chaque jour)
- Actions admin protégées par mot de passe (ajout/modification)

### Page Historique
- Statistiques globales :
  - Total d'exercices complétés
  - Nombre d'exercices complétés cette semaine
  - Nombre d'exercices complétés ce mois
  - Partie du corps la plus travaillée
- Répartition par partie du corps avec compteurs
- Historique détaillé groupé par date avec horaire de réalisation

### Page Aphasie
- Journal des erreurs de langage (erreurs d'aphasie) pour se souvenir
- Liste des citations avec leur signification correcte
- Affichage des dates et commentaires associés
- Tri par date (plus récentes en premier)
- Actions admin protégées par mot de passe (ajout/modification)

## 🛠️ Stack technique

- **Framework** : Next.js 15.5.6 (App Router)
- **Langage** : TypeScript
- **Base de données** : SQLite avec Prisma ORM
- **Styling** : Tailwind CSS 4
- **Animations** : Framer Motion
- **Runtime** : Node.js

## 📦 Installation

### Prérequis
- Node.js 20 ou supérieur
- npm ou yarn

### Étapes

1. **Cloner le repository** (si applicable)

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Créez un fichier `.env` à la racine du projet :
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   EXERCISE_EDIT_PASSWORD="votre_mot_de_passe_admin"
   ```

4. **Initialiser la base de données**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir l'application**
   
   Accédez à [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📜 Scripts disponibles

- `npm run dev` : Lance le serveur de développement avec Turbopack
- `npm run build` : Compile l'application pour la production
- `npm run start` : Lance le serveur de production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run db:studio` : Ouvre Prisma Studio pour visualiser la base de données
- `npm run db:generate` : Génère le client Prisma
- `npm run db:migrate` : Applique les migrations de base de données
- `npm run db:seed` : Initialise la base de données avec des données de test
- `npm run db:reset` : Réinitialise la base de données (supprime toutes les données et réapplique les migrations)
- `npm run db:push` : Pousse les changements du schéma vers la base de données sans migration

## 🗄️ Structure de la base de données

### Modèles Prisma

- **Exercice** : Exercices de rééducation avec description, paramètres d'entraînement, équipements, statut de complétion
- **Bodypart** : Parties du corps avec nom et couleur associée
- **ExerciceBodypart** : Relation many-to-many entre exercices et parties du corps
- **History** : Historique des exercices complétés avec date et heure
- **AphasieItem** : Journal des erreurs d'aphasie (citations avec leur signification correcte, date et commentaire)

## 🔐 Sécurité

Les actions d'administration (ajout et modification d'exercices/items d'aphasie) sont protégées par un système de mot de passe. Le mot de passe est stocké dans la variable d'environnement `EXERCISE_EDIT_PASSWORD`.

## 📁 Structure du projet

```
reedu-calypso/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── seed.ts                 # Script d'initialisation des données
│   └── migrations/             # Migrations de base de données
├── src/
│   ├── app/
│   │   ├── api/                # Routes API (Next.js API Routes)
│   │   ├── components/         # Composants React (atoms, molecules, organisms)
│   │   ├── aphasie/            # Pages pour la gestion d'aphasie
│   │   ├── exercice/           # Pages pour la gestion d'exercices
│   │   ├── historique/         # Page d'historique
│   │   └── page.tsx            # Page d'accueil
│   ├── datas/                  # Fichiers JSON de données initiales
│   ├── lib/                    # Utilitaires (Prisma client)
│   └── utils/                  # Fonctions utilitaires
└── public/                     # Fichiers statiques
```

## 🎨 Architecture des composants

L'application suit une architecture atomique :
- **Atoms** : Composants de base (Button, Tag, Alert, etc.)
- **Molecules** : Composants composites (ExerciceCard, BodyPartsNav)
- **Organisms** : Composants complexes (Sidebar, FiltersExercices, Forms)

## 📝 Notes de développement

- L'application utilise SQLite pour la base de données, ce qui est idéal pour le développement et les déploiements simples
- Les exercices peuvent être complétés chaque jour (réinitialisation automatique)
- Les données initiales sont chargées depuis des fichiers JSON dans `src/datas/`
- Le système de couleurs pour les parties du corps est défini dans le script de seed

## 🚢 Déploiement

Pour déployer en production :
1. Configurez votre base de données (SQLite ou autre base de données supportée par Prisma)
2. Mettez à jour la `DATABASE_URL` dans les variables d'environnement
3. Configurez `EXERCISE_EDIT_PASSWORD` pour la sécurité
4. Exécutez `npm run build` pour compiler l'application
5. Exécutez `npm run start` pour lancer le serveur de production

## 📄 Licence

Ce projet est privé.
