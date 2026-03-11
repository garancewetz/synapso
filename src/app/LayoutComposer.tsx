'use client';

import { useMemo, type PropsWithChildren } from 'react';
import dynamic from 'next/dynamic';
import { SelectedDateBanner, TimeMachineWrapper, TimeMachineTransition } from '@/app/features/time-machine';
import { usePreserveDateParam } from '@/app/features/time-machine';
import { usePendingShareCount } from '@/app/features/sharing';
import { NotificationBadge } from '@/app/features/sharing';
import { useExercices } from '@/app/features/exercices/hooks/useExercices';
import { LayoutProvider } from '@/app/contexts/LayoutContext';
import { NavBar } from '@/app/components/NavBar';
import { BottomNavBar } from '@/app/components/BottomNavBar';
import { CATEGORY_ORDER, CATEGORY_ORDER_NAV } from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';
import clsx from 'clsx';

const DayDetailModalWrapper = dynamic(
  () => import('@/app/features/historique').then(mod => ({ default: mod.DayDetailModalWrapper })),
  { ssr: false }
);

const GlobalCelebration = dynamic(
  () => import('@/app/features/exercices').then(mod => ({ default: mod.GlobalCelebration })),
  { ssr: false }
);

const WebVitals = dynamic(
  () => import('@/app/components/WebVitals').then(mod => ({ default: mod.WebVitals })),
  { ssr: false }
);

const PWARegister = dynamic(
  () => import('@/app/components/PWARegister').then(mod => ({ default: mod.PWARegister })),
  { ssr: false }
);

export function LayoutComposer({ children }: PropsWithChildren) {
  const preserveDate = usePreserveDateParam();
  const { count: pendingShareCount } = usePendingShareCount();
  const { exercices } = useExercices({ includeArchived: false });
  const navCategories = useMemo(() => ({
    forNav: CATEGORY_ORDER_NAV,
    forDesktop: CATEGORY_ORDER,
  }), []);
  const bottomNavCategories = useMemo(() => {
    const used = new Set(exercices.map((e) => e.category as ExerciceCategory));
    const ordered = CATEGORY_ORDER.filter((cat) => used.has(cat));
    return ordered.length > 0 ? ordered : CATEGORY_ORDER;
  }, [exercices]);
  const notificationBadge = <NotificationBadge className="absolute top-1/2 -translate-y-1/2 right-2" />;

  const timeMachineContent = (
    <>
      <SelectedDateBanner />
      <NavBar />
      <main
        id="main-content"
        className={clsx(
          'flex-1 mx-auto w-full max-w-10xl pb-28 md:pb-8 lg:bg-white',
        )}
      >
        {children}
      </main>
      <BottomNavBar categoriesToShow={bottomNavCategories} />
    </>
  );

  return (
    <LayoutProvider
      value={{
        preserveDate,
        pendingShareCount,
        notificationBadge,
        navCategories,
      }}
    >
      <WebVitals />
      <PWARegister />
      <a
        href="#main-content"
        className="fixed left-0 top-0 z-[200] -translate-y-full bg-gray-900 text-white px-4 py-3 rounded-br font-medium transition-transform focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
      >
        Aller au contenu
      </a>
      <TimeMachineTransition />
      <TimeMachineWrapper>
        {timeMachineContent}
      </TimeMachineWrapper>
      <DayDetailModalWrapper />
      <GlobalCelebration />
    </LayoutProvider>
  );
}
