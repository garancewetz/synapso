import { Suspense } from 'react';
import { subDays } from 'date-fns';
import { getInitialAuthData } from '@/app/lib/auth-server';
import { getHistory } from '@/app/features/historique/api';
import { getExercices } from '@/app/features/exercices/api';
import { HOME_HISTORY_PRELOAD_DAYS } from '@/app/features/home/constants/home.constants';
import { HomeClient } from './HomeClient';
import { ExercicesSection } from './ExercicesSection';
import { HomeExercicesSkeleton } from './HomeExercicesSkeleton';
import { WelcomeHeaderSection } from './WelcomeHeaderSection';
import { WelcomeHeaderSkeleton } from './WelcomeHeaderSkeleton';

// ⚡ STREAMING SSR maximisé:
// - L'auth est await (rapide, déjà cachée si déjà résolue côté layout)
// - Les 2 fetches data (history 7j + exercices) sont lancés en PARALLÈLE
//   immédiatement après l'auth, puis passés aux Sections via Promise
// - Chaque Section stream indépendamment via Suspense → skeletons individuels
export default async function HomePage() {
  const initial = await getInitialAuthData();
  const effectiveUser = initial.impersonatedUser ?? initial.user;

  if (!effectiveUser) {
    return <HomeClient />;
  }

  const userId = effectiveUser.id;
  const resetFrequency = effectiveUser.resetFrequency ?? 'DAILY';

  // ⚡ Kick-off des 2 fetches en parallèle (pas d'await ici → les promises sont
  // passées aux Suspense, qui les awaiteront pendant le streaming).
  const historyPromise = getHistory({
    userId,
    since: subDays(new Date(), HOME_HISTORY_PRELOAD_DAYS),
  });
  const exercicesPromise = getExercices({ userId, includeArchived: true, resetFrequency });

  const welcomeHeaderSlot = (
    <Suspense fallback={<WelcomeHeaderSkeleton />}>
      <WelcomeHeaderSection historyPromise={historyPromise} />
    </Suspense>
  );

  const exercicesSlot = (
    <Suspense fallback={<HomeExercicesSkeleton />}>
      <ExercicesSection exercicesPromise={exercicesPromise} />
    </Suspense>
  );

  return (
    <HomeClient welcomeHeaderSlot={welcomeHeaderSlot} exercicesSlot={exercicesSlot} />
  );
}
