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
      <a
        href="#main-content"
        className="fixed left-0 top-0 z-[200] -translate-y-full bg-gray-900 text-white px-4 py-3 rounded-br font-medium transition-transform focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
      >
        Aller au contenu
      </a>
      <TimeMachineTransition />
      <TimeMachineWrapper>
        <SelectedDateBanner />
        <NavBar />
        <main
          id="main-content"
          className={clsx(
            'flex-1 mx-auto w-full max-w-[90rem] pb-24 md:pb-8 lg:bg-white lg:shadow-sm',
          )}
        >
          {children}
        </main>
        <BottomNavBar />
      </TimeMachineWrapper>
      <DayDetailModalWrapper />
      <GlobalCelebration />
    </>
  );
}
