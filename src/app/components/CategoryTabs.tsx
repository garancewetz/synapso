'use client';

import { usePathname } from 'next/navigation';
import { ExerciceCategory } from '@/app/types/exercice';
import { 
  CATEGORY_LABELS, 
  CATEGORY_ORDER, 
  CATEGORY_HREFS, 
  CATEGORY_ICONS
} from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { TouchLink } from '@/app/components/TouchLink';
import { useSlidingIndicator } from '@/app/hooks/useSlidingIndicator';

type Props = {
  counts: Record<ExerciceCategory, number>;
};

export function CategoryTabs({ counts }: Props) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Créer un tableau avec toutes les tabs (home + categories)
  const allTabs = [
    { id: 'home', href: '/' },
    ...CATEGORY_ORDER.map((category) => ({ id: category, href: CATEGORY_HREFS[category] }))
  ];

  // Trouver l'index actif
  const activeTabIndex = allTabs.findIndex((tab) => tab.href === pathname);

  // Utiliser le hook pour l'animation de glissement horizontal
  const { itemsRef: tabsRef, indicatorStyle, isReady } = useSlidingIndicator(
    activeTabIndex,
    'horizontal'
  );

  return (
    <div className="px-4 mb-6">
      {/* Container - flex sur desktop avec position relative pour l'animation */}
      <div className="relative flex flex-wrap justify-center gap-2">
        {/* Élément de fond qui glisse */}
        <span
          className="absolute -z-10 flex overflow-hidden rounded-lg transition-all duration-300 ease-out pointer-events-none"
          style={{ 
            ...indicatorStyle,
            top: 0,
            height: '100%',
            opacity: isReady ? 1 : 0,
            transitionProperty: 'left, width, top, height, opacity'
          }}
        >
          <span className="h-full w-full rounded-lg bg-gray-800 border-2 border-gray-800 shadow-sm" />
        </span>

        {/* Icône maison pour la page d'accueil */}
        <TouchLink
          href="/"
          aria-label="Page d'accueil"
          ref={(el) => { tabsRef.current[0] = el; }}
          className={`
            flex items-center justify-center px-4 py-3 rounded-lg border-2 
            font-medium transition-colors duration-200
            ${isHomePage
              ? 'text-white! border-transparent'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <span className="text-xl">{NAVIGATION_EMOJIS.HOME}</span>
        </TouchLink>

        {/* Liens de catégorie */}
        {CATEGORY_ORDER.map((category, index) => {
          const href = CATEGORY_HREFS[category];
          const icon = CATEGORY_ICONS[category];
          const isActive = pathname === href;
          const count = counts[category] || 0;
          const tabIndex = index + 1; // +1 car home est à l'index 0

          return (
            <TouchLink
              key={category}
              href={href}
              ref={(el) => { tabsRef.current[tabIndex] = el; }}
              className={`
                flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg border-2 
                font-medium transition-colors duration-200 cursor-pointer
                ${isActive 
                  ? 'text-white! border-transparent' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <span className="text-xl w-5 h-5 flex items-center justify-center">{icon}</span>
              <span className="text-sm font-semibold">{CATEGORY_LABELS[category]}</span>
              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                {count}
              </span>
            </TouchLink>
          );
        })}
      </div>
    </div>
  );
}
