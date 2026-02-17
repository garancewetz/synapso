# Plan d’implémentation – Mode diaporama (page Progrès)

## 1. Objectif

Ajouter un **mode diaporama** sur la page Historique (section « Mes progrès ») : un bouton « Mode diapo » ouvre un écran plein qui enchaîne les progrès (photo + texte, ou texte seul) avec défilement automatique et contrôles manuels.

---

## 2. Modèle de données

### 2.1 Construction des slides

À partir de `Progress[]` (déjà filtré par date en mode sablier), construire un tableau de **slides** :

- **Type `slide`** (à définir dans le composant ou un fichier types du feature) :
  - `progress: Progress`
  - `mediaUrl?: string` — si absent = slide « texte seul »
  - Optionnel : `victoryNumber: number` (pour afficher « Victoire #n »)

- **Règles** :
  - Si `progress.medias.length > 0` : **une slide par photo**, même `progress` et `content` sur chaque slide, `mediaUrl` = URL de la photo.
  - Si `progress.medias.length === 0` : **une slide** avec `progress` et sans `mediaUrl` (affichage fond + emoji + texte + date).
- En **dernière slide** : slide spéciale de clôture (pas de `progress`) : message « Bravo pour tous ces progrès ! » (et optionnel emoji / léger effet).

Calcul dans un `useMemo(slides, [progressList])` en amont du rendu du diaporama. Ordre : celui de `progressList` (du plus récent au plus ancien, comme la timeline).

---

## 3. Fichiers à créer

### 3.1 `src/app/features/historique/components/ProgressSlideshow.tsx`

- **Props** : `isOpen: boolean`, `onClose: () => void`, `progressList: Progress[]`.
- **Comportement** :
  - Si `!isOpen` ou `progressList.length === 0` : ne rien rendre (ou rendre `null`).
  - Rendu en **portal** dans `document.body` (comme `Lightbox`), `position: fixed; inset: 0`, z-index élevé (ex. 9999).
  - Utiliser `useBodyScrollLock(isOpen)` pour bloquer le scroll du body.
  - Construire les slides (useMemo) puis gérer :
    - `currentSlideIndex` (état).
    - Navigation : précédent / suivant (cyclique ou stop aux bords, au choix).
    - **Auto-advance** : `setInterval` (ex. 5–6 secondes) pour passer à la slide suivante ; clear au démontage et à la fermeture. Option : désactiver l’auto-advance si `prefers-reduced-motion: reduce`.
  - Raccourcis clavier :
    - `Escape` → fermer.
    - `ArrowLeft` → slide précédente.
    - `ArrowRight` → slide suivante.
  - **Accessibilité** :
    - `role="dialog"`, `aria-modal="true"`, `aria-label` descriptif.
    - Piéger le focus dans le modal (focus trap) à l’ouverture.
    - Boutons « Fermer », « Précédent », « Suivant » avec `aria-label` explicites.

- **Structure interne** (rester sous ~250 lignes) :
  - Un sous-composant ou bloc **slide** :
    - Si `mediaUrl` : grande image (Next/Image) + overlay en bas (ou semi-transparent) avec `progress.content`, optionnel numéro de victoire et date.
    - Si pas `mediaUrl` : fond (dégradé doré type progrès), emoji, `progress.content`, date.
  - Slide de clôture : fond + message « Bravo pour tous ces progrès ! ».
  - Barre de contrôles : fermer, précédent, play/pause (optionnel), suivant, indicateur « n / total ».

Si le fichier dépasse 250 lignes, extraire la **slide** dans `ProgressSlideshowSlide.tsx` (même dossier, préfixe `Progress`).

### 3.2 Optionnel : `ProgressSlideshowSlide.tsx`

- Reçoit une slide (objet avec `progress`, `mediaUrl?`, `victoryNumber?`) et un flag `isClosing` (slide de fin).
- Affiche soit image + overlay texte, soit carte texte seule, soit message de clôture.
- Pas de logique de navigation (uniquement présentation).

---

## 4. Fichiers à modifier

### 4.1 `src/app/(pages)/historique/HistoriquePageClient.tsx`

- **État** : `const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);`
- **Bouton « Mode diapo »** :
  - Emplacement : dans la section « Mes progrès », à côté du titre « Mes progrès » et du bouton « + » (ou juste en dessous du titre). Visible **uniquement** si `filteredProgress.length > 0`.
  - Label : « Mode diapo » ou « Voir en diaporama », avec une icône (ex. carré plein / presentation).
  - `onClick` : `() => setIsSlideshowOpen(true)`.
- **Rendu du slideshow** :
  - `<ProgressSlideshow isOpen={isSlideshowOpen} onClose={() => setIsSlideshowOpen(false)} progressList={filteredProgress} />`
  - Utiliser la **même** liste que la timeline (`filteredProgress`) pour cohérence avec le mode sablier.

### 4.2 `src/app/features/historique/components/index.tsx`

- Exporter le nouveau composant :  
  `export { ProgressSlideshow } from './ProgressSlideshow';`  
  (et si créé : `export { ProgressSlideshowSlide } from './ProgressSlideshowSlide';` si besoin en externe — sinon pas d’export.)

### 4.3 Exports du feature `historique`

- Vérifier que `ProgressSlideshow` est exporté depuis le point d’entrée du feature (ex. `features/historique/index.ts` ou `index.tsx` s’il existe) si les pages importent depuis ce barrel.

---

## 5. Détails d’implémentation

### 5.1 Transitions

- Changement de slide : fondu (opacity) ou slide horizontal discret (CSS ou Framer Motion si déjà utilisé sur la page). Rester simple ; respecter `prefers-reduced-motion` (pas d’animation ou très courte).

### 5.2 Auto-advance

- Durée par slide : constante (ex. 5 ou 6 secondes). Pas de réglage utilisateur en v1.
- À la dernière slide (clôture) : après le même délai, fermer le diapo ou boucler sur la première slide ; recommandation : **fermer** pour une fin claire.

### 5.3 Numéro de victoire

- Pour garder la même numérotation que la timeline : `progressList` est déjà ordonné (plus récent en premier). Pour chaque `progress`, on peut calculer `victoryNumber = progressList.length - indexOf(progress)` lors de la construction des slides (en dérivant l’index du progrès dans la liste).

### 5.4 Images

- Réutiliser le même pattern que `ProgressMedia` / `Lightbox` pour les URLs (ex. `url?f_auto,q_auto` si applicable). Utiliser `next/image` avec `fill` ou dimensions fixes pour la grande image en plein écran.

### 5.5 Style

- Rester aligné avec la charte progrès (doré / amber) pour les slides sans photo et la slide de clôture. Pas de nouveau design system : réutiliser les constantes/couleurs existantes (ex. `GOLDEN_TEXT_STYLES`, dégradés amber).

---

## 6. Ordre de réalisation suggéré

1. Définir le type « slide » et la fonction de construction des slides (dans `ProgressSlideshow.tsx` ou un petit util `historique/utils/slideshow.utils.ts`).
2. Implémenter `ProgressSlideshow` avec slides en dur (une slide de test) : plein écran, bouton fermer, navigation clavier.
3. Brancher l’affichage des slides réelles (avec/sans photo, slide de clôture).
4. Ajouter l’auto-advance et le bouton play/pause (optionnel).
5. Intégrer dans `HistoriquePageClient` : état, bouton « Mode diapo », rendu conditionnel avec `filteredProgress`.
6. Exports et vérification des imports.
7. Vérifier accessibilité (focus trap, Escape, flèches, aria) et `prefers-reduced-motion`.

---

## 7. Récap des livrables

| Livrable | Fichier / emplacement |
|----------|------------------------|
| Composant principal | `features/historique/components/ProgressSlideshow.tsx` |
| Sous-composant slide (si split) | `features/historique/components/ProgressSlideshowSlide.tsx` |
| Intégration page | `(pages)/historique/HistoriquePageClient.tsx` (état + bouton + rendu) |
| Exports | `features/historique/components/index.tsx` (et barrel feature si présent) |

Aucune nouvelle route ni API : tout est côté client, avec la liste `filteredProgress` déjà disponible.
