import type { Progress } from '@/app/types';
import type { Exercice } from '@/app/types/exercice';
import type { JournalNote } from '@/app/types/journal';
import { shareText } from './share-api';
import { formatProgressForShare, formatExerciceForShare, formatJournalNoteForShare } from './formatters';

/**
 * Partage un progrès en texte
 */
export async function shareProgressAsText(progress: Progress): Promise<void> {
  const message = formatProgressForShare(progress);
  await shareText(message, 'Mon progrès sur Synapso');
}

/**
 * Partage un exercice en texte
 */
export async function shareExerciceAsText(exercice: Exercice): Promise<void> {
  const message = formatExerciceForShare(exercice);
  await shareText(message, 'Exercice Synapso');
}

/**
 * Partage une note de journal en texte
 */
export async function shareJournalNoteAsText(note: JournalNote): Promise<void> {
  const message = formatJournalNoteForShare(note);
  await shareText(message, 'Note Synapso');
}

