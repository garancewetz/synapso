'use client';

import { TouchLink } from '@/app/components/TouchLink';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';
import { useHandPreference } from '@/app/hooks/useHandPreference';

type Props = {
  size?: 'sm' | 'md' | 'lg';
};

/**
 * Badge utilisateur connecté
 * Affiche l'avatar avec l'initiale, un indicateur de connexion,
 * et le nom de l'utilisateur (optionnel)
 */
export function UserBadge({ size = 'md' }: Props) {
  const { effectiveUser, isAdmin, currentUser } = useUser();
  const { isLeftHanded } = useHandPreference();

  if (!effectiveUser) return null;

  // Déterminer si on est en mode impersonation
  const isImpersonating = isAdmin && currentUser?.id !== effectiveUser.id;

  // Tailles selon la prop size
  const sizeClasses = {
    sm: {
      avatar: 'w-8 h-8 text-sm',
      name: 'text-xs',
    },
    md: {
      avatar: 'w-9 h-9 text-sm',
      name: 'text-sm',
    },
    lg: {
      avatar: 'w-11 h-11 text-base',
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
    <TouchLink
      href="/settings"
      className={clsx(
        'group flex items-center px-2 py-1 rounded-xl cursor-pointer',
        'hover:bg-gray-50 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-400',
        isLeftHanded && 'flex-row-reverse'
      )}
      aria-label={`Connecté en tant que ${effectiveUser.name}. Accéder aux paramètres.`}
    >
      {/* Avatar avec initiale */}
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
    </TouchLink>
  );
}

