import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Progress } from '@/app/types';
import html2canvas from 'html2canvas';

/**
 * Charge une image depuis une URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Crée une image composite avec le logo Synapso et le texte du progrès
 */
export async function createProgressShareImage(progress: Progress): Promise<Blob> {
  const emoji = progress.emoji || '🌟';
  const date = format(new Date(progress.createdAt), 'd MMMM yyyy', { locale: fr });
  
  // Dimensions du canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Impossible de créer le contexte canvas');
  }

  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;

  // Fond blanc
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  try {
    // Charger le logo
    const logo = await loadImage('/logoBrain.png');
    const logoSize = 80;
    const logoX = 40;
    const logoY = 40;
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  } catch (error) {
    console.warn('Impossible de charger le logo, utilisation du texte uniquement', error);
  }

  // Configuration du texte
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  
  // Titre "Synapso"
  const titleY = 60;
  ctx.fillText('Synapso', 140, titleY);

  // Texte d'introduction
  ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#4B5563';
  const introY = 140;
  ctx.fillText("J'ai fait un nouveau progrès sur Synapso:", 40, introY);

  // Emoji et contenu du progrès
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#1F2937';
  const progressY = 200;
  const progressText = `${emoji} ${progress.content}`;
  // Gérer le texte long avec retour à la ligne
  const maxWidth = width - 80;
  const lines = wrapText(ctx, progressText, maxWidth);
  lines.forEach((line, index) => {
    ctx.fillText(line, 40, progressY + (index * 40));
  });

  // Date
  ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#6B7280';
  const dateY = progressY + (lines.length * 40) + 40;
  ctx.fillText(date, 40, dateY);

  // Convertir en blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Impossible de convertir le canvas en image'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Aide à gérer le retour à la ligne pour le texte long
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Formate un progrès pour le partage WhatsApp (fallback texte)
 * Format avec texte d'introduction, emoji, contenu et date
 */
export function formatProgressForWhatsApp(progress: Progress): string {
  const emoji = progress.emoji || '🌟';
  const date = format(new Date(progress.createdAt), 'd MMMM yyyy', { locale: fr });
  return `🌟 Synapso 🌟\n\n

J'ai fait un nouveau progrès:
${emoji} ${progress.content}
${date}`;
}

/**
 * Formate un progrès pour le partage WhatsApp (sans date)
 * Format : [Emoji] [Contenu]
 * Exemple : 🌟 J'ai réussi à marcher 10 minutes sans aide
 */
export function formatProgressCleanForWhatsApp(progress: Progress): string {
  return `${progress.content}`;
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
 * Partage un progrès avec une image composite (logo + texte)
 * @param progress - Le progrès à partager
 */
export async function shareProgressWithImage(progress: Progress): Promise<void> {
  try {
    // Créer l'image composite avec le logo et le texte
    const blob = await createProgressShareImage(progress);

    // Vérifier si l'API Web Share avec fichiers est disponible
    if (navigator.share) {
      try {
        const file = new File([blob], 'progres-synapso.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'Mon progrès sur Synapso',
        });
        return; // Partage réussi
      } catch (error) {
        // Si le partage échoue (par exemple sur desktop), utiliser le fallback
        console.warn('Partage via API échoué, utilisation du fallback', error);
      }
    }

    // Fallback : créer un lien de téléchargement et ouvrir WhatsApp Web
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progres-synapso-${format(new Date(progress.createdAt), 'yyyy-MM-dd')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Ouvrir WhatsApp Web après un court délai avec le texte formaté
    const message = formatProgressForWhatsApp(progress);
    setTimeout(() => {
      shareOnWhatsApp(`${message}\n\n(Image téléchargée)`);
    }, 500);
  } catch (error) {
    console.error('Erreur lors de la création de l\'image:', error);
    // Fallback vers le partage texte formaté si la création de l'image échoue
    const message = formatProgressForWhatsApp(progress);
    shareOnWhatsApp(message);
  }
}

/**
 * Capture une card de progrès en image et la partage
 * @param element - L'élément DOM à capturer
 * @param progress - Le progrès à partager
 */
export async function shareProgressImage(element: HTMLElement, progress: Progress): Promise<void> {
  try {
    // Essayer d'abord de créer une image composite avec le logo
    await shareProgressWithImage(progress);
    return;
  } catch (error) {
    console.warn('Impossible de créer l\'image composite, tentative de capture de la card', error);
  }

  try {
    // Fallback : capturer l'élément en canvas
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
    // Fallback vers le partage texte formaté si la capture échoue
    const message = formatProgressForWhatsApp(progress);
    shareOnWhatsApp(message);
  }
}

