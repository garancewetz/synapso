'use client';

import { useCallback } from 'react';
import { AdminUserSwitcher } from '@/app/components/AdminUserSwitcher';
import { useUser } from '@/app/contexts/UserContext';
import type { ReactNode } from 'react';

type ProtectionComponentProps = {
  onAuthSuccess: () => void;
  children: ReactNode;
};

type Props = {
  children: ReactNode;
  protectionComponent: React.ComponentType<ProtectionComponentProps>;
};

/**
 * Wrapper qui connecte la protection (fournie par le layout) et UserContext
 */
export function AuthWrapper({ children, protectionComponent: Protection }: Props) {
  const { refreshUser } = useUser();

  const handleAuthSuccess = useCallback(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <Protection onAuthSuccess={handleAuthSuccess}>
      <AdminUserSwitcher />
      {children}
    </Protection>
  );
}
