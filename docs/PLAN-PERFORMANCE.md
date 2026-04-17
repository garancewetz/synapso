# Plan - Performance de chargement (Axe 1)

Objectif : réduire le temps de chargement initial et le Time-to-Interactive de l'app.

## État actuel constaté

- **150 composants `'use client'`** dans `src/app/` → beaucoup de JS envoyé au client
- **Framer Motion importé statiquement** dans 19 fichiers (poids ~12 MB non compressé) — seule la page d'accueil l'importe via `dynamic()`
- **Recharts** (poids ~3,6 MB) importé dans 2 fichiers (`ProgressStatsChart.tsx`, `DonutChart.tsx`), sans lazy-load
- **`next.config.ts`** ne définit PAS `experimental.optimizePackageImports` — `date-fns`, `clsx`, `zod` non pré-tree-shakés
- **`UserContext`** lance un `useQuery(fetchUser)` qui bloque implicitement les enfants (pas de `enabled: false`)
- **`TimeContext`** prefetch avec délai de 500 ms côté client — sérialisé au lieu d'être parallèle server-side
- **Fonts** : `next/font` (Inter) utilisé ✅
- **Images** : `next/image` avec Cloudinary ✅

---

## Phase 1 — Quick wins (1-2 jours)

Objectif : −15 à −20 % de JS bundle sans refactor.

### 1.1 Activer `optimizePackageImports`

**Fichier** : [next.config.ts](../next.config.ts)

Ajouter au `nextConfig` :

```ts
experimental: {
  optimizePackageImports: ['date-fns', 'clsx', 'zod', 'framer-motion'],
}
```

Next.js génère automatiquement des imports modulaires, réduit le bundle sur les lib partiellement utilisées.

### 1.2 Lazy-load Framer Motion partout

Remplacer tous les imports statiques `import { motion } from 'framer-motion'` par `dynamic()` dans les 19 fichiers, **sauf** ceux visibles above-the-fold de la home.

**Fichiers prioritaires (pages entières)** :
- [src/app/(pages)/exercices/[category]/page.tsx](../src/app/%28pages%29/exercices/%5Bcategory%5D/page.tsx)
- [src/app/(pages)/notifications/page.tsx](../src/app/%28pages%29/notifications/page.tsx)
- [src/app/(pages)/exercices/all/EquipmentsPageClient.tsx](../src/app/%28pages%29/exercices/all/EquipmentsPageClient.tsx)
- [src/app/(pages)/exercices/archived/ArchivedPageClient.tsx](../src/app/%28pages%29/exercices/archived/ArchivedPageClient.tsx)

**Pattern** :
```ts
const MotionDiv = dynamic(() => import('framer-motion').then(m => m.motion.div), { ssr: false });
```

Pour les composants entiers qui ne servent qu'à l'animation (ex: `ConfettiRain`, `ConfettiExplosion`, `ConfettiValidate`, `TimeMachineTransition*`), lazy-loader le composant complet.

### 1.3 Lazy-load Recharts

Wrapper [ProgressStatsChart.tsx](../src/app/features/historique/components/ProgressStatsChart.tsx) et [DonutChart.tsx](../src/app/features/historique/components/DonutChart.tsx) dans un `dynamic(() => ..., { ssr: false, loading: () => <Skeleton /> })`.

Recharts n'est utilisé que sur `/historique` → aucun bénéfice à le charger sur les autres routes.

### 1.4 Réduire le poids des icônes PWA

- [public/icon-512.png](../public/icon-512.png) → compresser via ImageOptim (cible < 8 KB)
- Vérifier [public/icon-192.png](../public/icon-192.png)

**Gain estimé Phase 1** : −50 à −100 KB sur le bundle JS client, LCP amélioré de 100-300 ms sur mobile 4G.

---

## Phase 2 — Gains structurels (1-2 semaines)

Objectif : passer le ratio Server/Client components de ~0/150 à ~60/90.

### 2.1 Audit `'use client'` — convertir ce qui peut l'être

**Méthodo** : pour chaque composant marqué `'use client'`, vérifier s'il utilise :
- Un hook React (`useState`, `useEffect`, `useRef`, contexts)
- Un event handler (`onClick`, `onChange`…)
- Une API navigateur (`window`, `localStorage`)

Si non → convertir en Server Component (supprimer le `'use client'`).

**Cibles faciles (pas de state, juste du rendu)** :
- Composants de présentation purs dans `src/app/features/**/components/` qui reçoivent toutes leurs données en props
- Sous-composants de cards (titre, badges, pictos)
- Headers statiques

**Cibles plus complexes (pattern "composition client + server")** :
- Pages comme [src/app/(pages)/historique/page.tsx](../src/app/%28pages%29/historique/page.tsx) : découper en `<HistoriqueServer>` (fetch initial en SSR via Prisma) + `<HistoriqueClient>` (interactions)
- Idem pour `/exercices/[category]`

**Méthode recommandée** : cibler 10-15 composants par semaine, pas tout d'un coup.

### 2.2 Rendre `UserContext` non-bloquant

**Fichier** : [src/app/contexts/UserContext.tsx](../src/app/contexts/UserContext.tsx)

Problème : `useQuery(fetchUser)` est enabled par défaut → les enfants attendent avant de render du contenu utile.

Solution : déplacer la récupération utilisateur côté serveur (Server Component racine), passer le user en prop au `UserProvider`. Le context initial est hydraté avec la valeur SSR → pas de waterfall.

```tsx
// layout.tsx devient server component
const user = await getCurrentUser(); // Prisma direct
<UserProvider initialUser={user}>...</UserProvider>
```

### 2.3 Paralléliser le prefetch de `TimeContext`

**Fichier** : [src/app/contexts/TimeContext.tsx](../src/app/contexts/TimeContext.tsx) (lignes 170-178)

Remplacer le prefetch JS côté client (500 ms delay) par un prefetch server-side :
- Dans le Server Component de la page d'accueil, faire `Promise.all([fetchToday, fetchYesterday, fetchTomorrow])` puis `queryClient.prefetchQuery()` avec hydration via `<HydrationBoundary>`.

### 2.4 Audit des `useMemo` / `useCallback` excessifs

~62 composants utilisent ces hooks. Beaucoup sont inutiles (React 19 a `use compiler` auto-memoization en perspective).

Cibles : les composants où `useMemo` porte sur une valeur qui change à chaque render (ex: une date `new Date()`).

**Pas prioritaire** — gain marginal. À faire lors des modifs futures.

### 2.5 Date-fns : imports granulaires ou migration

Option A (moins risqué) : `optimizePackageImports` suffit probablement (Phase 1).

Option B (plus agressif) : remplacer par [Day.js](https://day.js.org/) (~6 KB vs ~40 KB pour date-fns). Nécessite refactor de tous les usages.

Recommandation : **rester sur date-fns + optimizePackageImports**, sauf si l'audit bundle révèle encore > 30 KB.

**Gain estimé Phase 2** : −30 à −50 % de JS client sur les routes lourdes, FCP amélioré de 500 ms-1 s sur mobile 4G.

---

## Mesure et validation

### Avant chaque phase
- `npm run build` → noter les tailles des chunks dans `.next/static/chunks/`
- Lighthouse sur `/`, `/historique`, `/exercices/[category]` (mobile, 4G throttling)
- Web Vitals réels via `web-vitals` (déjà en dépendance)

### Après chaque phase
- Comparer les chunks et les scores Lighthouse
- Vérifier qu'aucun UX n'a régressé (tests e2e Playwright)

---

## Ordre recommandé

1. **Phase 1.1** (config) — 10 min, aucun risque
2. **Phase 1.2** (Framer Motion) — 2-4 h, faible risque
3. **Phase 1.3** (Recharts) — 1 h, faible risque
4. **Phase 1.4** (icônes) — 10 min
5. **Phase 2.2** (UserContext SSR) — risque moyen, déblocage massif
6. **Phase 2.1** (Server Components par batchs) — itératif
7. **Phase 2.3** (TimeContext prefetch) — en même temps que 2.2

**Total estimé** : 3-4 jours de travail concentré pour Phase 1, 1-2 semaines pour Phase 2.
