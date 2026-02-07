/**
 * @deprecated Utiliser les imports depuis '@/app/utils/share' à la place
 * Ce fichier est conservé pour la rétrocompatibilité
 * 
 * Toutes les fonctions ont été refactorisées et déplacées dans :
 * - @/app/utils/share/formatters - Formatage de texte
 * - @/app/utils/share/progress-image - Images de progrès
 * - @/app/utils/share/exercice-image - Images d'exercice
 * - @/app/utils/share/share-api - API de partage
 * - @/app/utils/share/share-functions - Fonctions de partage de haut niveau
 * - @/app/utils/share/canvas.utils - Utilitaires canvas
 */

// Réexport de toutes les fonctions pour rétrocompatibilité
export {
  // Formatters
  formatProgressForShare,
  formatProgressCleanForShare,
  formatProgressForWhatsApp,
  formatProgressCleanForWhatsApp,
  formatExerciceForShare,
  // Images
  createProgressShareImage,
  createExerciceShareImage,
  // Fonctions de partage
  shareProgressWithImage,
  shareProgressImage,
  shareExerciceWithImage,
  shareExerciceImage,
  // API de partage
  shareBlobAsFile,
  shareText,
  downloadBlob,
  sanitizeFilename,
  // Utilitaires canvas
  drawRoundedRect,
  wrapText,
  loadImage,
  canvasToBlob,
  getCategoryColorsForCanvas,
} from './share';

/**
 * @deprecated Utiliser l'API Web Share à la place
 * Ouvre WhatsApp avec un message pré-rempli
 */
export function shareOnWhatsApp(text: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank');
}
