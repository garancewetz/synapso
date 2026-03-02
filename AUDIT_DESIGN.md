# Audit design – Synapso

**Date** : 2 mars 2025  
**Périmètre** : Design et UX, aligné sur `context.md` et approche **mobile first**.

---

## 1. Conformité aux objectifs du contexte

### 1.1 Objectifs rappelés (context.md + .cursorrules)

- **Simple** : navigation claire, actions évidentes.
- **Intuitif** : flux logiques, feedback immédiat.
- **Accessible** : WCAG, clavier, contrastes, lecteurs d’écran.
- **Encourageant** : feedback positif, célébration, progression visible.
- **Mobile first** : performance, fluidité 60fps, réactivité tactile, bundle optimisé ; chaque fonctionnalité doit être testée sur mobile.

### 1.2 Synthèse

| Critère        | État | Commentaire |
|----------------|------|-------------|
| Simplicité     | ✅   | Navigation par onglets (Accueil / Kiné / Suivi), BottomNavBar mobile, menu drawer. |
| Intuitivité    | ✅   | Libellés clairs, états actifs visibles, CompleteButton explicite. |
| Accessibilité  | ⚠️   | Bonne base (skip link, focus-visible, reduced-motion) ; quelques cibles tactiles & contrastes à renforcer. |
| Encouragement  | ✅   | Confettis, cartes dorées, animations success, messages positifs. |
| Mobile first   | ⚠️   | Structure et breakpoints cohérents ; détails à corriger (tailles tactiles, quelques classes). |

---

## 2. Mobile first – analyse

### 2.1 Points positifs

- **Breakpoints** : Usage cohérent de `md:` et `lg:` pour enrichir le desktop (nav horizontale, padding, grilles). Le base est bien pensé pour petit écran.
- **BottomNavBar** : Affichée uniquement sur mobile (`md:hidden`), 5 colonnes avec icônes 48×48px et libellés, `TouchLink` partout.
- **Layout** : `pb-24 md:pb-8` pour laisser la place à la barre fixe sur mobile.
- **Touch** : `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`, `user-select` géré sur `button`/`a` (globals.css).
- **Modales** : `BottomSheetModal` en `items-end` sur mobile, `items-center` sur desktop ; overlay et geste tactile pris en charge.
- **Menu drawer** : Gestion du double déclenchement (touch vs click), focus trap, fermeture Escape.
- **Lazy loading** : `DayDetailModalWrapper`, `GlobalCelebration`, `WebVitals`, `PWARegister` en dynamic avec `ssr: false` pour alléger le premier rendu.

### 2.2 Points à améliorer (mobile first)

| Élément | Problème | Recommandation |
|--------|----------|----------------|
| **Button iconOnly** | `h-10 w-10` (40px) < 44px recommandé (Apple HIG / WCAG 2.5.5) | Passer à `min-h-[44px] min-w-[44px]` (ou `h-11 w-11`) pour les boutons icône seule. |
| **CompleteButton** | Utilise `size="sm"` → `h-10` (40px) pour une action principale. | Utiliser `size="md"` (h-12) sur mobile pour les cartes d’exercice, ou garantir 44px min sur la zone cliquable. |
| **NavBar – bouton menu** | `p-2.5` → zone ~40px. | Augmenter la zone tactile (ex. `min-h-[44px] min-w-[44px]`) tout en gardant l’icône visuelle actuelle. |
| **BottomNavBar** | Zone cliquable : `py-2` + bloc 48px ; la hauteur totale peut être juste. | S’assurer que la zone de touch par lien est bien ≥ 44px en hauteur (ex. `min-h-[44px]` sur le `TouchLink` ou le conteneur). |
| **SegmentedControl** | `py-1.5` / `py-2.5` selon size ; en `sm` la hauteur peut être < 44px. | En mobile, privilégier `size="md"` pour les contrôles de navigation principaux (ex. onglets Accueil) ou ajouter un `min-height` pour la zone tactile. |

### 2.3 Largeurs de conteneur

- **LayoutComposer** : `max-w-10xl`
- **NavBar** : `max-w-8xl`
- **globals.css** : seul `--container-9xl: 90rem` est défini dans `@theme inline`.

**Risque** : En Tailwind 4, `max-w-10xl` et `max-w-8xl` peuvent être absents du thème et ne pas appliquer la largeur attendue. À vérifier en build et, si besoin, définir dans `@theme` :

```css
--container-8xl: 88rem;   /* ou valeur cible */
--container-10xl: 96rem; /* ou valeur cible */
```

---

## 3. Accessibilité

### 3.1 Déjà en place

- **Skip link** : “Aller au contenu” en `focus-visible:translate-y-0`, position fixe, z-index 200.
- **Focus visible** : `button:focus-visible, a:focus-visible` avec outline 3px primary (globals.css).
- **Reduced motion** : `@media (prefers-reduced-motion: reduce)` qui réduit durées d’animation et transitions.
- **Sémantique** : `nav` avec `aria-label="Navigation principale"`, `aria-current="page"`, `aria-expanded` sur le menu Exercices.
- **Chargement / erreur** : textes en `sr-only` avec `role="status"` sur la page d’accueil.
- **Loader** : “Chargement...” en `sr-only`.
- **Bannière mode sablier** : texte alternatif en `sr-only` (SelectedDateBanner).

### 3.2 À renforcer

| Sujet | Détail | Action suggérée |
|-------|--------|------------------|
| **Contraste focus Input** | Focus avec `ring-yellow-500` / bordure ambre (globals.css) alors que le thème primary est indigo. | Aligner le focus des champs avec le design system (ex. `primary`) ou documenter le choix ambre pour les formulaires. |
| **Contraste texte** | `text-gray-600` sur fond clair : en général OK pour WCAG AA ; à valider sur les petits textes (ex. `text-xs`). | Vérifier le ratio sur les libellés secondaires (BottomNavBar, badges) et augmenter la taille ou la couleur si besoin. |
| **Zones tactiles** | Voir tableau “Mobile first” ci‑dessus. | Appliquer partout un minimum de 44×44px pour les contrôles interactifs. |

---

## 4. Cohérence et design system

### 4.1 Points positifs

- **Couleurs** : Variables CSS (`:root`) et `@theme` alignés avec `exercice.constants.ts` et `card.constants.ts` ; pas de couleurs en dur dans les composants analysés.
- **Composants** : `BaseCard`, `Button`, `CompleteButton`, `SegmentedControl` réutilisables avec variantes (golden, size, variant).
- **Focus** : Utilisation de `focus-visible` (et non `focus`) pour éviter le focus au clic souris.

### 4.2 À surveiller

- **Bouton “Réessayer”** (page d’accueil) : `text-sm text-blue-600 underline` sans ring focus visible dans le même fichier. À vérifier que le focus clavier est bien visible (héritage globals ou classe dédiée).
- **Placeholder / états vides** : S’assurer que les états vides (liste d’exercices, historique) ont des messages encourageants conformes au ton “célébration / progression”.

---

## 5. Performance et fluidité (mobile)

- **Animations** : `success-pulse`, `golden-shine`, `active:scale-[0.99]` / `active:scale-[0.97]` ; `will-change: transform` sur les éléments interactifs (globals.css). Bon pour la perception de réactivité.
- **Hover** : Les effets hover sont limités au desktop (`md:hover:...`) pour éviter les conflits avec le tactile.
- **Commentaire globals.css** : La règle “Touch-friendly button sizes” (min 44px) est commentée ; les composants ne garantissent pas tous 44px. À réactiver ou à appliquer au niveau des composants (Button, CompleteButton, NavBar, BottomNavBar, SegmentedControl).

---

## 6. Recommandations prioritaires

1. **Priorité haute**
   - Garantir **44×44px minimum** pour toutes les cibles tactiles (bouton menu, iconOnly, CompleteButton, liens BottomNavBar, SegmentedControl principal).
   - Vérifier et, si besoin, **définir `max-w-8xl` et `max-w-10xl`** dans `@theme` (globals.css) pour éviter des largeurs inattendues.

2. **Priorité moyenne**
   - Harmoniser le **focus des champs** (Input) avec le reste du design system (couleur primary ou documenter l’usage ambre).
   - Vérifier les **contrastes** des petits textes (ex. `text-xs` gris) sur fond blanc/gris clair pour WCAG AA.

3. **Priorité basse**
   - Réactiver ou répliquer la règle **“Touch-friendly button sizes”** (min 44px) soit en global soit dans les composants.
   - Audit léger des **états vides** pour confirmer que les textes sont bien encourageants.

---

## 7. Conclusion

Le design est aligné avec les objectifs “simple, intuitif, encourageant” et la structure est clairement **mobile first** (navigation, layout, modales, touch). Les principaux écarts concernent les **tailles de cibles tactiles** (44px) et la **définition des largeurs de conteneur** dans le thème Tailwind. Une fois ces points corrigés et les contrastes/focus validés, l’ensemble sera en très bon accord avec le `context.md` et les règles d’accessibilité et de mobile first du projet.
