import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Progress } from '@/app/types';

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
 * Ouvre WhatsApp avec un message pré-rempli
 * @param text - Le texte à partager (sera encodé en URI)
 */
export function shareOnWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank');
}

