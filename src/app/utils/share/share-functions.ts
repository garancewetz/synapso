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

// === Fonctions dépréciées (conservées pour compatibilité) ===

/** @deprecated Utiliser shareProgressAsText */
export async function shareProgressWithImage(progress: Progress): Promise<void> {
  await shareProgressAsText(progress);
}

/** @deprecated Utiliser shareProgressAsText */
export async function shareProgressImage(_element: HTMLElement, progress: Progress): Promise<void> {
  await shareProgressAsText(progress);
}

/** @deprecated Utiliser shareExerciceAsText */
export async function shareExerciceWithImage(exercice: Exercice): Promise<void> {
  await shareExerciceAsText(exercice);
}

/** @deprecated Utiliser shareExerciceAsText */
export async function shareExerciceImage(_element: HTMLElement, exercice: Exercice): Promise<void> {
  await shareExerciceAsText(exercice);
}
