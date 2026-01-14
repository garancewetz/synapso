import { CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_ORDER } from './exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';

// Mapping couleur de base par catégorie (dérivé de CATEGORY_CONFIG dans exercice.constants.ts)
// Source unique de vérité : exercice.constants.ts
const CATEGORY_COLOR_MAP: Record<ExerciceCategory, string> = {
  UPPER_BODY: 'orange',
  CORE: 'teal',
  LOWER_BODY: 'blue',
  STRETCHING: 'purple',
};

// ============================================================================
// TAGS DE PROGRÈS - Raccourcis pour noter rapidement un progrès
// ============================================================================

export const PROGRESS_TAGS = [
  { label: 'Force', emoji: '💪' },
  { label: 'Souplesse', emoji: '🤸' },
  { label: 'Équilibre', emoji: '⚖️' },
  { label: 'Confort', emoji: '✨' },
] as const;

export type ProgressTag = typeof PROGRESS_TAGS[number];

// Tags qui utilisent le format emoji+label+emoji (Force, Souplesse, Équilibre)
export const PROGRESS_TAGS_WITH_EMOJI = ['Force', 'Souplesse', 'Équilibre', 'Confort'] as const;

// ============================================================================
// COULEURS DES CATÉGORIES POUR LES PROGRÈS
// ============================================================================

// Couleurs pour le bottom sheet (sélection de catégorie)
export const PROGRESS_CATEGORY_COLORS: Record<ExerciceCategory, { 
  active: string; 
  inactive: string;
}> = {
  UPPER_BODY: { 
    active: 'bg-orange-200 ring-2 ring-orange-500', 
    inactive: 'bg-orange-50' 
  },
  CORE: { 
    active: 'bg-teal-200 ring-2 ring-teal-500', 
    inactive: 'bg-teal-50' 
  },
  LOWER_BODY: { 
    active: 'bg-blue-200 ring-2 ring-blue-500', 
    inactive: 'bg-blue-50' 
  },
  STRETCHING: { 
    active: 'bg-purple-200 ring-2 ring-purple-500', 
    inactive: 'bg-purple-50' 
  },
};

// Couleurs pour l'affichage des progrès (cartes, modale de détail)
// Dérivées de CATEGORY_COLORS avec des variantes spécifiques pour les progrès :
// - border-300 au lieu de border-200 (bordure plus visible pour les progrès)
// - text-800 au lieu de text-700 (texte plus foncé pour meilleure lisibilité)
// - accent et gradient pour les graphiques et animations
// Source unique de vérité : CATEGORY_COLORS dans exercice.constants.ts
export const PROGRESS_DISPLAY_COLORS: Record<ExerciceCategory, {
  bg: string;
  border: string;
  text: string;
  accent: string;
  gradient: string;
}> = Object.fromEntries(
  CATEGORY_ORDER.map((category) => {
    const colors = CATEGORY_COLORS[category];
    const colorName = CATEGORY_COLOR_MAP[category]; // Utilise le mapping de couleur de base
    
    return [category, {
      bg: colors.bg, // Utilise directement bg de CATEGORY_COLORS
      border: `border-${colorName}-300`, // Variante plus visible pour les progrès
      text: colors.text.includes('800') ? colors.text : `text-${colorName}-800`, // text-800 pour meilleure lisibilité
      accent: `bg-${colorName}-400`, // Accent pour les graphiques
      gradient: `from-${colorName}-400 to-${colorName}-500`, // Gradient pour les animations
    }];
  })
) as Record<ExerciceCategory, {
  bg: string;
  border: string;
  text: string;
  accent: string;
  gradient: string;
}>;

// Couleur par défaut pour les progrès sans catégorie
export const PROGRESS_DEFAULT_GRADIENT = 'from-amber-400 to-yellow-500';

// Couleurs pour la catégorie Orthophonie (jaune, couleur de l'aphasie)
export const ORTHOPHONIE_COLORS = {
  active: 'bg-yellow-200 ring-2 ring-yellow-500',
  inactive: 'bg-yellow-50',
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Récupère le gradient de couleur pour un progrès basé sur son emoji
 */
export function getProgressGradient(emoji: string | null): string {
  if (!emoji) return PROGRESS_DEFAULT_GRADIENT;
  
  // Trouver la catégorie correspondant à l'emoji
  const categoryEntry = Object.entries(CATEGORY_ICONS).find(
    ([, icon]) => icon === emoji
  );
  
  if (!categoryEntry) return PROGRESS_DEFAULT_GRADIENT;
  
  const category = categoryEntry[0] as ExerciceCategory;
  return PROGRESS_DISPLAY_COLORS[category].gradient;
}

/**
 * Récupère la configuration de couleur complète pour une catégorie
 */
export function getProgressDisplayColors(category: ExerciceCategory) {
  return PROGRESS_DISPLAY_COLORS[category];
}

