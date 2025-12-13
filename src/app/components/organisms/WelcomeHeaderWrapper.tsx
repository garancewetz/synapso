'use client';

import { usePathname } from 'next/navigation';
import WelcomeHeader from '@/app/components/molecules/WelcomeHeader';
import { useUser } from '@/contexts/UserContext';
import { useTodayCompletedCount } from '@/hooks/useTodayCompletedCount';
import { USE_MOCK_DATA } from '@/datas/mockExercices';

export default function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { currentUser } = useUser();
  const completedToday = useTodayCompletedCount();
  const displayName = USE_MOCK_DATA ? "Calypso" : (currentUser?.name || "");

  // Ne pas afficher sur les pages d'ajout/édition d'exercice
  const hideOnPages = ['/exercice/add', '/exercice/edit', '/aphasie/add', '/aphasie/edit'];
  const shouldHide = hideOnPages.some(path => pathname?.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4">
      <WelcomeHeader
        userName={displayName}
        completedToday={completedToday}
      />
    </div>
  );
}

