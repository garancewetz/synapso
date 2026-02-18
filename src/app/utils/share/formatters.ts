import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Progress } from '@/app/types';
import type { Exercice } from '@/app/types/exercice';
import type { JournalNote } from '@/app/types/journal';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/app/constants/exercice.constants';

/**
 * Formate un progrès pour le partage (Mail, Messages, WhatsApp, etc.)
 * Format clair et motivant avec emoji, contenu et date
 */
export function formatProgressForShare(progress: Progress): string {
  const emoji = progress.emoji || '🌟';
  const date = format(new Date(progress.createdAt), 'd MMMM yyyy', { locale: fr });
  return `J'ai fait un nouveau progrès ! 🎉

${emoji} ${progress.content}
${date}`;
}

/**
 * Formate un progrès pour le partage (version simple, sans date)
 * Format : [Contenu]
 * Exemple : J'ai réussi à marcher 10 minutes sans aide
 */
export function formatProgressCleanForShare(progress: Progress): string {
  return `${progress.content}`;
}

/**
 * @deprecated Utiliser formatProgressForShare à la place
 */
export function formatProgressForWhatsApp(progress: Progress): string {
  return formatProgressForShare(progress);
}

/**
 * @deprecated Utiliser formatProgressCleanForShare à la place
 */
export function formatProgressCleanForWhatsApp(progress: Progress): string {
  return formatProgressCleanForShare(progress);
}

/**
 * Formate un exercice pour le partage (Mail, Messages, WhatsApp, etc.)
 * Format clair avec titre, catégorie et description
 */
export function formatExerciceForShare(exercice: Exercice): string {
  const categoryIcon = CATEGORY_ICONS[exercice.category] || '';
  const categoryLabel = CATEGORY_LABELS[exercice.category] || exercice.category;
  const categoryDisplay = `${categoryIcon} ${categoryLabel}`;
  
  let message = `Exercice Synapso 🧠\n\n`;
  message += `${exercice.name}\n\n`;
  message += `Catégorie : ${categoryDisplay}\n\n`;
  message += exercice.description.text;
  
  if (exercice.description.comment) {
    message += `\n\n${exercice.description.comment}`;
  }
  
  return message;
}

/**
 * Formate une note de journal pour le partage (Mail, Messages, WhatsApp, etc.)
 * Format clair avec titre, description et date optionnelle
 */
export function formatJournalNoteForShare(note: JournalNote): string {
  let message = `Note Synapso 📝\n\n`;
  message += note.title;

  if (note.description) {
    message += `\n\n${note.description}`;
  }

  if (note.date) {
    const date = format(new Date(note.date), 'd MMMM yyyy', { locale: fr });
    message += `\n\n${date}`;
  }

  return message;
}
