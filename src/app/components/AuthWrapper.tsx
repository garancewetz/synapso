'use client';

import { useCallback } from 'react';
import { SiteProtection } from '@/app/components/SiteProtection';
import { AdminUserSwitcher } from '@/app/components/AdminUserSwitcher';
import { useUser } from '@/app/contexts/UserContext';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

/**
 * Wrapper qui connecte SiteProtection et UserContext
 * Permet une communication sécurisée sans événements window
 */
export function AuthWrapper({ children }: Props) {
  const { refreshUser } = useUser();

  const handleAuthSuccess = useCallback(() => {
    // Recharger l'utilisateur après authentification réussie
    refreshUser();
  }, [refreshUser]);

  return (
    <SiteProtection onAuthSuccess={handleAuthSuccess}>
      <AdminUserSwitcher />
      {children}
    </SiteProtection>
  );
}
