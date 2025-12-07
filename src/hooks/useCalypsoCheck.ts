import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export function useCalypsoCheck() {
  const router = useRouter();
  const { currentUser } = useUser();

  useEffect(() => {
    if (currentUser && currentUser.name !== 'Calypso') {
      router.push('/');
    }
  }, [currentUser, router]);

  return {
    isCalypso: currentUser?.name === 'Calypso',
    isLoading: !currentUser,
  };
}

