import { Suspense } from 'react';
import { getInitialAuthData } from '@/app/lib/auth-server';
import { HomeClient } from './HomeClient';
import { ExercicesSection } from './ExercicesSection';
import { HomeExercicesSkeleton } from './HomeExercicesSkeleton';
import { WelcomeHeaderSection } from './WelcomeHeaderSection';
import { WelcomeHeaderSkeleton } from './WelcomeHeaderSkeleton';

// ⚡ STREAMING SSR: la page n'attend QUE l'auth.
// - WelcomeHeader (heatmap + streak) stream via Suspense
// - Cards exercices stream via Suspense
// - Le shell (tabs, layout) part en premier
// - progress / journalNotes se chargent en lazy côté client (non critique)
export default async function HomePage() {
  const initial = await getInitialAuthData();
  const effectiveUser = initial.impersonatedUser ?? initial.user;

  if (!effectiveUser) {
    return <HomeClient />;
  }

  const userId = effectiveUser.id;
  const resetFrequency = effectiveUser.resetFrequency ?? 'DAILY';

  const welcomeHeaderSlot = (
    <Suspense fallback={<WelcomeHeaderSkeleton />}>
      <WelcomeHeaderSection userId={userId} />
    </Suspense>
  );

  const exercicesSlot = (
    <Suspense fallback={<HomeExercicesSkeleton />}>
      <ExercicesSection userId={userId} resetFrequency={resetFrequency} />
    </Suspense>
  );

  return (
    <HomeClient welcomeHeaderSlot={welcomeHeaderSlot} exercicesSlot={exercicesSlot} />
  );
}
