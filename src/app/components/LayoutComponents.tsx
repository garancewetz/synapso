'use client';

import type { PropsWithChildren } from 'react';
import dynamic from 'next/dynamic';
import { NavBar } from '@/app/components/NavBar';
import { BottomNavBar } from '@/app/components/BottomNavBar';
import { SelectedDateBanner } from '@/app/components/SelectedDateBanner';
import { SelectedDateBannerSpacer } from '@/app/components/SelectedDateBannerSpacer';
import { TimeMachineWrapper } from '@/app/components/TimeMachineWrapper';

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
  return (
    <>
      <TimeMachineTransition />
      <TimeMachineWrapper>
        <SelectedDateBanner />
        <SelectedDateBannerSpacer />
        <NavBar />
        <main className="flex-1 mx-auto w-full max-w-9xl pb-24 md:pb-8">
          {children}
        </main>
        <BottomNavBar />
      </TimeMachineWrapper>
      <DayDetailModalWrapper />
      <GlobalCelebration />
    </>
  );
}
