'use client';

import { ExerciceCategory, CATEGORY_LABELS } from '@/types/exercice';

interface CategoryTabsProps {
  activeCategory: ExerciceCategory | null;
  onCategoryChange: (category: ExerciceCategory | null) => void;
  counts: Record<ExerciceCategory, number>;
}

// Emojis et couleurs pour chaque catégorie
const CATEGORY_CONFIG: Record<ExerciceCategory, { 
  icon: string;
  activeClasses: string;
  inactiveClasses: string;
  dotColor: string;
}> = {
  LOWER_BODY: {
    icon: '🦵',
    activeClasses: 'bg-blue-600 text-white border-blue-600',
    inactiveClasses: 'bg-white text-gray-600 border-blue-300 hover:border-blue-400',
    dotColor: 'bg-blue-500',
  },
  UPPER_BODY: {
    icon: '💪',
    activeClasses: 'bg-orange-600 text-white border-orange-600',
    inactiveClasses: 'bg-white text-gray-600 border-orange-300 hover:border-orange-400',
    dotColor: 'bg-orange-500',
  },
  STRETCHING: {
    icon: '🧘',
    activeClasses: 'bg-purple-600 text-white border-purple-600',
    inactiveClasses: 'bg-white text-gray-600 border-purple-300 hover:border-purple-400',
    dotColor: 'bg-purple-500',
  },
};

export default function CategoryTabs({ activeCategory, onCategoryChange, counts }: CategoryTabsProps) {
  const categories: ExerciceCategory[] = ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING'];
  const totalCount = categories.reduce((sum, cat) => sum + (counts[cat] || 0), 0);

  return (
    <div className="px-4 mb-6">
      {/* Container - grille 2x2 sur mobile, flex sur desktop */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
        {/* Bouton "Tous" */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`
            flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 
            font-medium text-sm transition-all duration-200
            ${activeCategory === null
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <span>Tous</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            activeCategory === null ? 'bg-gray-600' : 'bg-gray-100'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Boutons de catégorie */}
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category];
          const isActive = activeCategory === category;
          const count = counts[category] || 0;

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 
                font-medium text-sm transition-all duration-200 cursor-pointer
                ${isActive ? config.activeClasses : config.inactiveClasses}
              `}
            >
              <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
              <span className="text-xs">{CATEGORY_LABELS[category]}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isActive ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
