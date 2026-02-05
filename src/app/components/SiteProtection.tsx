'use client';

import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { AuthScreen } from '@/app/components/AuthScreen';
import { InitialLoader } from '@/app/components/InitialLoader';
import { useUser } from '@/app/contexts/UserContext';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onAuthSuccess?: () => void;
};

const MIN_LOADING_DURATION = 2000; // 3 secondes minimum

/**
 * ⚡ PERFORMANCE: 
 * - Mémorisé avec React.memo pour éviter les re-renders inutiles
 * - Utilise uniquement UserContext pour l'authentification (suppression de la double vérification)
 */
export const SiteProtection = memo(function SiteProtection({ children, onAuthSuccess }: Props) {
  const { currentUser, loading: userLoading, refreshUser } = useUser();
  const [showLoader, setShowLoader] = useState(true);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    if (!userLoading) {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const remaining = Math.max(0, MIN_LOADING_DURATION - elapsed);
      
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [userLoading]);

  const handleAuthSuccess = useCallback(async () => {
    // Rafraîchir le contexte utilisateur pour synchroniser currentUser
    await refreshUser();
    onAuthSuccess?.();
  }, [refreshUser, onAuthSuccess]);

  // Afficher le loader pendant le chargement initial (minimum 3 secondes)
  if (showLoader || userLoading) {
    return <InitialLoader />;
  }

  // Si pas d'utilisateur, afficher l'écran d'authentification
  if (!currentUser) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  return <>{children}</>;
});
