'use client';

import { usePathname } from 'next/navigation';
import WelcomeHeader from '@/app/components/WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useTodayCompletedCount } from '@/app/hooks/useTodayCompletedCount';

export default function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { currentUser } = useUser();
  const completedToday = useTodayCompletedCount();
  const displayName = currentUser?.name || "";
  const resetFrequency = currentUser?.resetFrequency || null;

  // Ne pas afficher sur les pages d'ajout/édition d'exercice et sur l'historique
  const hideOnPages = ['/exercice/add', '/exercice/edit', '/aphasie/add', '/aphasie/edit', '/historique'];
  const shouldHide = hideOnPages.some(path => pathname?.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4">
      <WelcomeHeader
        userName={displayName}
        completedToday={completedToday}
        resetFrequency={resetFrequency}
      />
    </div>
  );
}
