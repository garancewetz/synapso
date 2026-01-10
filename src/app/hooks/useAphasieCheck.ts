import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';

export function useAphasieCheck() {
  const router = useRouter();
  const { effectiveUser } = useUser();

  const hasAccess = effectiveUser?.isAphasic ?? false;

  useEffect(() => {
    if (effectiveUser && !hasAccess) {
      router.push('/');
    }
  }, [effectiveUser, hasAccess, router]);

  return {
    hasAccess,
    isLoading: !effectiveUser,
  };
}

