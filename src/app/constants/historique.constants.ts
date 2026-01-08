// ============================================================================
// CONSTANTES POUR LA PAGE HISTORIQUE
// ============================================================================

// Objectif quotidien d'exercices
export const DAILY_GOAL = 5;

// Options de filtre de période
export type PeriodFilter = 'week' | 'month' | 'total';

export const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'week', label: '7 jours' },
  { value: 'month', label: 'Mois' },
  { value: 'total', label: 'Total' },
];


// Seuils pour les emojis de récompense
export const REWARD_EMOJIS = [
  { threshold: 50, emoji: '👑' },
  { threshold: 25, emoji: '🌟' },
  { threshold: 10, emoji: '🎯' },
] as const;

// Nombre de jours pour les statistiques de régularité (2 semaines)
export const STATS_DAYS = 14;

// Nombre de jours à afficher dans la roadmap (aperçu)
export const ROADMAP_PREVIEW_DAYS = 7;

// Nombre de jours à afficher dans la roadmap complète
export const ROADMAP_FULL_DAYS = 40;

// Nombre maximum de bodyparts à afficher dans le donut chart
export const MAX_BODYPARTS_IN_CHART = 6;

