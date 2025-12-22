# Types TypeScript

Ce dossier contient toutes les définitions de types TypeScript partagés dans l'application.

## Structure

- **`exercice.ts`** : Types liés aux exercices, bodyparts, et métadonnées
  - `Bodypart` : Partie du corps
  - `Exercice` : Exercice avec tous ses détails
  - `BodypartWithCount` : Bodypart avec compteur d'exercices
  - `BodypartWithExercices` : Bodypart avec liste d'exercices
  - `BodypartSection` : Section de bodypart pour l'affichage
  - `Metadata` : Métadonnées (bodyparts et équipements disponibles)

- **`aphasie.ts`** : Types pour le journal d'aphasie
  - `AphasieItem` : Item du journal d'aphasie

- **`history.ts`** : Types pour l'historique
  - `HistoryEntry` : Entrée dans l'historique des exercices

- **`menu.ts`** : Types pour la navigation
  - `MenuItem` : Item de menu avec ses propriétés

- **`index.ts`** : Export centralisé de tous les types

## Utilisation

```typescript
import type { Exercice, Bodypart, AphasieItem } from '@/types';
```

Ou importer depuis un fichier spécifique :

```typescript
import type { Exercice } from '@/types/exercice';
```

