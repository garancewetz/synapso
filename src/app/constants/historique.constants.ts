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

// Configuration des badges pour les StatCards
export const STAT_BADGES = {
  total: [
    { threshold: 100, text: 'Légende ! 👑' },
    { threshold: 50, text: 'Expert ! ⭐' },
    { threshold: 20, text: 'En progression ! 📈' },
  ],
  week: [
    { threshold: 15, text: 'Semaine parfaite ! 🌟' },
    { threshold: 7, text: 'Super semaine ! 💫' },
  ],
  month: [
    { threshold: 30, text: 'Mois record ! 🎖️' },
    { threshold: 15, text: 'Très bien ! 👏' },
  ],
  streak: [
    { threshold: 7, text: 'Inarrêtable ! 🚀' },
    { threshold: 3, text: 'Continue ! 💪' },
  ],
} as const;

// Seuils pour les emojis de récompense
export const REWARD_EMOJIS = [
  { threshold: 50, emoji: '👑' },
  { threshold: 25, emoji: '🌟' },
  { threshold: 10, emoji: '🎯' },
] as const;

// Nombre de jours pour les statistiques de régularité
export const STATS_DAYS = 30;

// Nombre de jours à afficher dans la roadmap (aperçu)
export const ROADMAP_PREVIEW_DAYS = 7;

// Nombre de jours à afficher dans la roadmap complète
export const ROADMAP_FULL_DAYS = 40;

// Nombre maximum de bodyparts à afficher dans le donut chart
export const MAX_BODYPARTS_IN_CHART = 6;

