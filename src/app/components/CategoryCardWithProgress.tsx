'use client';

import Link from 'next/link';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { Exercice } from '@/app/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_HREFS } from '@/app/constants/exercice.constants';

interface CategoryCardWithProgressProps {
  category: ExerciceCategory;
  exercices: Exercice[];
  /** Nombre d'exercices complétés dans la période */
  completedCount: number;
}

/**
 * Carte de catégorie avec jauge de progression intégrée
 * Design optimisé pour les personnes post-AVC :
 * - Grande zone de clic
 * - Icône visuelle claire
 * - Progression visible directement
 */
export default function CategoryCardWithProgress({ 
  category, 
  exercices, 
  completedCount 
}: CategoryCardWithProgressProps) {
  const categoryExercices = exercices.filter(e => e.category === category);
  const total = categoryExercices.length;
  
  const categoryStyle = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];
  const label = CATEGORY_LABELS[category];
  const href = CATEGORY_HREFS[category];

  // Calculer le pourcentage de progression
  const percentage = total > 0 ? Math.min((completedCount / total) * 100, 100) : 0;

  return (
    <Link 
      href={href}
      aria-label={`${label} - ${completedCount}/${total} exercices complétés`}
      className={`
        block rounded-2xl border-2 transition-all duration-200 overflow-hidden
        ${categoryStyle.bg} ${categoryStyle.border} 
        hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${categoryStyle.focusRing}
      `}
    >
      {/* Contenu principal */}
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Icône */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center bg-white/60">
            <span className="text-3xl md:text-4xl w-8 h-8 md:w-10 md:h-10 flex items-center justify-center" role="img" aria-hidden="true">
              {icon}
            </span>
          </div>
          
          {/* Textes */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-base md:text-lg font-bold ${categoryStyle.text} truncate`}>
              {label}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {total} exercice{total > 1 ? 's' : ''}
            </p>
          </div>

          {/* Badge de progression */}
          <div className={`
            flex-shrink-0 px-3 py-1.5 rounded-full font-bold text-sm
            ${completedCount > 0 
              ? `${categoryStyle.accent} text-white`
              : 'bg-gray-200 text-gray-500'
            }
          `}>
            {completedCount} / {total}
          </div>
        </div>
      </div>

      {/* Jauge de progression arrondie en bas */}
      <div className="px-4 pb-4">
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${categoryStyle.accent}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

