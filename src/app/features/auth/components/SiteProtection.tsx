'use client';

import { memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AuthScreen } from './AuthScreen';
import { InitialLoader } from '@/app/components/InitialLoader';
import { useUser } from '@/app/contexts/UserContext';
import type { ReactNode } from 'react';

const ConfettiExplosion = dynamic(
  () => import('@/app/features/exercices').then(mod => ({ default: mod.ConfettiExplosion })),
  { ssr: false, loading: () => null }
);

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

  if (userLoading) {
    return <InitialLoader confettiComponent={ConfettiExplosion} />;
  }

  if (!currentUser) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  return <>{children}</>;
});
