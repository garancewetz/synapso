import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';
import { getInitialAuthData } from '@/app/lib/auth-server';
import { getExercices } from '@/app/features/exercices/api';
import { getProgress } from '@/app/features/progress/api';
import { getJournalNotes } from '@/app/features/journal/api';
import { queryKeys } from '@/app/lib/query-keys';
import { HomeClient } from './HomeClient';

// ⚡ STREAMING SSR: page server qui prefetch les données critiques en parallèle.
// Les hooks client (useExercices, useProgress, useJournalNotes) trouvent les données
// dans le cache TanStack Query au mount → pas de waterfall réseau après l'auth.
export default async function HomePage() {
  const initial = await getInitialAuthData();
  const effectiveUser = initial.impersonatedUser ?? initial.user;

  // Pas connecté → SiteProtection affichera l'AuthScreen, pas besoin de prefetch
  if (!effectiveUser) {
    return <HomeClient />;
  }

  const userId = effectiveUser.id;
  const resetFrequency = effectiveUser.resetFrequency ?? 'DAILY';

  const queryClient = new QueryClient();

  // Filters identiques à ceux générés par useExercices côté client (Home appelle avec includeArchived: true)
  const exercicesFilters = {
    includeArchived: true,
    resetFrequency,
  };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.exercices.list(exercicesFilters),
      queryFn: () => getExercices({ userId, includeArchived: true, resetFrequency }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.progress.list({}),
      queryFn: () => getProgress({ userId }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.journalNotes.list(),
      queryFn: () => getJournalNotes({ userId }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient />
    </HydrationBoundary>
  );
}
