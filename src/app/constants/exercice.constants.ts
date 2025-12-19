import type { ExerciceCategory } from '@/types/exercice';

// Ordre standardisé des catégories (utilisé partout dans l'application)
export const CATEGORY_ORDER: ExerciceCategory[] = ['UPPER_BODY', 'CORE', 'LOWER_BODY', 'STRETCHING'];

// Labels affichés pour chaque catégorie
export const CATEGORY_LABELS: Record<ExerciceCategory, string> = {
  UPPER_BODY: 'Haut du corps',
  LOWER_BODY: 'Bas du corps',
  STRETCHING: 'Étirement',
  CORE: 'Tronc',
};

// Labels courts pour la navigation
export const CATEGORY_LABELS_SHORT: Record<ExerciceCategory, string> = {
  UPPER_BODY: 'Haut',
  LOWER_BODY: 'Bas',
  STRETCHING: 'Étirer',
  CORE: 'Tronc',
};

// Icônes/Emojis pour chaque catégorie
export const CATEGORY_ICONS: Record<ExerciceCategory, string> = {
  LOWER_BODY: '🦵',
  UPPER_BODY: '💪',
  STRETCHING: '🧘',
  CORE: '🤸', // Personne qui fait une roue = gainage/tronc
};

// URLs pour chaque catégorie
export const CATEGORY_HREFS: Record<ExerciceCategory, string> = {
  UPPER_BODY: '/exercices/upper_body',
  CORE: '/exercices/core',
  LOWER_BODY: '/exercices/lower_body',
  STRETCHING: '/exercices/stretching',
};

// Couleurs pour chaque catégorie (palette apaisante et accessible)
// 🦵 Bleu = Bas du corps (ancrage, stabilité)
// 💪 Orange = Haut du corps (énergie, action)
// 🧘 Violet = Étirements (détente, souplesse)
// 🤸 Teal = Tronc (gainage, force centrale, stabilité)
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
  CORE: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    accent: 'bg-teal-500',
    tag: 'bg-teal-100 text-teal-600', // Couleur pâle pour les tags bodypart
  },
};

// Configuration pour la navigation (desktop et mobile)
export const CATEGORY_NAV_CONFIG: Record<ExerciceCategory, {
  activeClasses: string;
  inactiveClasses: string;
  dotColor: string;
}> = {
  LOWER_BODY: {
    activeClasses: 'bg-blue-600 text-white border-blue-600',
    inactiveClasses: 'bg-white text-gray-600 border-blue-300 hover:border-blue-400',
    dotColor: 'bg-blue-500',
  },
  UPPER_BODY: {
    activeClasses: 'bg-orange-600 text-white border-orange-600',
    inactiveClasses: 'bg-white text-gray-600 border-orange-300 hover:border-orange-400',
    dotColor: 'bg-orange-500',
  },
  STRETCHING: {
    activeClasses: 'bg-purple-600 text-white border-purple-600',
    inactiveClasses: 'bg-white text-gray-600 border-purple-300 hover:border-purple-400',
    dotColor: 'bg-purple-500',
  },
  CORE: {
    activeClasses: 'bg-teal-600 text-white border-teal-600',
    inactiveClasses: 'bg-white text-gray-600 border-teal-300 hover:border-teal-400',
    dotColor: 'bg-teal-500',
  },
};

// Configuration pour la navigation mobile (avec border-top)
export const CATEGORY_MOBILE_CONFIG: Record<ExerciceCategory | 'ALL', {
  label: string;
  icon: string;
  href: string;
  activeClasses: string;
  inactiveClasses: string;
}> = {
  ALL: {
    label: 'Tout',
    icon: '🏠',
    href: '/',
    activeClasses: 'bg-gray-800 text-white border-t-2 border-gray-800',
    inactiveClasses: 'bg-white text-gray-600 border-t-2 border-gray-200',
  },
  LOWER_BODY: {
    label: 'Bas',
    icon: '🦵',
    href: '/exercices/lower_body',
    activeClasses: 'bg-blue-600 text-white border-t-2 border-blue-600',
    inactiveClasses: 'bg-white text-gray-600 border-t-2 border-blue-300',
  },
  UPPER_BODY: {
    label: 'Haut',
    icon: '💪',
    href: '/exercices/upper_body',
    activeClasses: 'bg-orange-600 text-white border-t-2 border-orange-600',
    inactiveClasses: 'bg-white text-gray-600 border-t-2 border-orange-300',
  },
  STRETCHING: {
    label: 'Étirer',
    icon: '🧘',
    href: '/exercices/stretching',
    activeClasses: 'bg-purple-600 text-white border-t-2 border-purple-600',
    inactiveClasses: 'bg-white text-gray-600 border-t-2 border-purple-300',
  },
  CORE: {
    label: 'Tronc',
    icon: '🤸',
    href: '/exercices/core',
    activeClasses: 'bg-teal-600 text-white border-t-2 border-teal-600',
    inactiveClasses: 'bg-white text-gray-600 border-t-2 border-teal-300',
  },
};

// Liste des bodyparts disponibles
export const AVAILABLE_BODYPARTS = [
  'Jambes',
  'Bassin',
  'Bras',
  'Mains',
  'Épaules',
  'Dos',
  'Nuque / Cervicales',
  'Pied',
  'Fessier',
  'Corps',
] as const;

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

