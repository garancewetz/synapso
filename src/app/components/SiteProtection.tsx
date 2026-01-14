'use client';

import { memo, useCallback } from 'react';
import { AuthScreen } from '@/app/components/AuthScreen';
import { InitialLoader } from '@/app/components/InitialLoader';
import { useUser } from '@/app/contexts/UserContext';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onAuthSuccess?: () => void;
};

/**
 * ⚡ PERFORMANCE: 
 * - Mémorisé avec React.memo pour éviter les re-renders inutiles
 * - Utilise uniquement UserContext pour l'authentification (suppression de la double vérification)
 */
export const SiteProtection = memo(function SiteProtection({ children, onAuthSuccess }: Props) {
  const { currentUser, loading: userLoading, refreshUser } = useUser();

  const handleAuthSuccess = useCallback(async () => {
    // Rafraîchir le contexte utilisateur pour synchroniser currentUser
    await refreshUser();
    onAuthSuccess?.();
  }, [refreshUser, onAuthSuccess]);

  // Afficher le loader pendant le chargement initial
  if (userLoading) {
    return <InitialLoader />;
  }

  // Si pas d'utilisateur, afficher l'écran d'authentification
  if (!currentUser) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  return <>{children}</>;
});
