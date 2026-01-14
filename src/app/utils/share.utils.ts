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
 * Ouvre WhatsApp avec un message pré-rempli
 * @deprecated Cette fonction n'est plus utilisée pour éviter les problèmes de navigation dans les PWA
 * Utiliser l'API Web Share à la place
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
    // Capturer la card avec html2canvas pour une meilleure qualité visuelle
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Meilleure qualité sur les écrans haute résolution
      logging: false,
      useCORS: true,
      allowTaint: true,
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
    // L'API Web Share permet de choisir entre Mail, Messages, WhatsApp, etc.
    if (navigator.share) {
      try {
        const file = new File([blob], 'progres-synapso.png', { type: 'image/png' });
        
        // Vérifier si on peut partager ce type de fichier
        if (navigator.canShare && !navigator.canShare({ files: [file] })) {
          throw new Error('Partage de fichiers non supporté');
        }
        
        await navigator.share({
          files: [file],
          title: 'Mon progrès sur Synapso',
        });
        return; // Partage réussi - l'utilisateur a choisi l'application (Mail, Messages, WhatsApp, etc.)
      } catch (error) {
        // Si l'utilisateur annule, ne rien faire
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        // Sinon, continuer avec le fallback
        // Ne pas logger d'erreur si c'est juste que le partage de fichiers n'est pas supporté
      }
    }

    // Fallback pour desktop : télécharger l'image
    // Sur mobile, si l'API Web Share n'est pas disponible, on télécharge juste l'image
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progres-synapso-${format(new Date(progress.createdAt), 'yyyy-MM-dd')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Ne pas ouvrir WhatsApp automatiquement pour éviter les problèmes de navigation dans les PWA
  } catch (error) {
    console.error('Erreur lors de la capture:', error);
    // Si la capture échoue, essayer de partager le texte via l'API Web Share
    // L'API Web Share permet de choisir entre Mail, Messages, WhatsApp, etc.
    if (navigator.share) {
      try {
        const message = formatProgressForShare(progress);
        await navigator.share({
          text: message,
          title: 'Mon progrès sur Synapso',
        });
        return;
      } catch {
        // Si le partage échoue, ne rien faire
      }
    }
  }
}

