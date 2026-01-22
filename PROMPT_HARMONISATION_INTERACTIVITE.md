Prompt : Harmonisation du Système d'Interactivité (Rings & Feedback)
1. Contexte & Vision
L'application de rééducation Synapso doit offrir une interface ultra-prévisible pour des utilisateurs post-AVC. Nous passons d'un système hétérogène (shadows, scale, brightness) à un système basé sur le Ring (contour interactif) comme indicateur universel d'action.

La règle d'or : Si un élément est entouré d'un Ring (au survol ou au focus), il est interactif.

2. Piliers de l'Architecture Visuelle
A. Mobile-First (Priorité au Feedback Tactile)
Sur mobile, le "hover" n'existe pas. Nous privilégions la sensation physique.

Active (Touch) : Appliquer systématiquement active:scale-[0.98] sur tous les éléments cliquables. Cela simule l'enfoncement d'un bouton physique.

Neutralisation du Hover : Tous les effets de Ring au survol doivent être préfixés par md:hover: pour éviter le "sticky hover" (bouton qui reste coloré après le clic sur mobile).

B. Le Système de Rings
Le Ring ne doit jamais masquer le contenu. Utiliser ring-offset-2 pour créer un liseré blanc entre l'élément et son contour.

Hover (Desktop) : Subtil. Opacité à 50% (/50).

Focus (Clavier/Accessibilité) : Affirmé. Opacité à 100%, indispensable pour la navigation simplifiée.

Selected (État Actif) : Lorsqu'un filtre ou une carte est sélectionné, le Ring devient permanent et plus épais (ring-2 ou ring-4).

C. Sémantique par Catégorie
Utiliser impérativement les constantes CATEGORY_COLORS (src/app/constants/exercice.constants.ts).

UPPER_BODY : Orange

CORE : Teal

LOWER_BODY : Blue

STRETCHING : Purple

3. Spécifications par Composant
1. Cartes de Navigation (BaseCard, ExerciceCard)
Repos : shadow-sm (léger relief pour indiquer que c'est un objet manipulable).

Hover (Desktop) : md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2.

Active : active:scale-[0.98].

Note : Supprimer hover:scale-105 et hover:shadow-lg.

2. Boutons d'Action (Button, ActionButton)
Design : Fond plein (couleur de catégorie ou bleu par défaut).

Hover (Desktop) : md:hover:ring-2 md:hover:ring-offset-2 md:hover:ring-{color}-400/60.

Active : active:scale-[0.95] (plus prononcé que les cartes pour une sensation de "clic" de validation).

3. Badges et Filtres Cliquables (FilterBadge, Badge)
C'est ici que l'harmonisation est la plus importante pour différencier l'info de l'action.

Badge Informationnel (Statique) : Pas de ring, pas de curseur pointer. Fond gris très pâle.

Badge Interactif (Filtre) :

Non-sélectionné : border border-gray-200 + md:hover:ring-2 md:hover:ring-{color}-300/50.

Sélectionné (Active) : ring-2 ring-{color}-500 bg-{color}-50. Le ring confirme le choix.

Feedback : active:scale-[0.98].

4. Instructions de Nettoyage (Refactoring)
Supprimer les classes suivantes partout où elles sont liées à l'interactivité :

hover:shadow-md, hover:shadow-lg (remplacé par ring).

hover:scale-105 (remplacé par ring sur desktop, conservé uniquement sur de très petits éléments type Heatmap).

hover:brightness-105 (trop agressif visuellement).

group-hover:text-gray-950 (garder le texte stable pour faciliter la lecture).

5. Checklist de Validation (Output attendu)
Pour chaque composant modifié, l'IA doit s'assurer que :

Le focus:ring-offset-2 est présent pour l'accessibilité.

Le active:scale-[0.98] est appliqué pour le feedback tactile.

Les couleurs utilisées proviennent bien du mapping CATEGORY_COLORS.

L'aspect visuel reste "calme" : les rings sont fins (ring-2) et les offsets évitent l'étouffement du texte.