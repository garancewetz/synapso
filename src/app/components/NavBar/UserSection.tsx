'use client';

import { CheckIcon } from '@/app/components/ui/icons';
import type { User } from '@/app/types';

type Props = {
  currentUser: User | null;
};

/**
 * Carte du user sélectionné affichée en haut du menu
 */
export function UserSection({ currentUser }: Props) {
  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border-2 border-emerald-200 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 bg-emerald-500 text-white shadow-sm">
          {currentUser.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{currentUser.name}</p>
          <p className="text-xs text-emerald-700 mt-0.5">Utilisateur actif</p>
        </div>
        <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
          <CheckIcon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

