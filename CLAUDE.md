# Synapso - Contexte Projet

Application Next.js (TypeScript) de rééducation post-AVC déployée sur Netlify.

## Architecture

- **Framework** : Next.js 16 + React 19 + TanStack Query v5
- **Base de données** : Prisma (PostgreSQL)
- **Dates** : date-fns 4
- **State** : Pas de Redux/Zustand — tout passe par React Query + contextes React
- **Déploiement** : Netlify (serveur en UTC)

## Structure par features

```
src/app/
├── features/exercices/     # Exercices et stats (useCategoryStats, useExercices...)
├── features/historique/    # Historique et timeline (useHistory, useDayData...)
├── features/time-machine/  # Mode sablier (voyage dans le temps)
├── contexts/               # TimeContext (date de référence), SelectedDateContext (URL)
├── api/                    # Routes API Next.js
└── utils/date.utils.ts     # Utilitaires de date
```

## POINT DE VIGILANCE CRITIQUE : Timezone (dates)

### Le problème
Le serveur Netlify tourne en **UTC** (timezoneOffset = 0), tandis que les utilisateurs sont en **CET/CEST** (UTC+1/+2). Toute manipulation de date qui dépend du timezone local peut donner un résultat décalé d'un jour en production.

### Règle d'or : ne JAMAIS envoyer de `.toISOString()` pour représenter un jour

`.toISOString()` convertit toujours en UTC. Exemple :
```
6 février 00:00 CET → .toISOString() → "2026-02-05T23:00:00.000Z"
Le serveur UTC fait startOfDay() → 5 février 00:00 UTC ← MAUVAIS JOUR !
```

### Comment transmettre une date entre client et serveur

1. **Client → API** : Envoyer le `dateKey` string directement (`2026-02-06`), jamais un ISO string
2. **API (parsing)** : Parser avec le "noon UTC trick" pour éviter les décalages :
   ```ts
   // BIEN : midi UTC est le même jour calendaire partout (UTC-12 à UTC+12)
   const targetDate = new Date('2026-02-06' + 'T12:00:00.000Z');

   // MAL : startOfDay() dépend du timezone du serveur
   const targetDate = startOfDay(new Date('2026-02-05T23:00:00.000Z'));
   ```
3. **Comparaisons de dates** : Toujours comparer par dateKey string (`format(date, 'yyyy-MM-dd')`), jamais par timestamps

### Fonctions utilitaires

- `getDateKey(date)` → `'yyyy-MM-dd'` : conversion Date → dateKey
- `getDateFromKey(dateKey)` → Date : conversion dateKey → Date (avec startOfDay local)
- `dateKeyToISO(dateKey)` → ISO string : **ATTENTION, à éviter pour les appels API** (utiliser le dateKey directement)

### Le mode sablier (time-machine)

Permet de voyager dans le passé (max 28 jours). La date est stockée dans l'URL (`?date=yyyy-MM-dd`).
- `SelectedDateContext` : gère le param URL
- `TimeContext` : fournit `referenceDateKey` et `referenceDate` à tous les hooks
- Les hooks (`useExercices`, `useCategoryStats`, etc.) envoient `referenceDateKey` comme `targetDate` à l'API
