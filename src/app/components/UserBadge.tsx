'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';
import { useHandPreference } from '@/app/hooks/useHandPreference';

type Props = {
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Badge utilisateur connecté
 * Affiche l'avatar avec l'initiale, un indicateur de connexion,
 * et le nom de l'utilisateur (optionnel)
 */
export function UserBadge({ showName = true, size = 'md' }: Props) {
  const { effectiveUser, isAdmin, currentUser } = useUser();
  const { isLeftHanded } = useHandPreference();

  if (!effectiveUser) return null;

  // Déterminer si on est en mode impersonation
  const isImpersonating = isAdmin && currentUser?.id !== effectiveUser.id;

  // Tailles selon la prop size
  const sizeClasses = {
    sm: {
      avatar: 'w-8 h-8 text-sm',
      dot: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
      name: 'text-xs',
    },
    md: {
      avatar: 'w-9 h-9 text-sm',
      dot: 'w-3 h-3 -bottom-0.5 -right-0.5',
      name: 'text-sm',
    },
    lg: {
      avatar: 'w-11 h-11 text-base',
      dot: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
      name: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  // Couleur du badge selon le statut
  const badgeColors = isImpersonating
    ? 'from-purple-400 to-indigo-500' // Admin impersonnant
    : isAdmin
    ? 'from-amber-400 to-orange-500' // Admin connecté
    : 'from-teal-400 to-emerald-500'; // Utilisateur normal

  const initial = effectiveUser.name.charAt(0).toUpperCase();

  return (
    <Link
      href="/settings"
      className={clsx(
        'group flex items-center gap-2.5 px-2 py-1.5 rounded-xl cursor-pointer',
        'hover:bg-gray-50 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-400',
        isLeftHanded && 'flex-row-reverse'
      )}
      aria-label={`Connecté en tant que ${effectiveUser.name}. Accéder aux paramètres.`}
    >
      {/* Avatar avec initiale et indicateur de connexion */}
      <div className="relative">
        {/* Avatar */}
        <div
          className={clsx(
            sizes.avatar,
            'rounded-full flex items-center justify-center font-bold text-white',
            'bg-linear-to-br shadow-sm',
            badgeColors,
            'ring-2 ring-white',
            'group-hover:scale-105 group-hover:shadow-md transition-all duration-200'
          )}
        >
          {initial}
        </div>

        {/* Indicateur de connexion (point vert avec pulse) */}
        <span
          className={clsx(
            sizes.dot,
            'absolute rounded-full',
            'bg-emerald-500 ring-2 ring-white',
            'animate-pulse'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Nom et statut */}
      {showName && (
        <div className={clsx('flex flex-col', isLeftHanded && 'items-end')}>
          <span
            className={clsx(
              sizes.name,
              'font-medium text-gray-700 group-hover:text-gray-900 transition-colors',
              'leading-tight'
            )}
          >
            {effectiveUser.name}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium leading-tight flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isImpersonating ? 'Mode aperçu' : 'Connecté'}
          </span>
        </div>
      )}
    </Link>
  );
}

