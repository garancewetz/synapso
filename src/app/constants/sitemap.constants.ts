/**
 * Constantes pour les styles des cartes du plan du site
 * Centralise les couleurs et styles répétés
 */

export const SITEMAP_ICON_STYLES = {
  // Styles par défaut pour les cartes enfants/secondaires
  default: {
    bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
    text: 'text-gray-700',
  },
  // Style pour les cartes principales avec couleurs vives
  primary: {
    aphasie: {
      bg: 'bg-yellow-400',
      text: 'text-white',
    },
    parcours: {
      bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      text: 'text-white',
    },
    victory: {
      bg: 'bg-gradient-to-br from-yellow-500 to-amber-500',
      text: 'text-white',
    },
    addExercice: {
      bg: 'bg-gradient-to-br from-gray-700 to-gray-900',
      text: 'text-white',
    },
    settings: {
      bg: 'bg-white',
      text: 'text-gray-900',
    },
  },
} as const;

/**
 * Couleurs de ring pour les onglets actifs du SegmentedControl
 * Correspond aux couleurs des catégories pour créer un lien visuel
 */
export const TAB_RING_COLORS = {
  corps: 'ring-blue-500',
  aphasie: 'ring-yellow-400',
  parcours: 'ring-amber-500',
} as const;

