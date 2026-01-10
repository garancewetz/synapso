# Migration : Victoire → Progrès

## ✅ Terminé

### 1. Base de données (Prisma)
- ✅ Model `Victory` → `Progress` dans `prisma/schema.prisma`
- ✅ Relation `User.victories` → `User.progress`

### 2. Types TypeScript
- ✅ `src/app/types/victory.ts` → `src/app/types/progress.ts`
- ✅ `Victory` → `Progress`
- ✅ `VictoryInput` → `ProgressInput`
- ✅ Export mis à jour dans `src/app/types/index.ts`

### 3. Constantes
- ✅ `src/app/constants/victory.constants.ts` → `src/app/constants/progress.constants.ts`
- ✅ Toutes les constantes `VICTORY_*` → `PROGRESS_*`
- ✅ `src/app/constants/emoji.constants.ts` mis à jour :
  - `VICTORY_EMOJIS` → `PROGRESS_EMOJIS`
  - `ORTHOPHONIE_VICTORY_EMOJI` → `ORTHOPHONIE_PROGRESS_EMOJI`

### 4. Utilitaires
- ✅ `src/app/utils/victory.utils.ts` → `src/app/utils/progress.utils.ts`
- ✅ Toutes les fonctions et exports mis à jour

### 5. Routes API
- ✅ `src/app/api/victories/` → `src/app/api/progress/`
- ✅ `route.ts` et `[id]/route.ts` créés avec `prisma.progress`

### 6. Hooks
- ✅ `useVictories.ts` → `useProgress.ts`
- ✅ `useVictoryStats.ts` → `useProgressStats.ts`
- ✅ `useVictoryBadges.ts` → `useProgressBadges.ts`
- ✅ `useVictoryModal.ts` → `useProgressModal.ts`
- ✅ `useOrthophonieVictories.ts` → `useOrthophonieProgress.ts`

### 7. Composants
- ✅ `VictoryBottomSheet.tsx` → `ProgressBottomSheet.tsx`
- ✅ `VictoryButton.tsx` → `ProgressButton.tsx`
- ✅ `VictoryFAB.tsx` → `ProgressFAB.tsx`
- ✅ `ViewVictoriesButton.tsx` → `ViewProgressButton.tsx`
- ✅ Composants historique :
  - `VictoryCard.tsx` → `ProgressCard.tsx`
  - `VictoryCardCompact.tsx` → `ProgressCardCompact.tsx`
  - `VictoryTimeline.tsx` → `ProgressTimeline.tsx`
  - `VictoryTimelineEmpty.tsx` → `ProgressTimelineEmpty.tsx`
  - `VictoryStatsChart.tsx` → `ProgressStatsChart.tsx`
- ✅ Exports mis à jour dans :
  - `src/app/components/index.tsx`
  - `src/app/components/historique/index.tsx`

## 🔧 À faire manuellement

### 8. Migration de la base de données

#### Option A : Migration Prisma (recommandé pour production)
```bash
cd /Users/garance.wetzel/Documents/dev/synapso
npx prisma migrate dev --name rename-victory-to-progress
```

#### Option B : Push direct (développement uniquement)
```bash
npx prisma db push
```

#### Option C : Migration SQL manuelle (si problèmes)
```sql
ALTER TABLE "Victory" RENAME TO "Progress";
```

### 9. Générer le client Prisma
```bash
npx prisma generate
```

### 10. Mettre à jour les pages

Les fichiers suivants doivent être mis à jour pour remplacer les imports et usages :

#### Pages principales
- `src/app/(pages)/page.tsx`
- `src/app/(pages)/historique/page.tsx`
- `src/app/(pages)/historique/victories/page.tsx` (renommer en `progress` ?)
- `src/app/(pages)/historique/roadmap/page.tsx`
- `src/app/(pages)/aphasie/page.tsx`
- `src/app/(pages)/exercices/[category]/page.tsx`

#### Composants
- `src/app/components/historique/DayDetailModal.tsx`
- `src/app/components/historique/WeekAccordionNew.tsx`

#### Utilitaires
- `src/app/utils/historique.utils.ts`
- `src/app/utils/date.utils.ts` (si utilisé)

#### Constantes
- `src/app/constants/card.constants.ts`
- `src/app/constants/sitemap.constants.ts`
- `src/app/constants/historique.constants.ts`

### Patterns de remplacement global

#### Imports
```typescript
// Avant
import { useVictories } from '@/app/hooks/useVictories';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { useVictoryStats } from '@/app/hooks/useVictoryStats';
import { useOrthophonieVictories } from '@/app/hooks/useOrthophonieVictories';
import { VictoryCard, VictoryTimeline } from '@/app/components/historique';
import { VictoryFAB, VictoryBottomSheet } from '@/app/components';

// Après
import { useProgress } from '@/app/hooks/useProgress';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useProgressStats } from '@/app/hooks/useProgressStats';
import { useOrthophonieProgress } from '@/app/hooks/useOrthophonieProgress';
import { ProgressCard, ProgressTimeline } from '@/app/components/historique';
import { ProgressFAB, ProgressBottomSheet } from '@/app/components';
```

#### Variables
```typescript
// Avant
const victoryModal = useVictoryModal();
const { victories, refetch: refetchVictories } = useVictories();
const { lastVictory } = useVictories();

// Après
const progressModal = useProgressModal();
const { progressList, refetch: refetchProgress } = useProgress();
const { lastProgress } = useProgress();
```

#### Composants JSX
```typescript
// Avant
<VictoryFAB onSuccess={handleSuccess} />
<VictoryBottomSheet isOpen={isOpen} ... />
<VictoryTimeline victories={victories} onEdit={...} />

// Après
<ProgressFAB onSuccess={handleSuccess} />
<ProgressBottomSheet isOpen={isOpen} ... />
<ProgressTimeline progressList={progressList} onEdit={...} />
```

#### Textes UI (français)
- "Victoire" → "Progrès"
- "victoire" → "progrès"
- "Victoires" → "Progrès"
- "victoires" → "progrès"
- "Ma victoire" → "Mon progrès"
- "Mes victoires" → "Mes progrès"
- "Noter une victoire" → "Noter un progrès"
- "Célébrer !" → "Noter !"
- "Réussite" → "Progrès"
- "réussite" → "progrès"
- "Réussites" → "Progrès"
- "réussites" → "progrès"

### 11. Routes à potentiellement renommer

- `/historique/victories` → `/historique/progress` ?
  - Si renommé, mettre à jour :
    - `src/app/(pages)/historique/victories/` → `progress/`
    - Tous les liens `href="/historique/victories"`
    - Navigation

### 12. Supprimer les anciens fichiers

Une fois la migration terminée et testée :

```bash
# Types
rm src/app/types/victory.ts

# Constantes
rm src/app/constants/victory.constants.ts

# Utilitaires
rm src/app/utils/victory.utils.ts

# Routes API
rm -rf src/app/api/victories/

# Hooks
rm src/app/hooks/useVictories.ts
rm src/app/hooks/useVictoryStats.ts
rm src/app/hooks/useVictoryBadges.ts
rm src/app/hooks/useVictoryModal.ts
rm src/app/hooks/useOrthophonieVictories.ts

# Composants
rm src/app/components/VictoryBottomSheet.tsx
rm src/app/components/VictoryButton.tsx
rm src/app/components/VictoryFAB.tsx
rm src/app/components/ViewVictoriesButton.tsx
rm src/app/components/historique/VictoryCard.tsx
rm src/app/components/historique/VictoryCardCompact.tsx
rm src/app/components/historique/VictoryTimeline.tsx
rm src/app/components/historique/VictoryTimelineEmpty.tsx
rm src/app/components/historique/VictoryStatsChart.tsx
```

## 🧪 Tests à effectuer

Après migration complète :

1. ✅ Schéma Prisma valide (`npx prisma validate`)
2. ✅ Client Prisma généré (`npx prisma generate`)
3. ✅ Migration appliquée
4. ⏸️ App compile (`npm run build`)
5. ⏸️ Aucune erreur TypeScript
6. ⏸️ Routes API `/api/progress` fonctionnelles
7. ⏸️ CRUD complet des progrès (créer, lire, modifier, supprimer)
8. ⏸️ Affichage de la timeline des progrès
9. ⏸️ Graphique des progrès
10. ⏸️ Modal de création/édition
11. ⏸️ Confettis lors de la création
12. ⏸️ Filtrage progrès physiques / orthophonie
13. ⏸️ Heatmap avec étoiles de progrès
14. ⏸️ Bouton flottant (FAB) fonctionne

## 📝 Commit suggéré

```bash
git add .
git commit -m "refactor(domain)!: remplacer victoires par progrès

BREAKING CHANGE: Le concept de \"victoire\" est remplacé par \"progrès\" 
dans toute l'application pour une terminologie plus simple et authentique.

- Rename: Victory model → Progress model (Prisma)
- Rename: /api/victories → /api/progress
- Rename: All Victory* components → Progress* components
- Rename: All useVictory* hooks → useProgress* hooks
- Update: All UI texts from \"victoire\" to \"progrès\"
- Update: Documentation (context.md)
- Update: Constants, utils, types

Les données existantes sont préservées grâce à la migration Prisma."
```

## ⚠️ Notes importantes

1. **Sauvegarde** : Faire un backup de la base de données avant la migration
2. **Production** : Appliquer la migration en production avec `npx prisma migrate deploy`
3. **Rollback** : En cas de problème, renommer `Progress` → `Victory` dans le schéma et re-migrer
4. **URLs** : Décider si `/historique/victories` devient `/historique/progress` (breaking change)
5. **Anciens fichiers** : Ne les supprimer qu'une fois tous les tests passés

