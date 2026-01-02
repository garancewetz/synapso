/**
 * Constantes pour les styles de cartes (BaseCard, VictoryCard, etc.)
 */

// ============================================================================
// STYLES GOLDEN (VictoryCard et challenges maîtrisés)
// ============================================================================

export const GOLDEN_CARD_STYLES = {
  // Fond avec gradient doré
  bg: 'bg-gradient-to-br from-amber-50 via-amber-50/90 to-yellow-50',
  // Bordure dorée
  border: 'border-2 border-amber-400',
  // Border radius
  rounded: 'rounded-2xl',
  // Classes complètes pour la carte
  card: 'bg-gradient-to-br from-amber-50 via-amber-50/90 to-yellow-50 rounded-2xl border-2 border-amber-400 overflow-hidden',
} as const;

export const GOLDEN_ACCENT_STYLES = {
  // Gradient de la bande latérale
  gradient: 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500',
  // Largeur de la bande
  width: 'w-2',
} as const;

export const GOLDEN_FOOTER_STYLES = {
  // Classes du footer doré
  classes: 'border-t border-amber-200 bg-amber-100/50 px-4 py-2 flex items-center gap-2',
} as const;

export const GOLDEN_BADGE_STYLES = {
  // Classes du badge doré
  classes: 'bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-900 border border-amber-300',
} as const;

export const GOLDEN_TEXT_STYLES = {
  // Texte principal
  primary: 'text-amber-900',
  // Texte secondaire (date)
  secondary: 'text-amber-600',
  // Texte des icônes
  icon: 'text-amber-700',
  // Tags de victoire
  tag: 'bg-amber-100 text-amber-800',
} as const;

// ============================================================================
// STYLES PAR DÉFAUT (cartes normales)
// ============================================================================

export const DEFAULT_CARD_STYLES = {
  bg: 'bg-white',
  border: 'border border-gray-200',
  rounded: 'rounded-xl',
  shadow: 'shadow-sm',
  card: 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
} as const;

export const DEFAULT_ACCENT_STYLES = {
  width: 'w-1.5',
} as const;

export const DEFAULT_FOOTER_STYLES = {
  classes: 'border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex items-center gap-2',
} as const;

// ============================================================================
// COULEURS DU MENU
// ============================================================================

export const MENU_COLORS = {
  APHASIE: {
    bg: 'bg-yellow-400',
    text: 'text-white',
  },
  PARCOURS: {
    bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    text: 'text-white',
  },
  ADD_EXERCICE: {
    bg: 'bg-gradient-to-br from-gray-700 to-gray-900',
    text: 'text-white',
  },
  SETTINGS: {
    bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
    text: 'text-white',
  },
} as const;

// ============================================================================
// COULEURS APHASIE
// ============================================================================

export const APHASIE_COLORS = {
  // Jaune solaire (non maîtrisé)
  SOLAR_YELLOW: 'bg-yellow-400',
} as const;

