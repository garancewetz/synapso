import { CATEGORY_ICONS } from './exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';

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
export const PROGRESS_DISPLAY_COLORS: Record<ExerciceCategory, {
  bg: string;
  border: string;
  text: string;
  accent: string;
  gradient: string;
}> = {
  UPPER_BODY: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-800',
    accent: 'bg-orange-400',
    gradient: 'from-orange-400 to-orange-500',
  },
  CORE: {
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    text: 'text-teal-800',
    accent: 'bg-teal-400',
    gradient: 'from-teal-400 to-teal-500',
  },
  LOWER_BODY: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
    accent: 'bg-blue-400',
    gradient: 'from-blue-400 to-blue-500',
  },
  STRETCHING: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-800',
    accent: 'bg-purple-400',
    gradient: 'from-purple-400 to-purple-500',
  },
};

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

