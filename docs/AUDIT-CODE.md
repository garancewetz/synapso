# Audit du code – Synapso

*Rapport synthétique sur la propreté et la logique du code (état actuel).*

---

## Verdict global

**Le code est propre et logique.** L’architecture par features est respectée, les conventions du projet (.cursorrules) sont majoritairement suivies, et la séparation des responsabilités (API / UI / hooks) est claire. Les écarts identifiés sont limités et concernent surtout la taille de certains fichiers et quelques détails d’uniformisation.

---

## 1. Ce qui est bien en place

### Structure

- **Organisation par features** : `auth`, `exercices`, `historique`, `home`, `journal`, `progress`, `sharing`, `time-machine` avec `components/`, `hooks/`, `api/` et barrel `index.ts`.
- **Isolation** : les composants dans `components/` n’importent pas depuis `features/` (règle respectée).
- **API** : routes sous `app/api/`, logique métier dans `features/*/api/` ou `lib/api-queries.ts` ; pas de mélange route ↔ logique.

### Conventions

- **Props** : `type Props = { ... }` partout, pas d’`interface` pour les props.
- **Pages** : `export default function PageName()`.
- **Composants de feature** : exports nommés via les index.
- **Hooks** : préfixe `use`, retour en objet (`return { data, loading, ... }`).
- **Erreurs** : `throw new Error('contexte')` dans les API et la lib, peu de retours silencieux.

### Qualité

- **Query keys** : centralisées dans `lib/query-keys.ts`, hiérarchie claire (all / lists / list avec params), utilisées dans les hooks et `api-queries.ts`.
- **`api-queries.ts`** : fonctions de fetch bien découpées, types locaux quand suffisant, gestion d’erreur cohérente. `fetchUser` retourne une réponse “non authentifié” au lieu de throw quand l’API échoue, intention documentée par un commentaire.
- **Pas de dépendances** : `components/` → `features/` absent, pas de cycles évidents.

---

## 2. Écarts et points à améliorer

### Fichiers > 250 lignes (.cursorrules)

À terme, envisager de découper ou extraire des sous-composants / utils :

| Fichier | Lignes (approx.) |
|--------|-------------------|
| `ActivityLineChart.tsx` | ~457 |
| `ProgressBottomSheet.tsx` | ~430 |
| `HistoriquePageClient.tsx` | ~389 |
| `Lightbox.tsx` | ~382 |
| `UserContext.tsx` | ~362 |
| `AuthScreen.tsx` | ~358 |
| `exercice.constants.ts` | ~337 |
| `EquipmentsPageClient.tsx` | ~320 |
| `NavBar.tsx` | ~317 |
| … (autres entre 250 et 305) | |

### Détails d’uniformisation

- **Clsx** : la règle impose clsx pour les classes conditionnelles ; quelques composants utilisent encore des ternaires inline pour `className` (ex. `DonutChart`, `ProgressCard`, `ActionButton`, `BaseFilterBadge`). À migrer vers clsx si on veut une règle stricte.
- **Imports** : dans `HistoriquePageClient.tsx`, la plupart des imports viennent de `@/app/features/historique`, mais `HistoriqueStatistiquesSection` et `HistoriqueProgresSection` sont importés depuis `@/app/features/historique/components/...`. Mieux : tout faire passer par le barrel `@/app/features/historique` pour cohérence.
- **Keys dans les map** : si des `key={index}` ou `key={i}` existent (squelettes, listes sans id), les remplacer par une clé stable dès qu’un identifiant ou une combinaison unique est disponible.

### Préfixes par feature

- **historique** : préfixes par domaine (Activity, Progress, Week, Day, Stats) plutôt que par nom de feature (Historique). Cohérent en interne ; si on veut une règle stricte “préfixe = nom de la feature”, à aligner progressivement.

---

## 3. Synthèse

| Critère | État |
|--------|------|
| Structure / features | ✅ Propre et logique |
| Conventions (Props, hooks, erreurs) | ✅ Bien respectées |
| Query keys / API layer | ✅ Centralisé et clair |
| Taille des fichiers | ⚠️ Plusieurs > 250 lignes |
| Clsx / imports / keys | ⚠️ Quelques écarts mineurs |

**Conclusion** : le code est propre, logique et maintenable. Les améliorations suggérées sont des affinements (taille de fichiers, uniformisation clsx/imports/keys, préfixes) et peuvent être traités par étapes sans blocage.
