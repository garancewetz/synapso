'use client';

import Link from 'next/link';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { Exercice } from '@/app/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_HREFS } from '@/app/constants/exercice.constants';

interface CategoryCardProps {
  category: ExerciceCategory;
  exercices: Exercice[];
}

export default function CategoryCard({ category, exercices }: CategoryCardProps) {
  const categoryExercices = exercices.filter(e => e.category === category);
  const total = categoryExercices.length;
  
  const categoryStyle = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];
  const label = CATEGORY_LABELS[category];
  const href = CATEGORY_HREFS[category];

  return (
    <Link 
      href={href}
      aria-label={`${label} - ${total} ${total === 1 ? 'exercice' : 'exercices'}`}
      className={`
        block p-3 md:p-6 rounded-xl border-2 transition-all duration-200
        ${categoryStyle.bg} ${categoryStyle.border} 
        hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${categoryStyle.focusRing}
      `}
    >
      <div className="flex flex-col items-center text-center gap-1.5 md:gap-3">
        <span 
          className="text-3xl md:text-6xl w-8 h-8 md:w-14 md:h-14 flex items-center justify-center" 
          role="img" 
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="space-y-0.5 md:space-y-1">
          <h3 className={`text-sm md:text-xl font-bold ${categoryStyle.text}`}>
            {label}
          </h3>
          <p className="text-xs md:text-base text-gray-700 font-medium">
            {total} {total === 1 ? 'exercice' : 'exercices'}
          </p>
        </div>
      </div>
    </Link>
  );
}

