# Audit d'amélioration de la version desktop

Objectif : proposer des améliorations ciblées **uniquement pour le desktop**, sans dégrader l’expérience **mobile first**.

---

## 1. Largeur et cadre de la page

### Constat

- **`max-w-9xl`** est utilisé sur `main`, `NavBar` et `DevBanner`. En Tailwind par défaut il n’existe pas de `max-w-9xl` (s’arrête à `7xl`). Le comportement sur grand écran est donc imprévisible (largeur non appliquée = pleine largeur, ou valeur custom si définie ailleurs).
- **Contenu des pages** : tout est en `max-w-5xl` (1024px). Sur un écran 1920px, les deux tiers de l’écran restent vides.
- **TimeMachineWrapper** : fond (blanc / indigo) en pleine largeur, alors que le contenu est centré et limité → bandes latérales très marquées sur desktop.

### Pistes d’amélioration (desktop uniquement)

| Action | Détail | Mobile |
|--------|--------|--------|
| Définir ou remplacer `max-w-9xl` | Soit définir `max-w-9xl` dans le thème (ex. 1280px ou 1440px), soit remplacer par une classe existante (`max-w-7xl` 1280px) pour un cadre commun header + main. | Inchangé (full width jusqu’au breakpoint). |
| Contenu plus large sur grands écrans | Garder `max-w-5xl` jusqu’à `md`, puis par ex. `md:max-w-5xl lg:max-w-6xl xl:max-w-7xl` sur le conteneur principal des pages (home, catégories, historique, settings, journal). | Pas de changement : une seule colonne, même padding. |
| Marges latérales | Sur `lg`/`xl`, ajouter un peu de padding horizontal (ex. `lg:px-8`) pour que le contenu ne colle pas aux bords quand la largeur augmente. | Garder `px-3` / `px-4` actuels. |

---

## 2. Navigation desktop (NavBar)

### Constat

- Liens de navigation en `text-sm`, assez discrets.
- **Logo** : le texte « Synapso » est dans un `span` avec `max-lg:hidden` → il **disparaît** à partir de `lg` (≥1024px). Sur desktop on ne voit que le logo + emoji maison, pas le nom de l’app.
- Header non sticky : sur les longues pages (historique, liste d’exercices), la barre sort de l’écran en scrollant.
- Menu : même drawer 272px que sur mobile. Sur desktop, un menu déroulant ou une barre d’actions en haut pourrait mieux utiliser l’espace.

### Pistes d’amélioration (desktop uniquement)

| Action | Détail | Mobile |
|--------|--------|--------|
| Afficher « Synapso » sur desktop | Remplacer `max-lg:hidden` par `hidden md:inline` (ou supprimer la condition) pour que le nom soit visible dès la barre desktop (md). | Comportement actuel conservé si on garde un masquage en dessous de `md`. |
| Header sticky (desktop) | Sur la balise `header` de la NavBar : `md:sticky md:top-0 md:z-50` (et éventuellement `md:shadow-sm` au scroll). Ne pas appliquer en sticky sur mobile pour garder le comportement actuel. | Inchangé. |
| Liens nav plus lisibles | Sur desktop uniquement : `md:text-base`, `md:py-3`, pour des cibles un peu plus grandes et lisibles. | Garder `text-sm` et padding actuels. |
| Menu (optionnel, phase 2) | En desktop, envisager un dropdown sous « Menu » au lieu du drawer, ou une seconde ligne d’actions (Ajouter exercice, Noter un progrès). À faire sans toucher au drawer mobile. | Drawer inchangé. |

---

## 3. Mise en page des listes et grilles

### Constat

- **Accueil (onglet Exercices)** : grille `grid-cols-1 sm:grid-cols-2` → 2 colonnes dès 640px. Sur une grande tablette / petit desktop, 2 colonnes de cartes catégories, c’est bien.
- **Page catégorie (ex. Haut du corps)** : `grid-cols-1 lg:grid-cols-2` → 2 colonnes à partir de 1024px. Cohérent.
- **Historique** : une seule colonne, tout en longueur (heatmap, stats, graphiques, timeline). Sur grand écran, beaucoup de scroll et peu d’usage de la largeur.

### Pistes d’amélioration (desktop uniquement)

| Action | Détail | Mobile |
|--------|--------|--------|
| Accueil | Déjà correct (sm: 2 colonnes). Optionnel : sur `lg`, garder 2 colonnes mais avec `lg:max-w-...` sur le conteneur pour ne pas étirer les cartes à l’excès. | Inchangé. |
| Historique : layout 2 colonnes (xl) | À partir de `xl` (1280px) : par ex. colonne gauche = heatmap + donut / stats, colonne droite = timeline des progrès. Un seul conteneur flex/grid avec `xl:grid xl:grid-cols-2 xl:gap-8`. | Une seule colonne en dessous de `xl`. |
| Cartes progrès / jour | Sur desktop, on peut garder des cartes un peu plus larges (max-width sur la carte) pour éviter des lignes trop longues. | Comportement actuel. |

---

## 4. Typo et espacements

### Constat

- Titres de page : souvent `text-2xl` partout. Sur historique, `text-2xl md:text-3xl` est déjà en place.
- Espacements entre sections : `space-y-6` ou `gap-6` partout ; sur grand écran les blocs peuvent sembler un peu tassés.

### Pistes d’amélioration (desktop uniquement)

| Action | Détail | Mobile |
|--------|--------|--------|
| Titres de page | Utiliser `text-2xl md:text-3xl` (ou `lg:text-3xl`) pour les h1 des pages (catégories, journal, paramètres, exercices archivés, équipements). | Garder `text-2xl`. |
| Espacements sections | Sur les conteneurs de page : `space-y-6 md:space-y-8` ou `gap-6 md:gap-8`. | Garder `space-y-6` / `gap-6`. |
| Padding de page | Où c’est encore `px-3 md:px-4`, envisager `md:px-6 lg:px-8` pour le contenu principal. | Garder `px-3` / `px-4`. |

---

## 5. Modales et formulaires

### Constat

- **BottomSheetModal** : `max-w-lg` (512px) sur desktop, centré. Suffisant pour la plupart des usages.
- Formulaires (exercice, progrès, journal) : souvent dans des modales ou des pages en `max-w-5xl`.

### Pistes d’amélioration (desktop uniquement)

| Action | Détail | Mobile |
|--------|--------|--------|
| Modales de formulaire (optionnel) | Sur les modales avec beaucoup de champs (ex. édition exercice), envisager `md:max-w-xl` ou `lg:max-w-2xl` pour réduire le sentiment de « tunnel » étroit. | Garder full width / bottom sheet. |
| Pages formulaire (ex. nouvel exercice) | S’assurer que le conteneur du formulaire a un `max-w-2xl` ou `max-w-3xl` sur desktop pour une lecture confortable, sans toucher au mobile. | Inchangé. |

---

## 6. Fond et identité visuelle desktop

### Constat

- **TimeMachineWrapper** : fond blanc ou indigo-50 sur toute la largeur.
- Sur très grand écran, les bandes vides de part et d’autre du contenu peuvent donner une impression de « vide ».

### Pistes d’amélioration (desktop uniquement)

| Action | Détail | Mobile |
|--------|--------|--------|
| Fond discret (lg+) | Sur `lg` et au-delà, appliquer un fond légèrement gris (ex. `lg:bg-gray-50`) sur `body` ou le wrapper, et garder le contenu dans un bloc `lg:bg-white` avec ombre légère pour le faire ressortir. Optionnel. | Garder le fond actuel. |
| Limiter la largeur du wrapper | Si on définit bien `max-w-9xl` (ou équivalent) sur le wrapper principal, le fond coloré ne s’étire pas au-delà de la zone utile sur très grand écran. | Full width conservé en dessous du breakpoint. |

---

## 7. Récapitulatif par priorité

### Priorité haute (impact fort, peu de risque pour le mobile)

1. **Cadre de largeur** : définir ou remplacer `max-w-9xl` pour aligner header et main.
2. **Sticky header** : `md:sticky md:top-0 md:z-50` sur la NavBar.
3. **Nom « Synapso »** : visible sur desktop (corriger `max-lg:hidden`).
4. **Contenu plus large sur grands écrans** : `lg:max-w-6xl` / `xl:max-w-7xl` sur les conteneurs de page.

### Priorité moyenne

5. Titres de page : `md:text-3xl` où c’est pertinent.
6. Espacements et padding : `md:space-y-8`, `md:px-6 lg:px-8`.
7. Liens de la NavBar : `md:text-base`, `md:py-3`.

### Priorité basse (amélioration progressive)

8. Historique : layout 2 colonnes à partir de `xl`.
9. Fond / contraste léger sur desktop pour la zone de contenu.
10. Modales larges pour formulaires longs (optionnel).

---

## 8. Règle à respecter pour toute modification

- **Toutes les modifications desktop doivent être conditionnées par des breakpoints** : `md:`, `lg:`, `xl:`.
- **Ne pas supprimer ni surcharger** les classes qui s’appliquent en premier (mobile) : on **ajoute** des classes responsive, on ne réduit pas les zones tactiles ni le padding mobile.
- **Tester** : vérifier que sur 375px et 414px le rendu et les interactions restent identiques après chaque changement.
