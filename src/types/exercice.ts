// Les 3 catégories simples pour les exercices
export type ExerciceCategory = 'UPPER_BODY' | 'LOWER_BODY' | 'STRETCHING';

// Labels affichés pour chaque catégorie
export const CATEGORY_LABELS: Record<ExerciceCategory, string> = {
  UPPER_BODY: 'Haut du corps',
  LOWER_BODY: 'Bas du corps',
  STRETCHING: 'Étirement',
};

// Couleurs pour chaque catégorie (palette apaisante et accessible)
// 🦵 Bleu = Bas du corps (ancrage, stabilité)
// 💪 Orange = Haut du corps (énergie, action)
// 🧘 Violet = Étirements (détente, souplesse)
// ✅ Vert Émeraude réservé pour validation
export const CATEGORY_COLORS: Record<ExerciceCategory, { bg: string; border: string; text: string; accent: string; tag: string }> = {
  LOWER_BODY: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    accent: 'bg-blue-500',
    tag: 'bg-blue-100 text-blue-600', // Couleur pâle pour les tags bodypart
  },
  UPPER_BODY: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    accent: 'bg-orange-500',
    tag: 'bg-orange-100 text-orange-700', // Couleur pâle pour les tags bodypart
  },
  STRETCHING: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    accent: 'bg-purple-500',
    tag: 'bg-purple-100 text-purple-600', // Couleur pâle pour les tags bodypart
  },
};

// Couleurs pour les bodyparts (tons sobres et professionnels)
export const BODYPART_COLORS: Record<string, string> = {
  'Jambes': 'bg-slate-100 text-slate-700',
  'Bassin': 'bg-stone-100 text-stone-700',
  'Bras': 'bg-zinc-100 text-zinc-700',
  'Mains': 'bg-neutral-100 text-neutral-700',
  'Épaules': 'bg-gray-100 text-gray-700',
  'Epaules': 'bg-gray-100 text-gray-700',
  'Dos': 'bg-slate-100 text-slate-700',
  'Nuque / Cervicales': 'bg-stone-100 text-stone-700',
  'Pied': 'bg-zinc-100 text-zinc-700',
  'Fessier': 'bg-neutral-100 text-neutral-700',
  'Corps': 'bg-gray-100 text-gray-700',
};

export interface Exercice {
  id: number;
  name: string;
  description: {
    text: string;
    comment: string | null;
  };
  workout: {
    repeat: number | null;
    series: number | null;
    duration: string | null;
  };
  equipments: string[];
  bodyparts: string[];  // Parties du corps ciblées
  category: ExerciceCategory;
  completed: boolean;
  completedAt: Date | null;
  pinned: boolean;
}

// Gardé pour compatibilité temporaire
export interface Bodypart {
  id: number;
  name: string;
  color: string;
}

export interface BodypartWithCount extends Bodypart {
  count: number;
}

export interface BodypartWithExercices extends BodypartWithCount {
  exercices: Exercice[];
}

export interface BodypartSection {
  id: number;
  name: string;
  color: string;
  count: number;
}

export interface Metadata {
  categories: ExerciceCategory[];
  equipments: string[];
}
