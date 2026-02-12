'use client';

import type { PropsWithChildren } from 'react';
import dynamic from 'next/dynamic';
import { NavBar } from '@/app/components/NavBar';
import { BottomNavBar } from '@/app/components/BottomNavBar';
import { SelectedDateBanner, TimeMachineWrapper, TimeMachineTransition } from '@/app/features/time-machine';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { isToday } from 'date-fns';
import clsx from 'clsx';

const DayDetailModalWrapper = dynamic(
  () => import('@/app/features/historique').then(mod => ({ default: mod.DayDetailModalWrapper })),
  { ssr: false }
);

const GlobalCelebration = dynamic(
  () => import('@/app/features/exercices').then(mod => ({ default: mod.GlobalCelebration })),
  { ssr: false }
);

type LayoutComponentsProps = PropsWithChildren;

export function LayoutComponents({ children }: LayoutComponentsProps) {

  return (
    <>
      <TimeMachineTransition />
      <TimeMachineWrapper>
        <SelectedDateBanner />
        <NavBar />
        <main className={clsx(
          'flex-1 mx-auto w-full max-w-9xl pb-24 md:pb-8',
        
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
