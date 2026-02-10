'use client';

import type { PropsWithChildren } from 'react';
import dynamic from 'next/dynamic';
import { NavBar } from '@/app/components/NavBar';
import { BottomNavBar } from '@/app/components/BottomNavBar';
import { SelectedDateBanner } from '@/app/components/SelectedDateBanner';
import { TimeMachineWrapper } from '@/app/components/TimeMachineWrapper';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { isToday } from 'date-fns';
import clsx from 'clsx';

// ⚡ PERFORMANCE: Lazy load des composants non critiques
const TimeMachineTransition = dynamic(
  () => import('@/app/components/TimeMachineTransition').then(mod => ({ default: mod.TimeMachineTransition })),
  { ssr: false }
);

const DayDetailModalWrapper = dynamic(
  () => import('@/app/components/DayDetailModalWrapper').then(mod => ({ default: mod.DayDetailModalWrapper })),
  { ssr: false }
);

const GlobalCelebration = dynamic(
  () => import('@/app/components/GlobalCelebration').then(mod => ({ default: mod.GlobalCelebration })),
  { ssr: false }
);

type LayoutComponentsProps = PropsWithChildren;

export function LayoutComponents({ children }: LayoutComponentsProps) {
  const { selectedDate, isDateSelected } = useSelectedDate();
  
  // ⚡ FIX: Ajouter un padding-top au main quand la bannière est visible
  // pour éviter que le contenu soit caché sous la bannière fixed
  const isBannerVisible = isDateSelected && selectedDate && !isToday(selectedDate);
  
  return (
    <>
      <TimeMachineTransition />
      <TimeMachineWrapper>
        <SelectedDateBanner />
        <NavBar />
        <main className={clsx(
          'flex-1 mx-auto w-full max-w-9xl pb-24 md:pb-8',
          // ⚡ FIX: Ajouter un padding-top quand la bannière est visible
          // La bannière fait environ 70-80px de hauteur, on utilise pt-20 (80px) pour mobile et pt-24 (96px) pour desktop
          isBannerVisible && 'pt-20 sm:pt-24'
        )}>
          {children}
        </main>
        <BottomNavBar />
      </TimeMachineWrapper>
      <DayDetailModalWrapper />
      <GlobalCelebration />
    </>
  );
}
