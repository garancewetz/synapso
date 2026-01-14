// ============================================================================
// COULEURS UI GÉNÉRIQUES - Pour les éléments non liés aux catégories d'exercices
// ============================================================================

/**
 * Couleurs pour les badges de fréquence de réinitialisation
 * Utilise les couleurs des catégories pour la cohérence visuelle :
 * - Bleu pour quotidien (rythme régulier, ancrage)
 * - Violet pour hebdomadaire (rythme plus souple, détente)
 */
export const RESET_FREQUENCY_COLORS = {
  DAILY: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  WEEKLY: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
  },
} as const;

/**
 * Couleurs pour les éléments de navigation génériques
 * Utilise une couleur neutre pour éviter la confusion avec les catégories
 */
export const NAVIGATION_COLORS = {
  indicator: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    textStrong: 'text-gray-800',
  },
} as const;

/**
 * Couleurs pour les éléments de formulaire génériques (équipements, etc.)
 * Utilise une couleur neutre pour éviter la confusion avec les catégories
 */
export const FORM_COLORS = {
  equipment: {
    selected: 'bg-gray-500 text-white',
    unselected: 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300',
    addButton: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
} as const;


