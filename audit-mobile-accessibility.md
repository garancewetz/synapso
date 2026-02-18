# Audit Mobile First & Accessibilité – Synapso

Rapport basé sur l’étude du `context.md` et du code source (layout, composants, globals, navigation).

---

## 1. Conformité au context.md

### Mobile First

Le context.md décrit une approche **mobile first** (performance, touch, 60fps, zones tactiles). En pratique :

| Critère context | Implémentation |
|-----------------|----------------|
| Performance mobile, bundle optimisé | Next.js, lazy loading (DayDetailModal, GlobalCelebration), prefetch |
| Fluidité, 60fps | Framer Motion, `will-change`, `touch-action: manipulation` |
| Réactivité tactile | `TouchLink`, `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent` sur liens/boutons |
| Zones de touch généreuses | `min-h-[44px]` sur de nombreux boutons (cartes, DotMenuActions, filtres, etc.) |
| Navigation mobile | `BottomNavBar` (5 onglets, `md:hidden`), `pb-24 md:pb-8` sur `main` pour la barre fixe |

**Verdict** : L’app est bien pensée mobile first (viewport, bottom nav, touch, responsive avec `sm:`/`md:`/`lg:`).

### Accessibilité (handicap / utilisateurs fragilisés)

Le context et les `.cursorrules` visent : **WCAG**, navigation clavier, contrastes, lecteurs d’écran.

| Critère | Implémentation |
|---------|----------------|
| Zoom / malvoyance | `viewport`: `maximumScale: 5`, `userScalable: true` (zoom jusqu’à 500 % – WCAG 2.1 AA) |
| Préférence mouvement réduit | `@media (prefers-reduced-motion: reduce)` dans `globals.css` + `prefers-reduced-motion` dans `ProgressSlideshow` |
| Focus clavier | `button:focus-visible, a:focus-visible` (outline 3px), nombreux `focus:ring-2`, `focus-visible:ring-2` sur composants |
| ARIA | `aria-label` sur boutons d’action, `aria-expanded`, `aria-current="page"`, `aria-labelledby` sur sections, `role="article"`, modale avec `aria-modal`, etc. |
| Contraste / lisibilité | Palette définie, textes en `text-sm`/`text-base`/`text-lg`, commentaires WCAG AA dans le context |
| Zones de touch 44×44 px | Beaucoup de `min-h-[44px]` ; règle de secours dans `globals.css` **commentée** (voir écarts) |
| Navigation clavier | Escape pour fermer modales, constantes `KEYBOARD_KEYS`, `useFocusTrap` (MenuDrawer), `usePageFocus` (FormPageWrapper) |
| Landmark / sémantique | `<main>`, `<nav aria-label="Navigation principale">`, `lang="fr"` sur `<html>` |

**Verdict** : Bonne base accessible (zoom, reduced-motion, focus, ARIA, sémantique). Quelques écarts à traiter pour être pleinement aligné avec le context et WCAG.

---

## 2. Écarts identifiés

### 2.1 Lien d’évitement (skip link) manquant

- **WCAG 2.4.1 Bypass Blocks (niveau A)** : permettre de sauter le bloc de navigation répétitive.
- Aucun lien du type « Aller au contenu » n’est présent ; les utilisateurs clavier / lecteur d’écran doivent tabuler tout le header/nav à chaque chargement.
- **Recommandation** : Ajouter un lien « Aller au contenu » visible au focus, ciblant `id="main-content"` sur `<main>`.

### 2.2 Zones tactiles < 44 px

- **WCAG 2.5.5 Target Size (niveau AAA)** / **Apple HIG** : au moins 44×44 px pour les cibles tactiles.
- Dans `globals.css`, la règle qui impose `min-height: 44px` et `min-width: 44px` pour certains boutons/liens est **commentée** (l.195–200).
- Plusieurs éléments restent en **40×40 px** (`h-10 w-10`) : `Button` iconOnly, icônes dans `ProgressCard`, `DayDetailModal`, `WeekAccordionNew`, `ProgressCardCompact`, `AdminUserSelector`, `UserSection`, bouton fermer desktop de `BottomSheetModal` (`w-8 h-8`).
- **Recommandation** : Soit réactiver la règle globale (en ciblant bien les sélecteurs), soit remonter les composants concernés à au moins 44 px (ex. `min-h-[44px] min-w-[44px]` ou `h-11 w-11`).

### 2.3 Focus trap dans BottomSheetModal

- Le **context.md** indique que `BottomSheetModal` utilise `useFocusTrap` ; ce n’est **pas** le cas dans le code actuel.
- Conséquence : en navigation clavier, le focus peut sortir de la modal et aller sur le contenu en arrière-plan.
- **Recommandation** : Utiliser `useFocusTrap(containerRef, isOpen, { … })` dans `BottomSheetModal` (comme dans `MenuDrawer`) et restaurer le focus à l’élément ouvrant à la fermeture.

### 2.4 Point de détail : `user-select: none` sur tous les liens/boutons

- Dans `globals.css`, `a[href]` et `button` ont `user-select: none` pour le touch.
- Pour des utilisateurs qui sélectionnent du texte pour le lire ou le faire lire (lecteur d’écran, aide à la lecture), cela peut être gênant sur des blocs qui contiennent du texte.
- Les cartes utilisent déjà `[role="button"], [tabindex]` avec `user-select: text`. À garder en tête si on étend la règle à d’autres zones cliquables contenant du texte.

---

## 3. Synthèse

| Aspect | Statut | Commentaire |
|--------|--------|-------------|
| Mobile first | Conforme | Viewport, bottom nav, touch, responsive, perf |
| Zoom / malvoyance | Conforme | maximumScale 5, userScalable |
| Reduced motion | Conforme | Media query globale + usage dans composants |
| Focus & clavier | Partiel | Bonne base ; manque skip link + focus trap dans BottomSheetModal |
| ARIA & sémantique | Conforme | Bon usage aria-label, roles, landmarks, lang |
| Cibles tactiles 44 px | Partiel | Beaucoup de min-h-[44px] ; règle CSS désactivée et plusieurs 40px / 32px |

**Conclusion** : L’application est bien **mobile first** et déjà **adaptée à de nombreux besoins d’accessibilité** (handicap moteur, visuel partiel, clavier). Pour coller à 100 % au context et renforcer la conformité WCAG, il reste à : ajouter un **lien d’évitement**, réactiver ou compléter les **zones 44×44 px**, et ajouter un **focus trap** dans `BottomSheetModal`.
