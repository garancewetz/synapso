'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ExerciceCategory } from '@/types/exercice';

// Configuration des catégories avec couleurs et icônes
const CATEGORY_CONFIG: Record<ExerciceCategory | 'ALL', {
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
    activeClasses: 'bg-gray-800 text-white border-gray-800',
    inactiveClasses: 'bg-white text-gray-600 border-gray-200',
  },
  LOWER_BODY: {
    label: 'Bas',
    icon: '🦵',
    href: '/exercices/lower_body',
    activeClasses: 'bg-blue-600 text-white border-blue-600',
    inactiveClasses: 'bg-white text-gray-600 border-blue-300',
  },
  UPPER_BODY: {
    label: 'Haut',
    icon: '💪',
    href: '/exercices/upper_body',
    activeClasses: 'bg-orange-600 text-white border-orange-600',
    inactiveClasses: 'bg-white text-gray-600 border-orange-300',
  },
  STRETCHING: {
    label: 'Étirer',
    icon: '🧘',
    href: '/exercices/stretching',
    activeClasses: 'bg-purple-600 text-white border-purple-600',
    inactiveClasses: 'bg-white text-gray-600 border-purple-300',
  },
};

export default function BottomNavBar() {
  const pathname = usePathname();
  
  const categories: (ExerciceCategory | 'ALL')[] = ['ALL', 'UPPER_BODY', 'LOWER_BODY', 'STRETCHING'];

  const isActive = (category: ExerciceCategory | 'ALL') => {
    const config = CATEGORY_CONFIG[category];
    if (category === 'ALL') {
      return pathname === '/';
    }
    return pathname === config.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
      <div className="px-2 py-2">
        <div className="grid grid-cols-4 gap-1">
          {categories.map((category) => {
            const config = CATEGORY_CONFIG[category];
            const active = isActive(category);

            return (
              <Link
                key={category}
                href={config.href}
                className={`
                  flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-lg border-2
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
