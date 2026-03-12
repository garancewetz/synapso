'use client';

import { Card } from '@/app/components/ui/Card';
import { useLayoutContext } from '@/app/contexts/LayoutContext';
import type { NavMenuType } from '@/app/constants/settings.constants';
import clsx from 'clsx';

const MENU_OPTIONS: { value: NavMenuType; label: string }[] = [
  { value: 'category', label: 'Menu catégorie' },
  { value: 'slide', label: 'Menu slide' },
];

export function SettingsMenuCategorySection() {
  const { navMenuType, setNavMenuType } = useLayoutContext();

  return (
    <Card variant="default" padding="md">
      <label className="block text-base font-semibold text-gray-800 mb-2">
        Type de menu
      </label>
      <p className="text-sm text-gray-500 mb-4">
        Menu catégorie : les catégories (Haut du corps, Jambes, etc.) sont directement dans la barre. Menu slide : barre Accueil / Catégories / + / Journal / Suivi, un clic sur Catégories fait agrandir le menu et affiche les 5 catégories en dessous.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        {MENU_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setNavMenuType(opt.value)}
            className={clsx(
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all border-2',
              navMenuType === opt.value
                ? 'bg-amber-400 text-amber-950 border-amber-400 shadow-md'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
