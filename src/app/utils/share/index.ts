/**
 * API de partage - Exports publics
 * Toutes les fonctions de partage sont accessibles depuis ce fichier
 */

// Formatters
export {
  formatProgressForShare,
  formatExerciceForShare,
  formatJournalNoteForShare,
} from './formatters';

// API de partage
export {
  shareBlobAsFile,
  shareText,
  downloadBlob,
  sanitizeFilename,
} from './share-api';

// Fonctions de partage de haut niveau
export {
  shareProgressAsText,
  shareExerciceAsText,
  shareJournalNoteAsText,
} from './share-functions';
