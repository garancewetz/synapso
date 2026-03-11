// ============================================================================
// CONSTANTES POUR LES EMOJIS RÉUTILISÉS DANS L'APPLICATION
// ============================================================================

/**
 * Emojis pour les progrès
 */
export const PROGRESS_EMOJIS = {
  /** Étoile simple - utilisée dans les cartes de progrès, heatmap, etc. */
  STAR: '⭐',
  /** Étoile brillante - utilisée dans les titres et boutons de progrès */
  STAR_BRIGHT: '🌟',
  /** Trophée - utilisée pour célébrer les grands progrès */
  TROPHY: '🏆',
  /** Pouce levé - utilisée pour célébrer les progrès */
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
 * Emoji utilisé pour identifier les progrès orthophonie dans la base de données
 * @deprecated Utiliser JOURNAL_EMOJI pour les nouveaux progrès du journal
 */
export const ORTHOPHONIE_PROGRESS_EMOJI = '🎯' as const;

/**
 * Emoji utilisé pour le module journal
 */
export const JOURNAL_EMOJI = '📔' as const;

/**
 * Emoji utilisé pour les progrès de catégorie "Autre"
 */
export const AUTRE_PROGRESS_EMOJI = '✨' as const;

/**
 * Emojis pour la navigation et la progression
 */
export const NAVIGATION_EMOJIS = {
  /** Maison - utilisée pour la page d'accueil */
  HOME: '🏠',
  /** Fusée - utilisée pour "Ma progression" */
  ROCKET: '🚀',
  /** Carte géographique - utilisée pour les statistiques et visualisations */
  MAP: '🗺️',
  /** Pin de localisation - utilisée pour indiquer le jour actuel */
  PIN: '📍',
  /** Petite pousse - utilisée pour les sections repliées (début de la progression, croissance) */
  FOLDER_CLOSED: '🌱',
  /** Grand arbre - utilisée pour les sections dépliées (progression, développement) */
  FOLDER_OPEN: '🌳',
  /** Blé/champ - utilisée pour les listes et progression (récolte, résultat de la croissance) */
  CLIPBOARD: '🌾',
  /** Sablier - utilisée pour le mode "machine à remonter le temps" (sablier) */
  HOURGLASS: '⏳',
  /** Corps / zones - utilisée pour le bouton "Choisir une zone" */
  BODY: '🧍',
  /** Épingle - utilisée pour l'onglet / lien "Épinglé" */
  PINNED: '📌',
  /** Livre / journal - utilisée pour le lien "Journal" */
  JOURNAL: '📔',
} as const;

