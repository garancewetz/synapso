/**
 * Constantes pour la génération d'images de partage
 * Centralise tous les magic numbers pour faciliter la maintenance
 */

export const CANVAS_CONFIG = {
  PROGRESS: {
    WIDTH: 800,
    HEIGHT: 600,
  },
  EXERCICE: {
    WIDTH: 800,
    PADDING: 20,
    CARD_PADDING: 20,
    ACCENT_WIDTH: 6,
    BORDER_RADIUS: 16,
    BOTTOM_PADDING: 40,
  },
} as const;

export const TYPOGRAPHY = {
  TITLE: {
    SIZE: 32,
    WEIGHT: 'bold',
  },
  SUBTITLE: {
    SIZE: 24,
  },
  PROGRESS_TEXT: {
    SIZE: 28,
  },
  DATE: {
    SIZE: 20,
  },
  EXERCICE_NAME: {
    SIZE: 18,
    WEIGHT: 600,
  },
  DESCRIPTION: {
    SIZE: 14,
    WEIGHT: 400,
  },
  TAG: {
    SIZE: 12,
    WEIGHT: 500,
  },
  COMMENT: {
    SIZE: 14,
    WEIGHT: 400,
  },
} as const;

export const SPACING = {
  LOGO: {
    SIZE: 80,
    X: 40,
    Y: 40,
  },
  LINE_HEIGHT: {
    NORMAL: 24,
    RELAXED: 24,
    TIGHT: 18,
  },
  MARGIN: {
    SMALL: 16,
    MEDIUM: 20,
    LARGE: 40,
  },
  TAG: {
    PADDING: 8,
    HEIGHT: 20,
    RADIUS: 6,
    GAP: 6,
  },
  BADGE: {
    PADDING: 8,
    HEIGHT: 20,
    RADIUS: 6,
    GAP: 6,
  },
  COMMENT_BOX: {
    PADDING: 12,
    HEIGHT: 60,
    RADIUS: 4,
    BORDER_WIDTH: 2,
  },
} as const;

export const COLORS = {
  BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#4B5563',
  TEXT_TERTIARY: '#6B7280',
  TEXT_GRAY_700: '#374151',
  TEXT_GRAY_800: '#1F2937',
  BORDER: '#E5E7EB',
  SHADOW: 'rgba(0, 0, 0, 0.05)',
  SLATE_50: '#F8FAFC',
  SLATE_100: '#F1F5F9',
  SLATE_300: '#CBD5E1',
  SLATE_700: '#334155',
} as const;

export const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
