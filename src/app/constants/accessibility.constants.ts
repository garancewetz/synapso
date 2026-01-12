// ============================================================================
// CONSTANTES POUR L'ACCESSIBILITÉ ET LA GESTION DU FOCUS
// ============================================================================

// ============================================================================
// DÉLAIS POUR LA GESTION DU FOCUS
// ============================================================================

// Délais pour la gestion du focus (en millisecondes)
export const FOCUS_DELAYS = {
  /** Délai pour laisser React mettre à jour le DOM après un changement d'état */
  DOM_UPDATE: 100,
  /** Délai pour laisser React mettre à jour les tabIndex */
  TABINDEX_UPDATE: 200,
  /** Délai pour restaurer le focus après fermeture d'un modal */
  RESTORE_FOCUS: 150,
} as const;

// ============================================================================
// SÉLECTEURS CSS POUR LES ÉLÉMENTS FOCUSABLES
// ============================================================================

// Sélecteurs CSS pour les éléments focusables
export const FOCUSABLE_SELECTORS = [
  'button:not([disabled]):not([aria-disabled="true"])',
  'a[href]:not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([aria-disabled="true"])',
  'select:not([disabled]):not([aria-disabled="true"])',
  'textarea:not([disabled]):not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]:not([tabindex="-1"])',
] as const;

// ============================================================================
// TOUCHES DU CLAVIER POUR L'ACCESSIBILITÉ
// ============================================================================

// Touches du clavier pour l'accessibilité
export const KEYBOARD_KEYS = {
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ENTER: 'Enter',
} as const;

