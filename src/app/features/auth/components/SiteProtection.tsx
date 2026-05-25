'use client';

import { memo, useCallback } from 'react';
import { AuthScreen } from './AuthScreen';
import { AppShellSkeleton } from '@/app/components/AppShellSkeleton';
import { useUser } from '@/app/contexts/UserContext';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onAuthSuccess?: () => void;
};

export const SiteProtection = memo(function SiteProtection({ children, onAuthSuccess }: Props) {
  const { currentUser, loading: userLoading, refreshUser } = useUser();

  const handleAuthSuccess = useCallback(async () => {
    await refreshUser();
    onAuthSuccess?.();
  }, [refreshUser, onAuthSuccess]);

  // ⚡ FAST FIRST PAINT: avec initialData SSR (UserContext), userLoading est false
  // dès le premier rendu. Le skeleton ne s'affiche que lors d'un refetch tardif,
  // jamais au boot — donc pas de flash loader.
  if (userLoading) {
    return <AppShellSkeleton />;
  }

  if (!currentUser) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  return <>{children}</>;
});
