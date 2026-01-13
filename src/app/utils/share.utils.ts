import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Progress } from '@/app/types';
import html2canvas from 'html2canvas';
import { extractProgressTags } from '@/app/utils/progress.utils';

/**
 * Formate un progrès pour le partage WhatsApp
 * Format : [Emoji] [Contenu] - [Date formatée]
 * Exemple : 🌟 J'ai réussi à marcher 10 minutes sans aide - 15 janvier 2025
 */
export function formatProgressForWhatsApp(progress: Progress): string {
  const emoji = progress.emoji || '🌟';
  const date = format(new Date(progress.createdAt), 'd MMMM yyyy', { locale: fr });
  return `${emoji} ${progress.content} - ${date}`;
}

/**
 * Formate un progrès clean pour le partage WhatsApp (sans date)
 * Format : [Emoji] [Contenu clean]
 * Exemple : 🌟 J'ai réussi à marcher 10 minutes sans aide
 */
export function formatProgressCleanForWhatsApp(progress: Progress): string {
  const emoji = progress.emoji || '🌟';
  const { cleanContent } = extractProgressTags(progress.content);
  return `${emoji} ${cleanContent}`;
}

/**
 * Ouvre WhatsApp avec un message pré-rempli
 * @param text - Le texte à partager (sera encodé en URI)
 */
export function shareOnWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank');
}

/**
 * Capture une card de progrès en image et la partage
 * @param element - L'élément DOM à capturer
 * @param progress - Le progrès à partager
 */
export async function shareProgressImage(element: HTMLElement, progress: Progress): Promise<void> {
  try {
    // Capturer l'élément en canvas
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // Meilleure qualité sur les écrans haute résolution
      logging: false,
    });

    // Convertir le canvas en blob avec Promise
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          reject(new Error('Impossible de convertir la capture en image'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    });

    // Vérifier si l'API Web Share avec fichiers est disponible
    if (navigator.share) {
      try {
        const file = new File([blob], 'progres.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'Mon progrès',
        });
        return; // Partage réussi
      } catch {
        // Si le partage échoue (par exemple sur desktop), utiliser le fallback
        // Ne pas throw, continuer avec le fallback
      }
    }

    // Fallback : créer un lien de téléchargement et ouvrir WhatsApp Web
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progres-${format(new Date(progress.createdAt), 'yyyy-MM-dd')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Ouvrir WhatsApp Web après un court délai
    const message = formatProgressForWhatsApp(progress);
    setTimeout(() => {
      shareOnWhatsApp(`${message}\n\n(Image téléchargée)`);
    }, 500);
  } catch (error) {
    console.error('Erreur lors de la capture:', error);
    // Fallback vers le partage texte clean si la capture échoue
    const message = formatProgressCleanForWhatsApp(progress);
    shareOnWhatsApp(message);
  }
}

