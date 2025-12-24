'use client';

import { useCallback } from 'react';
import SiteProtection from '@/app/components/SiteProtection';
import { useUser } from '@/app/contexts/UserContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper qui connecte SiteProtection et UserContext
 * Permet une communication sécurisée sans événements window
 */
export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { refreshUsers } = useUser();

  const handleAuthSuccess = useCallback(() => {
    // Recharger les utilisateurs après authentification réussie
    // Le cookie est déjà disponible, pas besoin de retry
    refreshUsers();
  }, [refreshUsers]);

  return (
    <SiteProtection onAuthSuccess={handleAuthSuccess}>
      {children}
    </SiteProtection>
  );
}

