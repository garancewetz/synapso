'use client';

import type { User } from '@/app/types';

type Props = {
  effectiveUser: User | null;
};

/**
 * Carte de l'utilisateur actuel
 */
export function UserSection({ effectiveUser }: Props) {
  if (!effectiveUser) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0 bg-gray-200 text-gray-700">
          {effectiveUser.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{effectiveUser.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">Utilisateur actif</p>
        </div>
      </div>
    </div>
  );
}
