import type { HistoryEntry } from '@/app/types';
import { formatHistoryForApi, type getHistory } from '@/app/features/historique/api/getHistory';
// Import direct (pas via le barrel) : éviter d'embarquer HomePinnedTab et autres
// hooks client non-marqués 'use client' dans le contexte server.
import { WelcomeHeaderWrapper } from '@/app/features/home/components/WelcomeHeaderWrapper';

type Props = {
  // Promise lancée depuis page.tsx → permet d'attaquer les 2 fetches (history +
  // exercices) en parallèle dès que l'auth est résolue.
  historyPromise: ReturnType<typeof getHistory>;
};

// ⚡ STREAMING SSR: await la promise déjà en vol côté page.tsx, formate, puis
// passe la donnée à WelcomeHeaderWrapper via initialHistory.
export async function WelcomeHeaderSection({ historyPromise }: Props) {
  const rawHistory = await historyPromise;
  const history = formatHistoryForApi(rawHistory);

  // Le format API match HistoryEntry au runtime (l'API endpoint renvoie le même shape).
  return <WelcomeHeaderWrapper initialHistory={history as unknown as HistoryEntry[]} />;
}
