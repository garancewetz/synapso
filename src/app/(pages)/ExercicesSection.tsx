import type { Exercice } from '@/app/types/exercice';
import { getExercices } from '@/app/features/exercices/api';
import { HomeExercicesView } from './HomeExercicesView';

type Props = {
  userId: number;
  resetFrequency: 'DAILY' | 'WEEKLY';
};

// ⚡ STREAMING SSR: server component qui fetch les exercices et passe la donnée
// directement à HomeExercicesView via initialData (pas de cache hydration → pas
// de risque de mismatch query keys).
export async function ExercicesSection({ userId, resetFrequency }: Props) {
  const exercices = await getExercices({
    userId,
    includeArchived: true,
    resetFrequency,
  });

  // Cast nécessaire : Prisma type `media` comme JsonValue, alors que le type métier
  // Exercice attend `MediaData | null`. Au runtime, le shape est identique à ce que
  // l'API endpoint renvoie (et que `fetchExercices` reçoit).
  return <HomeExercicesView initialExercices={exercices as unknown as Exercice[]} />;
}
