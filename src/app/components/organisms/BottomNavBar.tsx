'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ExerciceCategory } from '@/types/exercice';
import { 
  CATEGORY_ORDER, 
  CATEGORY_MOBILE_CONFIG 
} from '@/app/constants/exercice.constants';

export default function BottomNavBar() {
  const pathname = usePathname();
  
  const categories = CATEGORY_ORDER;

  const isActive = (category: ExerciceCategory) => {
    const config = CATEGORY_MOBILE_CONFIG[category];
    return pathname === config.href;
  };

  const isHomeActive = pathname === '/';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
      <div className="">
        <div className="grid grid-cols-5 gap-0.5">
          {/* Icône maison pour la page d'accueil */}
          <Link
            href="/"
            className={`
              flex flex-col items-center justify-center gap-0.5 px-2 py-2
              font-medium text-xs transition-all duration-200 active:scale-95
              ${isHomeActive 
                ? 'bg-gray-800 text-white border-t-2 border-gray-800' 
                : 'bg-white text-gray-600 border-t-2 border-gray-200'
              }
            `}
          >
            <span className="text-lg">🏠</span>
          </Link>

          {/* Catégories */}
          {categories.map((category) => {
            const config = CATEGORY_MOBILE_CONFIG[category];
            const active = isActive(category);

            return (
              <Link
                key={category}
                href={config.href}
                className={`
                  flex flex-col items-center justify-center gap-0.5 px-2 py-2
                  font-medium text-xs transition-all duration-200 active:scale-95
                  ${active ? config.activeClasses : config.inactiveClasses}
                `}
              >
                <span className="text-lg">{config.icon}</span>
                <span className={active ? 'text-white' : ''}>{config.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
