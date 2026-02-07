import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import type { Progress } from '@/app/types';
import type { Exercice } from '@/app/types/exercice';
import { createProgressShareImage } from './progress-image';
import { createExerciceShareImage } from './exercice-image';
import { shareBlobAsFile, shareText, sanitizeFilename } from './share-api';
import { formatProgressForShare, formatProgressForWhatsApp, formatExerciceForShare } from './formatters';
import { canvasToBlob } from './canvas.utils';

/**
 * Partage un progrès avec une image composite (logo + texte)
 * @param progress - Le progrès à partager
 */
export async function shareProgressWithImage(progress: Progress): Promise<void> {
  try {
    if (!progress || !progress.content) {
      throw new Error('Progress invalide: contenu manquant');
    }

    const blob = await createProgressShareImage(progress);
    const filename = `progres-synapso-${format(new Date(progress.createdAt), 'yyyy-MM-dd')}.png`;
    const fallbackMessage = formatProgressForWhatsApp(progress);
    
    await shareBlobAsFile(blob, filename, 'Mon progrès sur Synapso', fallbackMessage);
  } catch (error) {
    console.error('Erreur lors de la création de l\'image:', error);
    const message = formatProgressForWhatsApp(progress);
    await shareText(message, 'Mon progrès sur Synapso');
  }
}

/**
 * Capture une card de progrès en image et la partage
 * @param element - L'élément DOM à capturer
 * @param progress - Le progrès à partager
 */
export async function shareProgressImage(element: HTMLElement, progress: Progress): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('shareProgressImage ne peut être appelé que côté client');
  }

  try {
    if (!progress || !progress.content) {
      throw new Error('Progress invalide: contenu manquant');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const blob = await canvasToBlob(canvas);
    const filename = `progres-synapso-${format(new Date(progress.createdAt), 'yyyy-MM-dd')}.png`;
    
    await shareBlobAsFile(blob, filename, 'Mon progrès sur Synapso');
  } catch (error) {
    console.error('Erreur lors de la capture:', error);
    const message = formatProgressForShare(progress);
    await shareText(message, 'Mon progrès sur Synapso');
  }
}

/**
 * Partage un exercice avec une image composite (logo + texte)
 * @param exercice - L'exercice à partager
 */
export async function shareExerciceWithImage(exercice: Exercice): Promise<void> {
  try {
    if (!exercice || !exercice.name) {
      throw new Error('Exercice invalide: nom manquant');
    }

    const blob = await createExerciceShareImage(exercice);
    const sanitizedName = sanitizeFilename(exercice.name.toLowerCase());
    const filename = `exercice-synapso-${sanitizedName}-${format(new Date(), 'yyyy-MM-dd')}.png`;
    
    await shareBlobAsFile(blob, filename, 'Exercice Synapso');
  } catch (error) {
    console.error('Erreur lors de la création de l\'image:', error);
    const message = formatExerciceForShare(exercice);
    await shareText(message, 'Exercice Synapso');
  }
}

/**
 * Capture une card d'exercice en image et la partage
 * @param element - L'élément DOM à capturer (non utilisé, conservé pour compatibilité)
 * @param exercice - L'exercice à partager
 * @deprecated Utiliser shareExerciceWithImage à la place pour une meilleure qualité
 */
export async function shareExerciceImage(element: HTMLElement, exercice: Exercice): Promise<void> {
  await shareExerciceWithImage(exercice);
}
