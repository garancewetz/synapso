import type { ExerciceCategory } from '@/app/types/exercice';

// Ordre standardisé des catégories (utilisé partout dans l'application)
export const CATEGORY_ORDER: ExerciceCategory[] = ['UPPER_BODY', 'CORE', 'LOWER_BODY', 'STRETCHING'];

// Labels affichés pour chaque catégorie
export const CATEGORY_LABELS: Record<ExerciceCategory, string> = {
  UPPER_BODY: 'Haut du corps',
  LOWER_BODY: 'Bas du corps',
  STRETCHING: 'Étirement',
  CORE: 'Milieu du corps',
};

// Labels courts pour la navigation
export const CATEGORY_LABELS_SHORT: Record<ExerciceCategory, string> = {
  UPPER_BODY: 'Haut',
  LOWER_BODY: 'Bas',
  STRETCHING: 'Étirer',
  CORE: 'Milieu',
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
// 🤸 Teal = Milieu (gainage, force centrale, stabilité)
// ✅ Vert Émeraude réservé pour validation
export const CATEGORY_COLORS: Record<ExerciceCategory, { 
  bg: string; 
  border: string; 
  text: string; 
  accent: string; 
  tag: string;
  focusRing: string; // Classe pour le focus ring (accessibilité)
}> = {
  LOWER_BODY: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    accent: 'bg-blue-500',
    tag: 'bg-blue-100 text-blue-600', // Couleur pâle pour les tags bodypart
    focusRing: 'focus:ring-blue-500',
  },
  UPPER_BODY: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    accent: 'bg-orange-500',
    tag: 'bg-orange-100 text-orange-700', // Couleur pâle pour les tags bodypart
    focusRing: 'focus:ring-orange-500',
  },
  STRETCHING: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    accent: 'bg-purple-500',
    tag: 'bg-purple-100 text-purple-600', // Couleur pâle pour les tags bodypart
    focusRing: 'focus:ring-purple-500',
  },
  CORE: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    accent: 'bg-teal-500',
    tag: 'bg-teal-100 text-teal-600', // Couleur pâle pour les tags bodypart
    focusRing: 'focus:ring-teal-500',
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
export const CATEGORY_MOBILE_CONFIG: Record<ExerciceCategory, {
  label: string;
  icon: string;
  href: string;
  activeClasses: string;
  inactiveClasses: string;
}> = {
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
    label: 'Milieu',
    icon: '🤸',
    href: '/exercices/core',
    activeClasses: 'bg-teal-600 text-white border-t-2 border-teal-600',
    inactiveClasses: 'bg-white text-gray-600 border-t-2 border-teal-300',
  },
};

// Liste des bodyparts disponibles - organisée par catégorie mère
export const AVAILABLE_BODYPARTS = [
  // 💪 HAUT DU CORPS (Orange)
  'Bras',
  'Mains',
  'Épaules',
  'Cou & Nuque',
  // 🤸 MILIEU DU CORPS (Teal)
  'Dos',
  'Corps',
  'Bassin',
  // 🦵 BAS DU CORPS (Bleu)
  'Jambes',
  'Fessier',
  'Pied',
] as const;

// Association bodypart → catégorie mère (pour les statistiques et le code couleur)
export const BODYPART_TO_CATEGORY: Record<string, ExerciceCategory> = {
  // 💪 HAUT DU CORPS
  'Bras': 'UPPER_BODY',
  'Mains': 'UPPER_BODY',
  'Épaules': 'UPPER_BODY',
  'Cou & Nuque': 'UPPER_BODY',
  // 🤸 MILIEU DU CORPS
  'Dos': 'CORE',
  'Corps': 'CORE',
  'Bassin': 'CORE',
  // 🦵 BAS DU CORPS
  'Jambes': 'LOWER_BODY',
  'Fessier': 'LOWER_BODY',
  'Pied': 'LOWER_BODY',
  // Rétrocompatibilité (anciennes valeurs en base de données)
  'Epaules': 'UPPER_BODY',
  'Nuque / Cervicales': 'UPPER_BODY',
};

// Couleurs pour les bodyparts - teintées selon la catégorie mère
// Crée un lien visuel direct entre l'exercice et sa catégorie
export const BODYPART_COLORS: Record<string, string> = {
  // 💪 Famille HAUT (Orange)
  'Bras': 'bg-orange-50 text-orange-700',
  'Mains': 'bg-orange-50 text-orange-700',
  'Épaules': 'bg-orange-50 text-orange-700',
  'Cou & Nuque': 'bg-orange-50 text-orange-700',
  
  // 🤸 Famille MILIEU (Teal)
  'Dos': 'bg-teal-50 text-teal-700',
  'Corps': 'bg-teal-50 text-teal-700',
  'Bassin': 'bg-teal-50 text-teal-700',
  
  // 🦵 Famille BAS (Bleu)
  'Jambes': 'bg-blue-50 text-blue-700',
  'Fessier': 'bg-blue-50 text-blue-700',
  'Pied': 'bg-blue-50 text-blue-700',
  
  // Rétrocompatibilité (anciennes valeurs en base de données)
  'Epaules': 'bg-orange-50 text-orange-700',
  'Nuque / Cervicales': 'bg-orange-50 text-orange-700',
};

// Couleurs HEX pour les graphiques (charts) - alignées sur les catégories
export const CATEGORY_CHART_COLORS: Record<ExerciceCategory, string> = {
  LOWER_BODY: '#3B82F6',   // bleu
  UPPER_BODY: '#F97316',   // orange
  STRETCHING: '#8B5CF6',   // violet
  CORE: '#14B8A6',         // teal
};

// Icônes pour les bodyparts - organisées par catégorie mère
export const BODYPART_ICONS: Record<string, string> = {
  // 💪 HAUT DU CORPS
  'Bras': '💪',
  'Mains': '🖐️',
  'Épaules': '🏋️',
  'Cou & Nuque': '🦒',
  // 🤸 MILIEU DU CORPS
  'Dos': '🔙',
  'Corps': '🧍',
  'Bassin': '🦴',
  // 🦵 BAS DU CORPS
  'Jambes': '🦵',
  'Fessier': '🍑',
  'Pied': '🦶',
  // Rétrocompatibilité
  'Epaules': '🏋️',
  'Nuque / Cervicales': '🦒',
};