'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ExerciceCategory } from '@/types/exercice';
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
  const totalCount = CATEGORY_ORDER.reduce((sum, cat) => sum + (counts[cat] || 0), 0);

  // Déterminer si on est sur la page d'accueil
  const isHomePage = pathname === '/';

  return (
    <div className="hidden md:block px-4 mb-6">
      {/* Container - flex sur desktop */}
      <div className="flex flex-wrap justify-center gap-2">
        {/* Lien "Tous" */}
        <Link
          href="/"
          className={`
            flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 
            font-medium text-sm transition-all duration-200
            ${isHomePage
              ? 'bg-gray-800 !text-white border-gray-800'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <span>Tous</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            isHomePage ? 'bg-gray-600' : 'bg-gray-100'
          }`}>
            {totalCount}
          </span>
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
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 
                font-medium text-sm transition-all duration-200 cursor-pointer
                ${isActive ? config.activeClasses : config.inactiveClasses}
              `}
            >
              <span className="text-base">{icon}</span>
              <span className={`text-xs ${isActive ? 'text-white' : ''}`}>{CATEGORY_LABELS[category]}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100'
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
