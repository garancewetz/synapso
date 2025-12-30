'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ExerciceCategory } from '@/app/types/exercice';
import { 
  CATEGORY_LABELS, 
  CATEGORY_ORDER, 
  CATEGORY_HREFS, 
  CATEGORY_NAV_CONFIG,
  CATEGORY_ICONS
} from '@/app/constants/exercice.constants';

interface CategoryTabsProps {
  counts: Record<ExerciceCategory, number>;
}

export default function CategoryTabs({ counts }: CategoryTabsProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="px-4 mb-6">
      {/* Container - flex sur desktop */}
      <div className="flex flex-wrap justify-center gap-2">
        {/* Icône maison pour la page d'accueil */}
        <Link
          href="/"
          aria-label="Page d'accueil"
          className={`
            flex items-center justify-center px-4 py-3 rounded-lg border-2 
            font-medium transition-all duration-200
            ${isHomePage
              ? 'bg-gray-800 !text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <span className="text-xl">🏠</span>
        </Link>

        {/* Liens de catégorie */}
        {CATEGORY_ORDER.map((category) => {
          const config = CATEGORY_NAV_CONFIG[category];
          const href = CATEGORY_HREFS[category];
          const icon = CATEGORY_ICONS[category];
          const isActive = pathname === href;
          const count = counts[category] || 0;

          return (
            <Link
              key={category}
              href={href}
              className={`
                flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg border-2 
                font-medium transition-all duration-200 cursor-pointer
                ${isActive ? config.activeClasses : config.inactiveClasses}
              `}
            >
              <span className="text-xl w-5 h-5 flex items-center justify-center">{icon}</span>
              <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>{CATEGORY_LABELS[category]}</span>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
