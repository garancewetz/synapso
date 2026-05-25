import type { Exercice } from '@/app/types/exercice';
import type { getExercices } from '@/app/features/exercices/api';
import { HomeExercicesView } from './HomeExercicesView';

type Props = {
  // Promise lancée depuis page.tsx → fetch en parallèle de history.
  exercicesPromise: ReturnType<typeof getExercices>;
};

// ⚡ STREAMING SSR: server component qui await la promise déjà en vol et passe
// la donnée à HomeExercicesView via initialData.
export async function ExercicesSection({ exercicesPromise }: Props) {
  const exercices = await exercicesPromise;

  // Cast nécessaire : Prisma type `media` comme JsonValue, alors que le type métier
  // Exercice attend `MediaData | null`. Au runtime, le shape est identique à ce que
  // l'API endpoint renvoie (et que `fetchExercices` reçoit).
  return <HomeExercicesView initialExercices={exercices as unknown as Exercice[]} />;
}
