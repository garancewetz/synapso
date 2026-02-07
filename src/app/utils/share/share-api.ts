/**
 * API de partage centralisée
 * Factorise la logique de partage dupliquée entre progress et exercice
 */

/**
 * Partage un blob comme fichier via l'API Web Share ou télécharge en fallback
 */
export async function shareBlobAsFile(
  blob: Blob,
  filename: string,
  title: string,
  fallbackText?: string
): Promise<void> {
  if (typeof window === 'undefined' || !navigator.share) {
    downloadBlob(blob, filename);
    return;
  }

  try {
    const file = new File([blob], filename, { type: 'image/png' });

    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      throw new Error('Partage de fichiers non supporté');
    }

    await navigator.share({
      files: [file],
      title,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }

    console.warn('Partage via API échoué, utilisation du fallback', error);
    downloadBlob(blob, filename);

    if (fallbackText) {
      setTimeout(() => {
        shareText(fallbackText);
      }, 500);
    }
  }
}

/**
 * Partage un texte via l'API Web Share
 */
export async function shareText(text: string, title?: string): Promise<void> {
  if (typeof window === 'undefined' || !navigator.share) {
    return;
  }

  try {
    await navigator.share({
      text,
      title: title || 'Synapso',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }
    console.warn('Partage de texte échoué', error);
  }
}

/**
 * Télécharge un blob comme fichier
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') {
    throw new Error('downloadBlob ne peut être appelé que côté client');
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeFilename(filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize un nom de fichier pour éviter les caractères problématiques
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9-_.]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
