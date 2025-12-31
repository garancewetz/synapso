import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';

export function useAphasieCheck() {
  const router = useRouter();
  const { currentUser } = useUser();

  const hasAccess = currentUser?.isAphasic ?? false;

  useEffect(() => {
    if (currentUser && !hasAccess) {
      router.push('/');
    }
  }, [currentUser, hasAccess, router]);

  return {
    hasAccess,
    isLoading: !currentUser,
  };
}

