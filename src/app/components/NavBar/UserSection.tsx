'use client';

import type { User } from '@/app/types';
import { TouchLink } from '@/app/components/TouchLink';
import { SettingsIcon } from '@/app/components/ui/icons';
import { useUser } from '@/app/contexts/UserContext';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import clsx from 'clsx';

type Props = {
  effectiveUser: User | null;
};

/**
 * Carte de l'utilisateur actuel avec lien vers les paramètres
 */
export function UserSection({ effectiveUser }: Props) {
  const { isAdmin, currentUser } = useUser();
  const { isLeftHanded } = useHandPreference();

  if (!effectiveUser) {
    return null;
  }

  // Déterminer si on est en mode impersonation
  const isImpersonating = isAdmin && currentUser?.id !== effectiveUser.id;
  
  // Couleur du badge selon le statut
  const badgeColors = isImpersonating
    ? 'from-purple-400 to-indigo-500' // Admin impersonnant
    : isAdmin
    ? 'from-amber-400 to-orange-500' // Admin connecté
    : 'from-teal-400 to-emerald-500'; // Utilisateur normal
  
  const initial = effectiveUser.name.charAt(0).toUpperCase();

  return (
    <TouchLink
      href="/settings"
      className={clsx(
        'bg-gray-50 rounded-lg p-3 border-2 border-gray-200',
        'hover:bg-gray-100 hover:border-gray-300 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-400'
      )}
      aria-label={`Connecté en tant que ${effectiveUser.name}. Accéder aux paramètres.`}
    >
      <div className={clsx(
        'flex items-center gap-3',
        isLeftHanded && 'flex-row-reverse'
      )}>
        {/* Avatar avec initiale */}
        <div
          className={clsx(
            'w-10 h-10 text-sm',
            'rounded-full flex items-center justify-center font-bold text-white',
            'bg-linear-to-br shadow-sm',
            badgeColors,
            'ring-2 ring-white shrink-0'
          )}
        >
          {initial}
        </div>
        <div className={clsx(
          'flex-1 min-w-0',
          'flex flex-col',
          isLeftHanded && 'items-end'
        )}>
          <p className="text-sm font-semibold text-gray-900 truncate">{effectiveUser.name}</p>
          <div className={clsx(
            'flex items-center gap-1 mt-0.5',
            isLeftHanded && 'flex-row-reverse'
          )}>
            <SettingsIcon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="text-xs text-gray-500">Mon profil</span>
          </div>
        </div>
      </div>
    </TouchLink>
  );
}
