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
  
  const categories: (ExerciceCategory | 'ALL')[] = ['ALL', ...CATEGORY_ORDER];

  const isActive = (category: ExerciceCategory | 'ALL') => {
    const config = CATEGORY_MOBILE_CONFIG[category];
    return pathname === config.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
      <div className="p-1.5">
        <div className="grid grid-cols-5 gap-0.5">
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
