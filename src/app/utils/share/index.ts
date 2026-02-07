/**
 * API de partage - Exports publics
 * Toutes les fonctions de partage sont accessibles depuis ce fichier
 */

// Formatters
export {
  formatProgressForShare,
  formatProgressCleanForShare,
  formatProgressForWhatsApp,
  formatProgressCleanForWhatsApp,
  formatExerciceForShare,
} from './formatters';

// Images
export {
  createProgressShareImage,
} from './progress-image';

export {
  createExerciceShareImage,
} from './exercice-image';

// API de partage
export {
  shareBlobAsFile,
  shareText,
  downloadBlob,
  sanitizeFilename,
} from './share-api';

// Fonctions de partage de haut niveau
export {
  shareProgressWithImage,
  shareProgressImage,
  shareExerciceWithImage,
  shareExerciceImage,
} from './share-functions';

// Utilitaires canvas (exportés pour usage avancé si nécessaire)
export {
  drawRoundedRect,
  wrapText,
  loadImage,
  canvasToBlob,
  getCategoryColorsForCanvas,
} from './canvas.utils';
