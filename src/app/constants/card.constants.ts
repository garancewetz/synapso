// ============================================================================
// CONSTANTES POUR LES STYLES DE CARTES (BaseCard, VictoryCard, etc.)
// ============================================================================

// ============================================================================
// STYLES GOLDEN (VictoryCard et challenges maîtrisés)
// ============================================================================

export const GOLDEN_CARD_STYLES = {
  // Fond avec gradient doré plus chaud et festif
  bg: 'bg-gradient-to-br from-amber-50 via-yellow-50/95 to-amber-100/80',
  // Bordure dorée avec effet néon
  border: 'border-2 border-amber-400/80',
  // Border radius
  rounded: 'rounded-2xl',
  // Classes complètes pour la carte avec effet néon doré
  // Utilise ring pour la lueur néon et drop-shadow pour l'effet de profondeur
  card: 'bg-gradient-to-br from-amber-50 via-yellow-50/95 to-amber-100/80 rounded-2xl border-2 border-amber-400/80 ring-2 ring-amber-300/40 ring-offset-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] overflow-hidden',
} as const;

export const GOLDEN_ACCENT_STYLES = {
  // Gradient de la bande latérale plus chaud et festif
  gradient: 'bg-gradient-to-b from-amber-500 via-yellow-500 to-amber-600',
  // Largeur de la bande légèrement plus épaisse
  width: 'w-2.5',
} as const;

export const GOLDEN_FOOTER_STYLES = {
  // Classes du footer doré
  classes: 'border-t border-amber-200 bg-amber-100/50 px-4 py-2 flex items-center gap-2',
} as const;

export const GOLDEN_BADGE_STYLES = {
  // Classes du badge doré plus chaud
  classes: 'bg-gradient-to-r from-amber-300 to-yellow-300 text-amber-900 border border-amber-400 shadow-sm',
} as const;

export const GOLDEN_TEXT_STYLES = {
  // Texte principal plus foncé pour meilleur contraste
  primary: 'text-amber-950',
  // Texte secondaire (date)
  secondary: 'text-amber-700',
  // Texte des icônes
  icon: 'text-amber-800',
  // Tags de victoire
  tag: 'bg-amber-200/80 text-amber-900 border border-amber-300/50',
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

