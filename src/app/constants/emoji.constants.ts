// ============================================================================
// CONSTANTES POUR LES EMOJIS RÉUTILISÉS DANS L'APPLICATION
// ============================================================================

/**
 * Emojis pour les victoires et réussites
 */
export const VICTORY_EMOJIS = {
  /** Étoile simple - utilisée dans les cartes de victoire, heatmap, etc. */
  STAR: '⭐',
  /** Étoile brillante - utilisée dans les titres et boutons de victoire */
  STAR_BRIGHT: '🌟',
  /** Trophée - utilisée pour célébrer les grandes réussites */
  TROPHY: '🏆',
  /** Pouce levé - utilisée pour célébrer les réussites */
  THUMBS_UP: '👍',
} as const;

/**
 * Emojis pour les catégories d'exercices
 */
export const CATEGORY_EMOJIS = {
  /** Bulle de dialogue - utilisée pour l'orthophonie */
  ORTHOPHONIE: '💬',
  /** Haltères - utilisée pour les exercices physiques */
  PHYSIQUE: '🏋️',
} as const;

/**
 * Emoji utilisé pour identifier les victoires orthophonie dans la base de données
 */
export const ORTHOPHONIE_VICTORY_EMOJI = '🎯' as const;

/**
 * Emojis pour la navigation et le parcours
 */
export const NAVIGATION_EMOJIS = {
  /** Maison - utilisée pour la page d'accueil */
  HOME: '🏠',
  /** Carte géographique - utilisée pour "Mon parcours" */
  MAP: '🗺️',
  /** Pin de localisation - utilisée pour indiquer le jour actuel */
  PIN: '📍',
  /** Petite pousse - utilisée pour les sections repliées (début du parcours, croissance) */
  FOLDER_CLOSED: '🌱',
  /** Grand arbre - utilisée pour les sections dépliées (progression, développement) */
  FOLDER_OPEN: '🌳',
  /** Blé/champ - utilisée pour les listes et parcours (récolte, résultat de la croissance) */
  CLIPBOARD: '🌾',
} as const;

