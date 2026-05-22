import { subDays } from 'date-fns';
import type { HistoryEntry } from '@/app/types';
import { getHistory, formatHistoryForApi } from '@/app/features/historique/api';
// Import direct (pas via le barrel) : éviter d'embarquer HomePinnedTab et autres
// hooks client non-marqués 'use client' dans le contexte server.
import { WelcomeHeaderWrapper } from '@/app/features/home/components/WelcomeHeaderWrapper';

type Props = {
  userId: number;
};

// ⚡ STREAMING SSR: fetch les 40 derniers jours d'historique côté serveur
// et passe la donnée à WelcomeHeaderWrapper via initialHistory.
export async function WelcomeHeaderSection({ userId }: Props) {
  const since = subDays(new Date(), 40);
  const rawHistory = await getHistory({ userId, since });
  const history = formatHistoryForApi(rawHistory);

  // Le format API match HistoryEntry au runtime (l'API endpoint renvoie le même shape).
  return <WelcomeHeaderWrapper initialHistory={history as unknown as HistoryEntry[]} />;
}
